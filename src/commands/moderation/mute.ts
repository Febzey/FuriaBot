import { en_text }                              from '../../struct/config.js';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { convertTimeString }                    from '../../util/time/convertTime.js';
import type FuriaBot                            from '../../struct/discord/client.js';
import { logger }                               from '../../index.js';

export default {
    permissions: ["MODERATE_MEMBERS"],
    data: en_text.command.mute.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const duration  = interaction.options.getString("duration");
        const reason    = interaction.options.getString("reason");
        const silent    = interaction.options.getString("silent");
        let   member:     GuildMember

        try { member = await interaction.guild.members.fetch(interaction.options.getUser("user")) }
        catch { return client.ErrorHandler.userNotInGuild(interaction) }

        try {
            let muteTime = await convertTimeString(duration);
                muteTime = muteTime * 1000;
            
            await client.guildHandler.Moderation.muteUser({
                member:         member,
                actionBy:       interaction.user.tag,
                reason:         reason,
                duration:       muteTime,
                durationString: duration
            })

            return await interaction.reply({
                content: `> ${client.Iemojis.mute} <@${member.id}> has been **muted** ${reason ? `\`reason:\` ${reason}.` : ""} ${duration ? `\`duration:\` ${duration}` : ""}`,
                ephemeral: silent === "true" ? true : false
            })

        }

        catch (error) { 
            if (error === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            client.ErrorHandler.mute(interaction);
            logger.Error(`Error while trying to mute user in guild: ${interaction.guild.name}. Trace: ${error}`)
        };

    }
}
