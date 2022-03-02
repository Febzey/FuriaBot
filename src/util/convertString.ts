import type { GuildMember } from 'discord.js';

export const convertWelcomeMessageString = (text: string, member?: GuildMember) => {
    let newText = text;

    const tagUserRegex = /<@>/; 

    if (tagUserRegex.test(text)) {
        newText = text.replace(/<@>/g, `<@${member.id}>`)
    } 

    return newText;
}