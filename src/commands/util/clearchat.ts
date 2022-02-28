import { en_text}                  from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type FuriaBot               from '../../struct/discord/client.js';

export default {
    permissions: ["MANAGE_MESSAGES"],
    data: en_text.command.clearchat.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const amount = interaction.options.getString("amount");

        if (!+amount) return interaction.reply({
            content: `> ${client.Iemojis.error} the specified amount must be a **number**`,
            ephemeral: true
        })

        let numAmount = parseInt(amount);

        if (numAmount > 100) return interaction.reply({
            content: `> ${client.Iemojis.error} only a max of **100** messages can be deleted.`,
            ephemeral: true
        })

        try {

            const messages = await interaction.channel.messages.fetch({ limit: numAmount });
            messages.forEach(message => message.delete());

            return interaction.reply({
                content: `> ${client.Iemojis.success} Cleared **${numAmount}** messages.`,
                ephemeral: true,
            });

        }

        catch {
            return interaction.reply({
                content: `> ${client.Iemojis.error} an error occurred while trying to purge messages.`,
                ephemeral: true
            })
        }
    }
}