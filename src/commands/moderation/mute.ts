import { en_text }                 from '../../struct/config.js';
import type { CommandInteraction } from 'discord.js';
import type { guild }              from '../../../index';
import type FuriaBot               from '../../struct/discord/client.js';
import { db }                      from '../../index.js';
import { getUnmuteTime }           from '../../util/time/convertTime.js';

export default {
    permissions: ["MANAGE_ROLES"],
    data: en_text.command.mute.data,
    run: async (interaction: CommandInteraction, guild: guild, client: FuriaBot) => {

        const duration  = interaction.options.getString("duration");
        const reason    = interaction.options.getString("reason");
        const silent    = interaction.options.getString("silent");
        const member    = await interaction.guild.members.fetch(interaction.options.getUser("user"))
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === "muted");

        if (!mutedRole)
            return client.ErrorHandler.noMutedRole(interaction);

        if (member.roles.cache.find(role => role.name === mutedRole.name))
            return client.ErrorHandler.alreadyMuted(interaction)

        try {

            const muteTime = await getUnmuteTime(duration);
            await member.roles.add(mutedRole);
            await member.send(`> ${client.Iemojis.error} You have been **muted** in the guild **${member.guild.name}** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`).catch(() => {});
            
            db.query(
                "USE discord; INSERT IGNORE into muted (guildID, mutedID, reason, duration) VALUES(?,?,?,?)",
                [member.guild.id, member.id, reason, Math.floor(Date.now() / 1000 + muteTime)]
            )     

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
