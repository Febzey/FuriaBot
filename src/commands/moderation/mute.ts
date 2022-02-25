import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type { guild }              from '../../../index';
import type FuriaBot               from '../../struct/discord/client.js';
import { getUnmuteTime }           from '../../util/time/convertTime.js';

export default {
    permissions: ["MODERATE_MEMBERS"],
    data: en_text.command.mute.data,
    run: async (interaction: CommandInteraction, guild: guild, client: FuriaBot) => {

        const duration  = interaction.options.getString("duration");
        const reason    = interaction.options.getString("reason");
        const silent    = interaction.options.getString("silent");
        const member    = await interaction.guild.members.fetch(interaction.options.getUser("user"))

        try {
            let muteTime = await getUnmuteTime(duration);
                muteTime = muteTime * 1000;
            
            await member.timeout(muteTime, reason ? reason : "No reason specified")
            await member.send(`> ${client.Iemojis.error} You have been put on **timeout** in the guild **${member.guild.name}** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`).catch(() => {});

            return await interaction.reply({
                content: `> ${client.Iemojis.success} <@${member.id}> has been **muted** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`,
                ephemeral: silent === "true" ? true : false
            })

        }

        catch (err) { 
            if (err === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            return client.ErrorHandler.mute(interaction);
         };

    }
}
