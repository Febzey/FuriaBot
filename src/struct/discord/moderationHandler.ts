import type { 
    unMuteArgs,
    unBanArgs,
    warnUserArgs,
    banUserArgs,
    kickUserArgs,
    muteUserArgs
   }                  from '../../../index';
import type FuriaBot  from './client';
import { db, logger } from '../../index.js';


export default class ModerationHandler {
    constructor(public client: FuriaBot) { }

    /**
     * Unbanning a user.
     */
     unBan = (args: unBanArgs) => new Promise(async (resolve, reject) => {
        const { user_id, guild_id, actionBy, reason } = args;
        try {
            const guild = await this.client.guilds.fetch(guild_id);
            const user = this.client.users.cache.get(user_id);
            db.query("USE discord; DELETE FROM banned WHERE guildID = ? AND bannedID = ?", [guild.id, user_id]);
            await guild.members.unban(user_id);
            await this.client.Logger.unbanUser(user, guild_id, actionBy, reason);
            return resolve(true);
        } catch (error) {
            logger.Error(`Error while trying to unban user_id: ${user_id} | guildId: ${guild_id} | Trace: ${error} `)
            return reject(error);
        }
    })

    /**
     * Unmuting a user.
     */
    unMute = (args: unMuteArgs) => new Promise(async (resolve, reject) => {
        const { user_id, guild_id, actionBy, reason } = args;
        try {
            const guild = await this.client.guilds.fetch(guild_id)
            const member = await guild.members.fetch(user_id);
            await member.timeout(null);
            await this.client.Logger.unMuteUser(member, actionBy, reason)
            await member.send(`> ${this.client.Iemojis.success} Your **Timeout** has expired in the guild **${guild.name}** `).catch(() => { });
            return resolve(true);
        } catch (err) {
            logger.Error(`Error while trying to unmute user_id: ${user_id} | guildId: ${guild_id} `)
            return reject(err);
        }

    })

    /**
     * Banning a user.
     */
    banUser = (args: banUserArgs) => new Promise(async (resolve, reject) => {
        const { member, actionBy, reason, duration, durationString } = args;
        try {

            await member.send(`You have been **${!duration ? "Permanently ":""}Banned** in **${member.guild.name}**. \`Reason:\` ${reason ? reason : "No reason specified."} ${durationString ? `\`Duration:\` ${durationString}` :""}`)
            .catch(() => { });

            await member.ban();
            await this.client.Logger.bannedUser(member, actionBy, reason, durationString);
            return db.query(
                `
                USE discord;
                INSERT IGNORE INTO banned (guildID,bannedID,bannedBy,reason,duration) VALUES(?,?,?,?,?);
                INSERT IGNORE INTO users (guild_id, user_id) VALUES (?,?);
                UPDATE users SET bans = bans + 1 WHERE user_id = ? AND guild_id = ?;
                `,
                [
                    member.guild.id, 
                    member.user.id, 
                    actionBy, 
                    reason, 
                    duration ? duration / 1000 : null,
                    member.guild.id,
                    member.user.id,
                    member.user.id,
                    member.guild.id
                ],
                err => {
                    if (err) return reject(err.message);
                    return resolve(true);
                }
            )
        } catch (err) {
            logger.Error(`Error while trying to ban user: ${member.user.tag} (${member.user.id}) in guild: ${member.guild.name} (${member.guild.id})`) 
            return reject(err);
        }
    })

    /**
     * Warning a user.
     */
    warnUser = (args: warnUserArgs) => new Promise(async (resolve, reject) => {
        const { member, actionBy, reason, channel_id } = args;
        const warnMessage: string = `> ${this.client.Iemojis.warning} You have been **Warned** in **${member.guild.name}** \`Reason:\` ${reason}`
        try {
            await member.send(warnMessage).catch(async () => {
                const channel = await member.guild.channels.fetch(channel_id);
                channel.type === "GUILD_TEXT" && channel.send(warnMessage);
            })

            await this.client.Logger.warnedUser(member, actionBy, reason);

            return db.query(
                `
                USE discord; 
                INSERT IGNORE INTO users (guild_id, user_id) VALUES (?,?);
                UPDATE users SET warns = warns + 1 WHERE user_id = ? AND guild_id = ?;
                `,
                [
                    member.guild.id, 
                    member.user.id, 
                    member.user.id, 
                    member.guild.id
                ],
                err => {
                    if (err) return reject(err.message);
                    this.atMaxWarnings(member.guild.id, member.user.id);
                    resolve(true)
                }
            )

        } catch(err) {
            return reject(err);
        }
    })

    /**
     * Kicking a user.
     */
    kickUser = (args: kickUserArgs) => new Promise(async (resolve, reject) => {
        const { member, actionBy, reason } = args;
        member.send(`> ${this.client.Iemojis.kick} You have been **Kicked** from **${member.guild.name}**. \`Reason:\` ${reason ? reason : "No reason specified."} `).catch(() => { });
        try {
            await member.kick();
            await this.client.Logger.kickedUser(member, actionBy, reason);
            return db.query(
                `
                USE discord; 
                INSERT IGNORE INTO users (guild_id, user_id) VALUES (?,?);
                UPDATE users SET kicks = kicks + 1 WHERE user_id = ? AND guild_id = ?;
                `,
                [
                    member.guild.id, 
                    member.user.id, 
                    member.user.id, 
                    member.guild.id
                ],
                err => {
                    if (err) return reject(err.message);
                    resolve(true)
                }
            )
            
        } catch(err) {
            return reject(err);
        }
    })

    muteUser = (args:muteUserArgs) => new Promise(async (resolve, reject) => {
        let { member, actionBy, reason, duration, durationString  } = args;
        if (!reason) reason = "No reason specified."; 
        
        await member.send(`> ${this.client.Iemojis.mute} You have been **muted** in **${member.guild.name}**. \`Reason:\` ${reason} \`Duration:\` ${durationString}`).catch(() => { });
        try {
            await member.timeout(duration, reason);
            await this.client.Logger.mutedUser(member, actionBy, reason, durationString);
            return db.query(
                `
                USE discord; 
                INSERT IGNORE INTO users (guild_id, user_id) VALUES (?,?);
                UPDATE users SET muted = muted + 1 WHERE user_id = ? AND guild_id = ?;
                `,
                [
                    member.guild.id, 
                    member.user.id, 
                    member.user.id, 
                    member.guild.id
                ],
                err => {
                    if (err) return reject(err.message);
                    resolve(true)
                }
            )
        } catch (err) {
            return reject(err.message);
        }
    })


    async atMaxWarnings(guildId: string, userId: string) {
        const user        = await this.client.guildHandler.getUser(guildId, userId);
        const guild_local = this.client.guildHandler.GuildsCache.get(guildId);

        if (!user[0] || !guild_local) return;

        const maxWarnCount  = guild_local.max_warns;
        const userWarnCount = user[0].warns;

        if ((maxWarnCount && userWarnCount) && (userWarnCount >= maxWarnCount)) {
            const guild  = await this.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            if (!member.kickable) return;
            return this.kickUser({member:member, actionBy:this.client.user.tag, reason: `Auto Kick - Received **${maxWarnCount}/${maxWarnCount}** warnings.`})
        }
        
        return;
   
    }

}