import { Message }   from 'discord.js'
import type FuriaBot from '../../struct/discord/client'

export async function antiSpam(
    map: Map<string, { messages: number }>,
    message: Message,
    client: FuriaBot,
) {
    const { member, channel } = message;

    !map.has(member.id) && map.set(member.id, { messages: 0 });
    map.set(member.id, { messages: map.get(member.id).messages + 1 })

    const user = map.get(member.user.id);
        
    const messageCount = user.messages;

        if (messageCount === 5) {
            channel.send(`> <@${member.id}> Please do not spam.`)
                .then(msg => setTimeout(() => { msg.delete() }, 10000));
        }

        if (messageCount === 8) {
            await client.guildHandler.updateUser(member.guild.id, member.user.id, "warns")
            if (!member.moderatable) return;

            await member.timeout(1 * 60000, "Spamming.")
            await member.send(`> ${client.Iemojis.mute} You have been put on **timeout** for \`1 minute\` for spamming.`).catch(() => { })

            await client.Logger.mutedUser(member, client.user.tag, "Auto Mute - Spam", "1 minute")
        }
    

    return setTimeout(() => {
        map.delete(member.id);
    }, 4200);

}