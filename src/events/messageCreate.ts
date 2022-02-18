import type { Message } from 'discord.js';
import type FuriaBot from '../struct/client.js';
import { ownerID } from '../config.js';



export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: FuriaBot) => {
        const { channel, author, content } = message;
        if (author.id === client.user.id) return;

        if (channel.type === "DM") {
            client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${user.tag}**`));
        }

    }

}
