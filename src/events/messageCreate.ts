import { Message, Client, MessageAttachment } from 'discord.js';
import { ownerID } from '../config.js';
import { guildHandler } from '../index.js';


export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: Client) => {
        const { channel, author, content } = message;
        if (author.id === client.user.id) return;

        if (content.startsWith("p")) {
            guildHandler.handleBanTimeCheck()
        }

        if (channel.type === "DM") {
            client.users.fetch(ownerID).then(user => user.send(`${content} | **Sent by: ${user.tag}**`));
        }

    }

}
