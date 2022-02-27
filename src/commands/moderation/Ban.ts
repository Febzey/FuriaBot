import { CommandInteraction }    from 'discord.js';
import { en_text }               from '../../struct/config.js';
import { getUnmuteTime } from '../../util/time/convertTime.js';
import type FuriaBot             from '../../struct/discord/client.js';
import { db }                    from '../../index.js';

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
            const duration: number = !banIsPermanent ? await getUnmuteTime(durationChoice) * 1000 + Date.now() : 9999999999

            await user.send(`> ${client.Iemojis.error} You have been ${banIsPermanent ? "**Permanently**" : ""} **Banned** from the guild **${member.guild.name}** ${reason ? `\`reason:\` ${reason}.` : ""} ${!banIsPermanent ? `\`Duration\`: ${durationChoice}` : ""}`).catch(() => {});

          //  await member.ban();

            db.query(
                `USE discord; 
                INSERT IGNORE INTO banned (guildID,guildName,bannedID,userBanned,bannedBy,reason,duration) VALUES(?,?,?,?,?,?,?);
                SELECT * FROM users WHERE user_id = ?
                `,
                [
                    interaction.guild.id,
                    interaction.guild.name,
                    member.user.id,
                    member.user.tag,
                    interaction.user.tag,
                    reason,
                    duration / 1000,
                    member.user.id
                ],
                (err, results) => {
                    if (err) throw new Error(err.message);

                    results[2].length === 0
                        ? db.query("USE discord; INSERT IGNORE INTO users (guild_id, user_id, warns, bans, muted) VALUES(?,?,?,?,?)",
                            [member.guild.id, member.user.id, 0, 1, 0],
                            err => {
                                if (err) throw new Error(err.message)
                            }
                        )
                        : db.query("USE discord; UPDATE users SET bans = bans + 1 WHERE user_id = ? AND guild_id = ?",
                            [member.user.id, member.guild.id],
                            err => {
                                if (err) throw new Error(err.message)
                            }
                        )

                }
            )

            return await interaction.reply({
                content: `> ${client.Iemojis.success} <@${user.id}> has been ${banIsPermanent ? "**Permanently**": ""} **Banned** ${reason ? `\`reason:\` ${reason}.` : ""} ${!banIsPermanent ? `\`Duration\`: ${durationChoice}`:""}`,
                ephemeral: silent === "true" ? true: false
            })


        }

        catch (err) { 
            if (err === "convert_time") return client.ErrorHandler.durationFormat(interaction); 
            return client.ErrorHandler.ban(interaction) 
        };
        
    }
}
