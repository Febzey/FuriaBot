import type { Message, GuildMember } from 'discord.js';
import type FuriaBot from '../struct/discord/client.js';
import type { guild } from '../../index';
import { ownerID } from '../struct/config.js';
import generateImage from '../util/generate/generateWelcomeImage.js';

/**
 * Users who spam will be placed into the set.
 */
const set: Map<string,{ messages: number, warned: boolean }> = new Map();

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content, member } = message;
        if (author.id === client.user.id || !author.id || !member || !member.guild || member.user.bot) return;

        const currentGuild: guild = await client.guildHandler.getGuild(member.guild.id);

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

        
        if (currentGuild) {
            if (currentGuild.anti_spam === 0) return;
            if (!set.has(member.id)) set.set(member.id, { messages: 0, warned: false });

            const user = set.get(member.id);
            set.set(member.id, { messages: user.messages + 1, warned: false })

            for (const u of set) {
                const msgCount = u[1].messages;

                if (msgCount === 6 && u[0] === member.id) {
                    channel.send(`> <@${member.id}> Please stop spamming, you will eventually be muted.`).then(m => setTimeout(() => { m.delete() }, 11000))
                    u[1].warned = true;
                }

                if (msgCount >= 10 && u[0] === member.id) {
                    member.timeout(2 * 60000, "Spamming.")
                    .then(async () => await member.send(`> ${client.Iemojis.error} You have been put on **timeout** for \`2 minutes\` for spamming.`).catch(() => {}))
                    .catch(() => {})
                }    
            }

            return setTimeout(() => {
                set.delete(member.id);
            }, 3000);
        }
    }
}
