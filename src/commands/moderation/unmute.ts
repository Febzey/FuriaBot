import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type FuriaBot               from '../../struct/discord/client.js';

export default {
    permissions: ["MODERATE_MEMBERS"],
    data: en_text.command.unmute.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {
       
        const member = await interaction.guild.members.fetch(interaction.options.getUser("user"))
       
        try {
            await client.guildHandler.liftSentence(member.guild.id, member.user.id, "mute")
            return interaction.reply({
                content: `> ${client.Iemojis.success} lifted **timeout** for <@${member.id}>`,
                ephemeral: true
            })
        }
        catch {
            return interaction.reply({
                content: `> ${client.Iemojis.error} I was not able to unmute <@${member.id}>. They may not be currently muted.`,
                ephemeral: true
            })

        }

    }
}
