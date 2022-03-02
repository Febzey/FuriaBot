import { monthYear }               from '../../util/time/time.js';
import { db, logger }              from '../../index.js';
import type { guild, UserHistory } from '../../../index';
import type FuriaBot               from './client.js';
import type { ActivityOptions }    from 'discord.js';

export default class GuildHandler {
    public GuildsCache: Map<string, guild>;

    constructor(private client: FuriaBot) {
        this.GuildsCache = new Map();
    };

    /**
     * Handle bot's activity status.
     */
    clientActivity() {
        const presencesArray = this.client.presences.all;
        setInterval(() => {
            const presence = presencesArray[Math.floor(Math.random() * presencesArray.length)]
            this.client.user.setActivity(presence.activity, { type: presence.type } as ActivityOptions);
        }, 5 * 60000);
    }

    /**
     * Getting all guilds that are stored in the database then
     * pushing the contents to the guildContents array.
     */
    getAllGuilds() {
        return new Promise((resolve, reject) => {
            db.query(
                "USE discord; SELECT * FROM guilds",
                (err, results) => {
                    if (err) return reject(err.message);
                    for (const item of results[1]) {
                        this.GuildsCache.set(item.guildID, item);
                    }
                    resolve(true)
                }
            )
        })
    }

    /**
     * Inserting a new guild into the database
     * when the bot is invited to a new guild.
     */
    insertGuild(guildID: string): Promise<guild> {
        return new Promise((resolve, reject) => {
            db.query(
                `
                USE discord; INSERT IGNORE INTO guilds (guildID, created_at) VALUES (?,?);
                `,
                [guildID, monthYear(), guildID],
                async err => {
                    if (err) return reject(err.message);
                    const updatedGuild = await this.updateGuildsCache(guildID);
                    resolve(updatedGuild);
                }
            )
        })
    }

    /**
     * Updating a specific guild's contents in the guildContents array.
     * usually after we update a value in a row we will call this function
     * to have the most up to date data in our cache (this.GuildsCache)
    */
    updateGuildsCache(guildID: string): Promise<guild>{
        return new Promise((resolve, reject) => {
            db.query(
                "USE discord; SELECT * from guilds WHERE guildID = ?",
                [guildID],
                (err, results) => {
                    if (err) return reject(err.message);
                    this.GuildsCache.set(guildID, results[1][0]);
                    resolve(results[1][0]);
                }
            )
        })
    }


    /**
     * 
     * Checking if the guild exists in the database
     * @returns boolean
     */
    guildExists(guildId: string) {
        return new Promise((resolve, reject) => {
            db.query(
                "USE discord; SELECT * FROM guilds WHERE guildID = ?",
                [guildId], (err, results) => {
                    if (err) return reject(err.message)
                    results[1].length === 0 ? resolve(false) : resolve(true);
                }
            )

        })
    }

    /**
     * Setting the welcome message channel ID, this function is 
     * called when a admin enables welcome / leave messages within
     * their discord server.
     */
    updateWelcomeMessageSettings(guildID: string, channelID: string | boolean, welcomeMsg: string|null) {
        return new Promise(async (resolve, reject) => {
            if (!this.GuildsCache.has(guildID)) await this.insertGuild(guildID);
            db.query(
                "USE discord; UPDATE guilds SET welcome_c_id = ?, welcome_msg = ? WHERE guildID = ?",
                [channelID === false ? null : channelID, welcomeMsg, guildID],
                async err => {
                    if (err) return reject(err.message)
                    await this.updateGuildsCache(guildID).catch(() => {});
                    resolve(true);
                }
            )
        })
    }


    /**
     * Enabling or disabling anti spam within a guild.
     */
    toggleAntiSpam(guildID: string, option: String) {
        return new Promise(async (resolve, reject) => {
            const opt: number = option === "enable" ? 1 : 0
            db.query(
                "USE discord; UPDATE guilds SET anti_spam = ? WHERE guildID = ?",
                [opt, guildID],
                async err => {
                    if (err) return reject(err.message);
                    await this.updateGuildsCache(guildID).catch(() => {});
                    resolve(opt);
                }
            )
        })

    }

    /**
     * Enabling or disabling auto mod within a guild.
     */
    toggleAutoMod(guildID: string, max_warns:number|false, option: String) {
        return new Promise(async (resolve, reject) => {
            const opt: number = option === "enable" ? 1 : 0
            db.query(
                "USE discord; UPDATE guilds SET auto_mod = ?, max_warns = ? WHERE guildID = ?",
                [opt, max_warns, guildID],
                async err => {
                    if (err) return reject(err.message);
                    await this.updateGuildsCache(guildID).catch(() => {});
                    resolve(opt);
                }
            )
        })

    }


    timesUp = (duration: number) => {
        if (Date.now() / 1000 < duration) return false;
        return true;
    }

    liftSentence (guildId: string, userId: string, type: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const guild = await this.client.guilds.fetch(guildId);
                switch (type) {
    
                    case "mute":
                        const member = await guild.members.fetch(userId);
                        await member.timeout(null);
                        await member.send(`> ${this.client.Iemojis.success} Your **Timeout** has expired in the guild **${guild.name}** `).catch(() => { });
                        return resolve(true);

                    case "ban":
                        await guild.members.unban(userId);
                        db.query("USE discord; DELETE FROM banned WHERE guildID = ? AND bannedID = ?", [guildId, userId]);
                        return resolve(true);
                }
    
            }
            catch (error) { 
                logger.Error(`Error while trying to lift sentence (${type}) for userId: ${userId} | guildId: ${guildId} `)
                return reject(error);
            };
         })

    }

    /**
     * Handle check ban time,
     * this will run on an interval.
     */
    handleTimes() {
        setInterval(() => {
            db.query(
                `
                USE discord; 
                SELECT guildID, bannedID, userBanned, guildName, duration FROM banned;
                `,
                async (err, results) => {
                    if (err) return logger.Error("Error while checking Sentence times. Trace: " + err.message);
                    const bannedUsers = results[1];
                    for (const user of bannedUsers) {
                        if (user.duration === null || !this.timesUp(user.duration) || !user) return;
                        await this.liftSentence(user.guildID, user.bannedID, "ban")
                        .catch(error => logger.Error(`I was not able to unban userId: ${user.bannedID} | guildId: ${user.guildID} | Trace: ${error}`));
                    }
                }
            )
        }, 10000);
    }

    /**
     * Getting user row from users table.
     */
    getUser(guildId: string, userId: string): Promise<Array<UserHistory> | any[]> {
        return new Promise((resolve, reject) => {
            db.query("USE discord; SELECT * FROM users WHERE guild_id = ? and user_id = ?",
                [guildId, userId],
                (err, results) => {
                    if (err) return reject(err.message);
                    return resolve(results[1]);
                }
            )
        })
    }

    /**
     * Updating certain things in the users row,
     * will create a new row if doesnts exist.
     */
    updateUser(guildId: string, userId: string, type: string) {
        return new Promise((resolve, reject) => {
            db.query("USE discord; SELECT user_id FROM users WHERE guild_id = ? AND user_id = ?",
                [guildId, userId],
                (err, results) => {
                    if (err) return reject(err.message);

                    results[1].length === 0
                        ? db.query(
                            `USE discord; 
                            INSERT IGNORE INTO users (guild_id, user_id, warns, bans, muted) VALUES(?,?,?,?,?);
                            UPDATE users SET ${type} = ${type} + 1 WHERE user_id = ? and guild_id = ?;
                            `,
                            [guildId, userId, 0, 0, 0, userId, guildId],
                            err => {
                                if (err) return reject(err.message);
                                resolve(true);
                            }
                        )
                        : db.query(
                            `USE discord; UPDATE users SET ${type} = ${type} + 1 WHERE user_id = ? AND guild_id = ?`,
                            [userId, guildId],
                            err => {
                                if (err) return reject(err.message);
                                this.atMaxWarnings(guildId, userId);
                                resolve(true)
                            }
                        )
                }
            )
        })
    }

    /**
     * Checking if the user is at max warnings.
    */
    async atMaxWarnings(guildId: string, userId: string) {
        const user        = await this.getUser(guildId, userId);
        const guild_local = this.GuildsCache.get(guildId);

        if (!user[0] || !guild_local) return;

        const maxWarnCount  = guild_local.max_warns;
        const userWarnCount = user[0].warns;

        if ((maxWarnCount && userWarnCount) && (userWarnCount >= maxWarnCount)) {
            const guild  = await this.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            if (!member.kickable) return;
            await member.send(`> ${this.client.Iemojis.hammer} You have been **kicked** from the guild **${member.guild.name}** for receiving **${maxWarnCount}/${maxWarnCount}** warnings.`)
            .catch(() => logger.Warn(`Failed to send message to user: ${member.user.tag}`));
            await member.kick().catch(() => { });
            await this.client.Logger.kickedUser(member, this.client.user.tag, "Spamming")
            return;
        }
        
        return;
   
    }

}