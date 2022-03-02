import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type FuriaBot               from '../../struct/discord/client.js';
import { logger }                  from '../../index.js';
import { convertTimeString }       from '../../util/time/convertTime.js';

export default {
    permissions: "SEND_MESSAGES",
    data: en_text.command.reminder.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const subCommand = interaction.options.getSubcommand();

        try {
            switch (subCommand) {
                case "add":
    
                    const durationString: string|false = interaction.options.getString("duration");
                    const reminderText = interaction.options.getString("text");
    
                    const dur = await convertTimeString(durationString) * 1000 + Date.now() / 1000;

                    console.log(durationString + " duration");
                    console.log(reminderText + " reminderText")
    
                    interaction.reply({
                        content: "Reminder set.",
                        ephemeral: true
                    })
    
                    break;
    
                case "remove":
    
                    const ID = interaction.options.getInteger("id")

                    console.log(ID)

                    interaction.reply({
                        content: "Reminder remove",
                        ephemeral: true
                    })
    
                    break;
    
            }
        }

        catch (error) {
            if (error === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            return logger.Error(`Error while trying to configure a reminder for user: ${interaction.user.tag} (${interaction.user.id} | Guild: ${interaction.guild.name} (${interaction.guild.id}. Trace: ${error}))`)
        }

    }
}