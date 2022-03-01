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

    for (const user of map) {
        const messageCount = user[1].messages;

        if (messageCount === 6 && user[0] === member.id) {
            channel.send(`> <@${member.id}> Please do not spam.`)
                .then(msg => setTimeout(() => { msg.delete() }, 10000));
        }

        if (messageCount === 10 && user[0] === member.id) {
            await client.guildHandler.updateUser(member.guild.id, member.user.id, "warns")
            if (!member.moderatable) return;
            member.timeout(1 * 60000, "Spamming.")
                .then(async () => await member.send(`> ${client.Iemojis.mute} You have been put on **timeout** for \`1 minute\` for spamming.`).catch(() => { }))
                .catch(() => { })
        }
    }

    return setTimeout(() => {
        map.delete(member.id);
    }, 3600);


}