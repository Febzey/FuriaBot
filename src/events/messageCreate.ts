import type { Message, GuildMember } from 'discord.js';
import type FuriaBot from '../struct/discord/client.js';
import type { guild } from '../../index';
import { ownerID } from '../struct/config.js';
import generateImage from '../util/generate/generateWelcomeImage.js';
import { antiSpam } from '../functions/moderate/antispam.js';
/**
 * Users who spam will be placed into the set.
 */
const map: Map<string,{ messages: number }> = new Map();

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content, member } = message;
        if (author.id === client.user.id || member.user.bot) return;

        const currentGuild: guild = await client.guildHandler.getGuild(member.guild.id);

        // if (channel.type === "DM") {
        //     client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${author.tag}**`));
        // }

        // if (content === "simjoin") {
        //     if (channel.id !== "939001256951824385") return;
        //     const member: GuildMember = await message.guild.members.fetch(ownerID);
        //     const image = await generateImage(member);
        //     return channel.send({
        //         content: `> <@${member.id}> Welcome to **${member.guild.name}**! You are member **#${member.guild.memberCount}**`,
        //         files: [image],
        //     })
        // }

        if (!currentGuild) return;
        currentGuild.anti_spam && antiSpam(map, message, client);

    }
}
