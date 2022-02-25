import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type { guild }              from '../../../index';
import type FuriaBot               from '../../struct/discord/client.js';

export default {
    permissions: ["MANAGE_ROLES"],
    data: en_text.command.unmute.data,
    run: async (interaction: CommandInteraction, guild: guild, client: FuriaBot) => {
        const member = await interaction.guild.members.fetch(interaction.options.getUser("user"))

        client.guildHandler.liftSentence(member.guild.id, member.user.id, "mute")

        return interaction.reply({
            content: `> ${client.Iemojis.success} lifted **timeout** for <@${member.id}>`,
            ephemeral: true
        })
    }
}
