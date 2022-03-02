import type { Guild, User } from 'discord.js';
import type FuriaBot        from '../struct/discord/client.js';
import { logger }           from '../index.js';

export default {
    name: "guildCreate",
    once: false,
    execute: async (guild: Guild, client: FuriaBot) => {
       
        const user        = await client.users.fetch(guild.ownerId).catch(console.error) as User;
        const guildExists = await client.guildHandler.guildExists(guild.id).catch(() => {});

        if (!guildExists) {
            client.guildHandler.insertGuild(guild.id)
            logger.newGuildJoined(guild);

            await user.send({
                embeds: [{
                    color: '#ec4899',
                    description: "Hey, **thank you** for inviting me to your server, to learn how I work, use `/help` in a channel. 😺"
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 2, style: 5,
                        label: "Support Server",
                        url: "https://discord.gg/U6mn3j2RaS"
                    }]
                }]

            }).catch(() => logger.Warn(`Failed to send message to user: ${user.tag}`))

            return;

        }
        return logger.GuildJoined(guild);
    }
}