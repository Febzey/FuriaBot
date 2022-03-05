import { CommandInteraction }    from 'discord.js';
import { en_text }               from '../../struct/config.js';
import { convertTimeString }     from '../../util/time/convertTime.js';
import type FuriaBot             from '../../struct/discord/client.js';
import { db, logger }            from '../../index.js';

export default {
    permissions: "BAN_MEMBERS",
    data: en_text.command.ban.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const reason            = interaction.options.getString("reason");
        const silent            = interaction.options.getString("silent");
        const durationChoice    = interaction.options.getString("duration");
        const user              = interaction.options.getUser("user");
        const member            = await interaction.guild.members.fetch(user.id);

        const banIsPermanent: boolean = !durationChoice ? true : false;
        
        if (!member.bannable) return client.ErrorHandler.ban(interaction);
        

        try { 

            const duration: number|false = !banIsPermanent 
                                           ? await convertTimeString(durationChoice) * 1000 + Date.now() 
                                           : false

            const banUserArgs = {
                member:         member,
                actionBy:       interaction.user.tag,
                reason:         reason, 
                duration:       duration,
                durationString: durationChoice 
            }

            await client.guildHandler.banUser(banUserArgs);

            await interaction.reply({
                content: `> ${client.Iemojis.hammer} <@${user.id}> has been ${banIsPermanent ? "**Permanently**": ""} **Banned** ${reason ? `\`reason:\` ${reason}.` : ""} ${!banIsPermanent ? `\`Duration\`: ${durationChoice}`:""}`,
                ephemeral: silent === "true" ? true: false
            })
            return
        }

        catch (err) { 
            if (err === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            client.ErrorHandler.ban(interaction);
            logger.Error(`Error while trying to ban user: ${user.tag} (${user.id}) in guild: ${member.guild.name} (${member.guild.id})`) 
            return;
        };
        
    }
}
