import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type FuriaBot               from '../../struct/discord/client.js';
import { getUnmuteTime }           from '../../util/time/convertTime.js';

export default {
    permissions: ["MODERATE_MEMBERS"],
    data: en_text.command.mute.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const duration  = interaction.options.getString("duration");
        const reason    = interaction.options.getString("reason");
        const silent    = interaction.options.getString("silent");
        const member    = await interaction.guild.members.fetch(interaction.options.getUser("user"))

        try {
            let muteTime = await getUnmuteTime(duration);
                muteTime = muteTime * 1000;
            
            await member.timeout(muteTime, reason ? reason : "No reason specified")
            await member.send(`> ${client.Iemojis.mute} You have been put on **timeout** in the guild **${member.guild.name}** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`).catch(() => {});

            await client.guildHandler.updateUser(member.guild.id, member.user.id, "muted").catch(() => {});

            await interaction.reply({
                content: `> ${client.Iemojis.mute} <@${member.id}> has been **muted** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`,
                ephemeral: silent === "true" ? true : false
            })

            await client.Logger.mutedUser(member, `${interaction.user.username}#${interaction.user.discriminator}`, reason, duration);
            
            return;

        }

        catch (err) { 
            if (err === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            return client.ErrorHandler.mute(interaction);
         };

    }
}
