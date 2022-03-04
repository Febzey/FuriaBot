import { en_text }                                 from '../../struct/config.js';
import type { CommandInteraction }                 from 'discord.js';
import type FuriaBot                               from '../../struct/discord/client.js';
import type { reminderArgs, removeReminder }       from '../../../index';
import { logger }                                  from '../../index.js';
import { convertTimeString }                       from '../../util/time/convertTime.js';


export default {
    permissions: "SEND_MESSAGES",
    data: en_text.command.reminder.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const subCommand = interaction.options.getSubcommand();

        const member = interaction.member;

        try {
            switch (subCommand) {
                case "add":
    
                    const durationString: string|false = interaction.options.getString("duration");
                    const reminderText = interaction.options.getString("text");
    
                    let dur = Date.now() / 1000 + await convertTimeString(durationString);
            
                    const setReminderArgs: reminderArgs = {
                        user_id:    member.user.id,
                        guild_id:   interaction.guild.id,
                        text:       reminderText,
                        duration:   Math.trunc(dur),
                        channel_id: interaction.channel.id
                    }

                    const reminderID =  await client.guildHandler.setReminder(setReminderArgs)

                    return interaction.reply({
                        content: `> ${client.Iemojis.success} Success! I will remind you about this in ${durationString}.\n> \`Your reminder ID: ${reminderID}\``,
                        ephemeral: true
                    })
    
                case "remove":
                    const ID = interaction.options.getInteger("id")
                    const removeReminderArgs: removeReminder = {
                        user_id: member.user.id,
                        id: ID
                    }
            
                    const res: any = await client.guildHandler.removeReminder(removeReminderArgs);

                    if (res.affectedRows === 0) {
                        return interaction.reply({
                            content: `> ${client.Iemojis.error} A reminder with this ID was not found.`,
                            ephemeral: true
                        })
                    }

                    return interaction.reply({
                        content: `> ${client.Iemojis.success} Successfully removed your reminder.`,
                        ephemeral: true
                    })    
            }
        }

        catch (error) {
            if (error === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            client.ErrorHandler.unexpected(interaction);
            return logger.Error(`Error while trying to configure a reminder for user: ${interaction.user.tag} (${interaction.user.id} | Guild: ${interaction.guild.name} (${interaction.guild.id}. Trace: ${error}))`)
        
        }

    }
}