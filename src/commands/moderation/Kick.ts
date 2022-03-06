import { en_text }                              from '../../struct/config.js';
import { logger }                               from '../../index.js';
import type { CommandInteraction, GuildMember } from 'discord.js';
import type FuriaBot                            from '../../struct/discord/client.js';

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

        try {
            
            await client.guildHandler.Moderation.kickUser({
                member:   member,
                actionBy: interaction.user.tag,
                reason:   reason
            });

            return interaction.reply({
                content: `${client.Iemojis.kick} <@${member.id}> has been **Kicked** ${reason ? `\`reason:\` ${reason}.` : ""}`,
                ephemeral: silent === "true" ? true : false
            })
        }

        catch (error) { 
            client.ErrorHandler.kick(interaction);
            return logger.Error(`Error while trying to kick member in guild: ${interaction.guild.name}. Trace: ${error}`)
        }

    }
}
