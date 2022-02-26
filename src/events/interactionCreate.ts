import { Interaction } from 'discord.js';
import buttonHandler                             from '../functions/interactionHandlers/ButtonHandler.js';
import commandHandler                            from '../functions/interactionHandlers/CommandHandler.js'
import type FuriaBot                             from '../struct/discord/client.js'

export default {
    name: "interactionCreate",
    once: false,
    execute: async (interaction: Interaction, client: FuriaBot) => {
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (interaction.isButton())  return buttonHandler(interaction, client);
        if (interaction.isCommand()) return commandHandler(interaction, client, member);


    }
}