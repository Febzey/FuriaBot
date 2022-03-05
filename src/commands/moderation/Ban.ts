import { CommandInteraction }    from 'discord.js';
import { en_text }               from '../../struct/config.js';
import { convertTimeString }         from '../../util/time/convertTime.js';
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

            await user.send(`> ${client.Iemojis.hammer} You have been ${banIsPermanent ? "**Permanently**" : ""} **Banned** from the guild **${member.guild.name}** ${reason ? `\`reason:\` ${reason}.` : ""} ${!banIsPermanent ? `\`Duration\`: ${durationChoice}` : ""}`)
            .catch(() => logger.Warn(`Failed to send message to user: ${user.tag}`))
           
            //await member.ban();

            db.query(
                `USE discord; 
                INSERT IGNORE INTO banned (guildID,guildName,bannedID,userBanned,bannedBy,reason,duration) VALUES(?,?,?,?,?,?,?);
                `,
                [
                    interaction.guild.id,
                    interaction.guild.name,
                    member.user.id,
                    member.user.tag,
                    interaction.user.tag,
                    reason,
                    duration ? duration / 1000 : null,
                ],
                err => {
                    if (err) throw new Error(err.message);
                }
            )

            await client.guildHandler.updateUser(member.guild.id, member.user.id, "bans")
            .catch(error => logger.Error(`Error while trying to update user row: ${member.user.id} (${user.tag}). Trace: ${error}`))

            await interaction.reply({
                content: `> ${client.Iemojis.hammer} <@${user.id}> has been ${banIsPermanent ? "**Permanently**": ""} **Banned** ${reason ? `\`reason:\` ${reason}.` : ""} ${!banIsPermanent ? `\`Duration\`: ${durationChoice}`:""}`,
                ephemeral: silent === "true" ? true: false
            })

            await client.Logger.bannedUser(member, `${interaction.user.tag}`, reason, durationChoice);
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
