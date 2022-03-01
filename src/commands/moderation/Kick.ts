import { en_text }                              from '../../struct/config.js';
import type { CommandInteraction, GuildMember } from 'discord.js';
import type FuriaBot                            from '../../struct/discord/client.js';
import type { guild }                           from '../../../index';

export default {
    permissions: "KICK_MEMBERS",
    data: en_text.command.kick.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {
        
        const reason         = interaction.options.getString("reason");
        const silent         = interaction.options.getString("silent");
        const user           = interaction.options.getUser("user");
        let   member:          GuildMember;

        try { member = await interaction.guild.members.fetch(user.id) }
        catch { return client.ErrorHandler.userNotInGuild(interaction) }

        if (!member.kickable) return client.ErrorHandler.kick(interaction)

        await user.send(`> ${client.Iemojis.error} You have been **Kicked** from the guild **${interaction.guild.name}** ${reason ? `\`reason:\` ${reason}` : ""}`).catch(() => {})

        try {
            
            await member.kick();
            
            interaction.reply({
                content: `${client.Iemojis.success} <@${member.id}> has been **Kicked** ${reason ? `\`reason:\` ${reason}.` : ""}`,
                ephemeral: silent === "true" ? true : false
            })

            await client.Logger.kickedUser(member, `${interaction.user.username}#${interaction.user.discriminator}`, reason);


            return;
        }

        catch { 
            return client.ErrorHandler.kick(interaction);
        }

    }
}
