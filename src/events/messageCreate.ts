import type { Message, GuildMember } from 'discord.js';
import type FuriaBot    from '../struct/discord/client.js';
import { ownerID }      from '../struct/config.js';
import generateImage from '../util/generate/generateWelcomeImage.js';

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content } = message;
        if (author.id === client.user.id) return;
        if (channel.id !== "939001256951824385") return;

        if (channel.type === "DM") {
            client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${user.tag}**`));
        }

        if (content === "simjoin") {
            const member: GuildMember = await message.guild.members.fetch(ownerID);

            const image = await generateImage(member);

            return channel.send({
                content: "Welcome to the server",
                files: [image]
            })

        }

    }

}
