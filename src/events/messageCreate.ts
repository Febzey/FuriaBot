import type { Message, GuildMember } from 'discord.js';
import type FuriaBot                 from '../struct/discord/client.js';
import { ownerID }                   from '../struct/config.js';
import { antiSpam }                  from '../functions/moderate/antispam.js';
/**
 * Users who spam will be placed into the set.
 */
const map: Map<string,{ messages: number }> = new Map();

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content, member } = message;
        if (author.id === client.user.id) return;
        if (author.bot) return;

        if (channel.type === "DM") {
            return client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${author.tag}**`));
        }

        let currentGuild = client.guildHandler.GuildsCache.get(member.guild.id);

        if (!currentGuild) {
            currentGuild = await client.guildHandler.insertGuild(member.guild.id);
        }

        if (!currentGuild) return;
        currentGuild.anti_spam && antiSpam(map, message, client);

    }
}
