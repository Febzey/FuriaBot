import type { Message, GuildMember } from 'discord.js';
import type FuriaBot from '../struct/discord/client.js';
import type { guild } from '../../index';
import { ownerID } from '../struct/config.js';
import generateImage from '../util/generate/generateWelcomeImage.js';

/**
 * Users who spam will be placed into the set.
 */
const set: Set<{ id: string, time: number, messages: number }> = new Set();

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content, member } = message;
        if (author.id === client.user.id || !author.id || !member || !member.guild) return;

        const currentGuild: guild = await client.guildHandler.getCurrentGuild(member.guild.id);

        if (channel.type === "DM") {
            client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${author.tag}**`));
        }

        if (content === "simjoin") {
            if (channel.id !== "939001256951824385") return;
            const member: GuildMember = await message.guild.members.fetch(ownerID);
            const image = await generateImage(member);
            return channel.send({
                content: `> <@${member.id}> Welcome to **${member.guild.name}**! You are member **#${member.guild.memberCount}**`,
                files: [image],
            })
        }

        if (currentGuild.anti_spam && currentGuild.anti_spam === 1) {
            let user = {
                id: member.id,
                time: Date.now(),
                messages: 0
            }
    
            set.add(user);
    
            for (const u of set) {
    
                u.messages++;
                u.time = Date.now();
    
                if (u.messages > 6) channel.send(`> <@${u.id}> Please stop spamming, you will eventually be muted.`).then(m => setTimeout(() => { m.delete() }, 6000))
                if (u.messages > 8) {
                    member.timeout(2 * 60000, "Spamming.")
                    .then(async () => await member.send(`> ${client.Iemojis.error} You have been put on **timeout** for \`2 minutes\` for spamming.`).catch(() => {}))
                    .catch(() => {})
                }
    
                return setTimeout(() => {
                    set.delete(u);
                }, 3400);
    
            }

        }
    }

}
