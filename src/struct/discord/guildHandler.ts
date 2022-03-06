import type { guild, 
    UserHistory, 
    reminderArgs,
    Reminder,
    removeReminder
   }                                             from '../../../index';
import { monthYear }                             from '../../util/time/time.js';
import { db, logger }                            from '../../index.js';
import type FuriaBot                             from './client.js';
import type { ActivityOptions, Guild }           from 'discord.js';

import ModerationHandler from './moderationHandler.js';

export default class GuildHandler {
    public Moderation: ModerationHandler;
    public GuildsCache: Map<string, guild>;



    constructor(private client: FuriaBot) {
        this.GuildsCache = new Map();
        
        this.Moderation = new ModerationHandler(client);
    
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


    timesUp = (duration: number) => {
        if (Date.now() / 1000 < duration) return false;
        return true;
    }

    /**
     * Handle check ban time,
     * this will run on an interval.
     */
    handleTimes() { 
        const handleReminderTime = (reminders: any) => {
            for (const reminder of reminders) {
                if (this.timesUp(reminder.duration)) {
                return this.remindUser(reminder);
                }
            }
        }

        const handleBanTime = async (bannedUsers:any) => {
            for (const user of bannedUsers) {
                if (user.duration !== null || this.timesUp(user.duration) || user) {
                    this.Moderation.unBan({ 
                        user_id:  user.bannedID, 
                        guild_id: user.guildID, 
                        actionBy: this.client.user.tag, 
                        reason:   "Automatic Unban" 
                    })
                    .catch(() => { });
                }
            }
        }

        setInterval(() => {
            db.query(
                `
                    USE discord; 
                    SELECT guildID, bannedID, userBanned, guildName, duration FROM banned;
                    SELECT * FROM reminders;
                    `,
                async (err, results) => {
                    if (err) return logger.Error("Error while checking Sentence times. Trace: " + err.message);
                    
                    const bannedUsers = results[1];
                    const reminders   = results[2];

                    handleBanTime(bannedUsers);
                    handleReminderTime(reminders);

                }
            )
        }, 5000);
    }

    removeReminder = (args: removeReminder) => new Promise((resolve, reject) => {
        db.query(
            "USE discord; DELETE from reminders WHERE user_id = ? AND id = ?",
            [args.user_id, args.id],
            (err, results) => {
                if (err) return reject(err.message);
                resolve(results[1]);
            }
        )

    })

    setReminder = (args: reminderArgs) => new Promise((resolve, reject) => {
        db.query(
            "USE discord;INSERT IGNORE INTO reminders (user_id, guild_id, text, duration, channel_id) VALUES(?,?,?,?,?)",
            [args.user_id, args.guild_id, args.text, args.duration, args.channel_id],
            (err, results) => {
                if (err) return reject(err.message);
                return resolve(results[1].insertId);
            }
        )
    });

    remindUser = async (reminder: Reminder) => {
        try {
            const guild = await this.client.guilds.fetch(reminder.guild_id);
            const member = await guild.members.fetch(reminder.user_id);

            try {
                await member.send(`> **Hey!**  Remember that thing?? \n\n> \`\`${reminder.text}\`\``)
                return this.removeReminder({
                    user_id: reminder.user_id,
                    id: reminder.id
                })
            }
            catch {
                const channel = guild.channels.cache.find(channel => channel.id === reminder.channel_id);
                if (!channel || channel.type !== "GUILD_TEXT") return;
               
                channel.send(`> **Hey! Remember that thing?? \n\n>\`${reminder.text}\`**`)
               
                return this.removeReminder({
                    user_id: reminder.user_id,
                    id: reminder.id
                })
            }

        }
        catch { return };
    }

}