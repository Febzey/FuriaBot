import { monthYear }     from '../../util/time/time.js';
import { db, logger }            from '../../index.js';
import type { guild }    from '../../../index';
import type FuriaBot     from './client.js';


export default class GuildHandler {
    public guildContents: Array<guild>;

    constructor(private client: FuriaBot) { };

    /**
     * Getting all guilds that are stored in the database then
     * pushing the contents to the guildContents array.
     */
    getAllGuildContent() {
        return new Promise(resolve => {
            db.query(
                "USE discord; SELECT * FROM guilds",
                (err, results) => {
                    if (err) throw new Error(err.message);
                    resolve(this.guildContents = results[1])
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
        return new Promise(resolve => {
            console.log(guildId)
            db.query(
                "USE discord; SELECT * FROM guilds WHERE guildID = ?",
                [guildId], (err, results) => {
                    if (err) throw new Error(err.message);
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
     updateWelcomeMessageId(guildID: string, channelID: string | boolean) {
        return new Promise(resolve => {
            db.query(
                "USE discord; UPDATE guilds SET welcome_c_id = ? WHERE guildID = ?",
                [channelID === false ? null : channelID, guildID],
                err => {
                    if (err) throw new Error(err.message)
                    this.updateSpecificGuildContent(guildID);
                    resolve(true);
                }
            )
        })
    }

    /**
     * Updating a specific guild's contents in the guildContents array.
     * usually after we update a value in a row we will call this function
     * to have the most up to date data in our cache (this.guildContents)
    */
    updateSpecificGuildContent(guildID: string) {
        db.query(
            "USE discord; SELECT * from guilds WHERE guildID = ?",
            [guildID],
            (err, results) => {
                if (err) throw new Error(err.message);
                const newArray = this.guildContents.filter(item => item.guildID !== results[1][0].guildID);
                return this.guildContents = [...newArray, results[1][0]];
            }
        )
    }


    /**
     * Inserting a new guild into the database
     * when the bot is invited to a new guild.
     */
    insertGuild(guildID: string, guildName: string, ownerName: string) {
        db.query(
            "USE discord; INSERT INTO guilds (guildID, guildName, ownerName, created_at) VALUES (?,?,?,?)",
            [guildID, guildName, ownerName, monthYear()],
            err => err ? console.error(err.message) : this.getAllGuildContent()
        )
    }



    private timesUp = (duration: number) => {
        if (Date.now() / 1000 < duration) return false;
        return true;
    }

    public liftSentence = async (guildId: string, userId: string, type: string) => {
        try {
            
            const guild  = await this.client.guilds.fetch(guildId);
        
            switch (type) {
         
                case "mute":
                    const member = await guild.members.fetch(userId);
                    await member.timeout(null);
                    return await member.send(`> ${this.client.Iemojis.success} Your **Timeout** has expired in the guild **${guild.name}** `).catch(() => {});  
         
                case "ban":
                    await guild.members.unban(userId).catch(() => {});
                    db.query("USE discord; DELETE FROM banned WHERE guildID = ? AND bannedID = ?", [guildId, userId]);
                    return;
            }
        
        }
        catch { logger.liftSentence(guildId, userId) };
    }

    /**
     * Handle check ban time,
     * this will run on an interval.
     */
    handleSentenceTime() {
        setInterval(() => {
            db.query(
                `
                USE discord; 
                SELECT guildID, bannedID, userBanned, guildName, duration FROM banned;
                `,
                async (err, results) => {
                    if (err) throw new Error(err.message);
                    const bannedUsers = results[1];
                    for (const user of bannedUsers) {
                        if (!this.timesUp(user.duration) || !user) return;
                        this.liftSentence(user.guildID, user.bannedID, "ban")
                    }
    
                }
    
            )
        }, 5000);

    }


}