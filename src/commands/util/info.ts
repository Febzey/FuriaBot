import { en_text, colors }                             from '../../struct/config.js';
import type { CommandInteraction, GuildMember, Guild } from 'discord.js';
import type FuriaBot                                   from '../../struct/discord/client.js';
import type { UserHistory }                            from '../../../index';
import { timeAgoStr, dateTimeString }                  from '../../util/time/time.js';
import { logger }                                      from '../../index.js';


export default {
    permissions: ["SEND_MESSAGES"],
    data: en_text.command.info.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        //@ts-ignore 
        const isMod      = interaction.member.permissions.has("BAN_MEMBERS")
        const subCommand = interaction.options.getSubcommand()
        
        const userEmbed = (member: GuildMember, userHistory?: Array<UserHistory>|any[]) => {
            const userStat = userHistory.length === 0
            ? { bans: 0, muted: 0, warns: 0 }
            : { bans: userHistory[0].bans, muted: userHistory[0].muted, warns: userHistory[0].warns }
                        
            return {
                color: colors.colors.filter(({ gray }) => gray)[0].gray,
                author: {
                    name: `Information about ${member.user.username}#${member.user.discriminator}`,
                    icon_url: `${member.displayAvatarURL({ format: 'png' })}`,
                },
                fields: [
                    {
                        name: "Account Creation Date",
                        value: `> ${timeAgoStr(member.user.createdTimestamp)} / ${dateTimeString(member.user.createdTimestamp)} ${client.Iemojis.cake}`,
                        inline: false
                    },
                    {
                        name: `${member.user.username} joined ${member.guild.name}:`,
                        value: `> ${timeAgoStr(member.joinedTimestamp)} / ${dateTimeString(member.joinedTimestamp)}`,
                        inline: false
                    },
                    isMod ? {
                        name: "History",
                        value: `> **Warnings:** ${userStat.warns} \n> **Bans:** ${userStat.bans} \n> **Times muted:** ${userStat.muted}`,
                        inline: false
                    } 
                    : {
                        name: '\u200b',
                        value: '\u200b',
                        inline: false,
                    },

                ],
                image: {
                    url: `${member.displayAvatarURL({ format: 'png' })}`
                }

            }
        }

        const serverEmbed = (guild: Guild) => {
            return {
                color: colors.colors.filter(({ gray }) => gray)[0].gray,
                author: {
                    name: `Information about ${guild.name}`,
                    icon_url: `${guild.iconURL()}`,
                },
                fields: [
                    {
                        name: "Creation Date",
                        value: `> ${timeAgoStr(guild.createdTimestamp)} / ${dateTimeString(guild.createdTimestamp)} ${client.Iemojis.cake}`,
                        inline: false
                    },
                    {
                        name: "Member Count",
                        value: `> **${guild.name}** currently has **${guild.memberCount}** members`, 
                        inline: false
                    },
                ],

            }
        }


        try {
            switch (subCommand) {
         
                case "user":
                    const user   = interaction.options.getUser("user");
                    const member = await interaction.guild.members.fetch(user.id);
                    const res    = await client.guildHandler.getUser(member.guild.id, member.user.id);
    
                    return interaction.reply({
                        embeds: [userEmbed(member, res)],
                        ephemeral: true
                    })
    
                case "server":
                    return interaction.reply({
                        embeds: [serverEmbed(interaction.guild)],
                        ephemeral: true
                    })
            }
        }
        catch (error) {
            return logger.Error(`Error while trying to perform /info command in guild: ${interaction.guild.name}. Trace: ${error}`)
        }
    


    }
}
