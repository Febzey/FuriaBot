import { Message }   from 'discord.js'
import type FuriaBot from '../../struct/discord/client'

export async function antiSpam(
    map: Map<string, { messages: number }>,
    message: Message,
    client: FuriaBot,
) {
    const { member, channel, content } = message;

    //if (!member.moderatable) return;

    if (!map.has(member.id)) {
        map.set(member.id, { messages: 0 })
    }

    map.set(member.id, { messages: map.get(member.id).messages + 1 })
    
    const user             = map.get(member.user.id);
    const messageCount     = user.messages;
    const userMentionRegex = /(@![a-z\d]+)/;

    /**
     * Checking if the users message is too long.
     */
    if (content.length > 1000) { 
        await message.delete().catch(() => {});
        channel.send(`> ${client.Iemojis.warning} <@${member.id}> Do not send messages this long.`);
        await client.guildHandler.Moderation.warnUser({
            member:     member,
            actionBy:   client.user.tag,
            reason:     "Auto warn - Too long of message",
            channel_id: channel.id
        }).catch(() => { });
    }

    /**
     * Checking if a user is mass mentioning other users.
     */
    if (message.mentions.users.size) {
        let mentionCount = 0;
        const contentSplit = content.split(" ");

        for (const word of contentSplit) {
            if (word.match(userMentionRegex)) mentionCount ++;
        }
        
        if (mentionCount > 5) {
            await message.delete().catch(() => {});

            channel.send(`> <@${member.id}> Do not mention that many users.`).then(msg => setTimeout(() => {msg.delete()}, 15000));
            await client.guildHandler.Moderation.warnUser({
                member:     member,
                actionBy:   client.user.tag,
                reason:     "Auto warn - Mass Mention",
                channel_id: channel.id
            }).catch(() => { });
        }

    }

    /**
     * Detecting if a user is spamming.
     */
    if (messageCount === 6) {
        channel.send(`> <@${member.id}> Please do not spam.`).then(msg => setTimeout(() => { msg.delete() }, 10000));
    }

    if (messageCount === 8) {
        await client.guildHandler.Moderation.warnUser({
            member: member,
            actionBy: client.user.tag,
            reason: "Auto warn - Spamming",
            channel_id: channel.id
        }).catch(() => { });

        await member.timeout(1 * 60000, "Spamming.")
        await member.send(`> ${client.Iemojis.mute} You have been put on **timeout** for \`1 minute\` for spamming.`).catch(() => { })

        await client.Logger.mutedUser(member, client.user.tag, "Auto Mute - Spam", "1 minute")
    }

    return setTimeout(() => {
        map.delete(member.id);
    }, 4200);

}