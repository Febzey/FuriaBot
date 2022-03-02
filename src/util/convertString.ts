import type { GuildMember } from 'discord.js';

export const convertWelcomeMessageString = (text: string, member?: GuildMember) => {
    let newText = text;

    const tagUserRegex = /<@>/; 
    const channelRegex = /(<(\d+)>)/;

    const matchesForChannel = channelRegex.exec(text);

    if (tagUserRegex.test(text)) {
        newText = newText.replace(/<@>/g, `<@${member.id}>`)
    } 

    if (matchesForChannel[2]) {
        newText = newText.replace(/<\d+>/g, `<#${matchesForChannel[2]}>`)
    } 

    return newText;
}