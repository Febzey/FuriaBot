import { en_text, colors }                  from '../../struct/config.js';
import type { CommandInteraction, GuildMember, Guild } from 'discord.js';
import type { guild }              from '../../../index';
import type FuriaBot               from '../../struct/discord/client.js';
import { timeAgoStr, dateTimeString } from '../../util/time/time.js';

export default { 
    permissions: ["SEND_MESSAGES"],
    data: en_text.command.info.data,
    run: async (interaction: CommandInteraction, thisGuild: guild, client: FuriaBot) => {

        const subCommand = interaction.options.getSubcommand()

        const userEmbed = (member: GuildMember) => {
            const embed = {
                color: colors.colors.filter(({gray}) => gray)[0].gray,
                author: {
                    name: `Information about ${member.user.username}`,
                    icon_url: `${member.displayAvatarURL({ format: 'png'})}`,
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
                ],
                image: {
                    url: `${member.displayAvatarURL({ format: 'png'})}`
                }
                
            }
            return embed;
        }

        const serverEmbed = (guild: Guild) => {
            const embed = {
                color: colors.colors.filter(({gray}) => gray)[0].gray,
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
            return embed;
        }
    
        
        switch (subCommand) {
            case "user":
                const user   = interaction.options.getUser("user");
                const member = await interaction.guild.members.fetch(user.id);

                return interaction.reply({
                    embeds: [userEmbed(member)],
                    ephemeral: false
                })
            
                case "server":
                return interaction.reply({
                    embeds: [serverEmbed(interaction.guild)],
                    ephemeral: false
                })
        }


    }
}
