import type FuriaBot   from "./client";
import { GuildMember, User } from "discord.js";
import { colors }       from '../../struct/config.js';

export default class ModActionLogger {
    public logChannelName: String = "furia-logs";

    constructor(private client: FuriaBot) {}

    getLogChannel = async (guild_id: string) => { 
        const guild      = await this.client.guilds.fetch(guild_id);
        const logChannel = guild.channels.cache.find(channel => channel.name === this.logChannelName);
        if (!logChannel || logChannel.type !== "GUILD_TEXT") return false;
        return logChannel;
    }    

    warnedUser = async (member: GuildMember, actionBy: string, reason?: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Orange }) => Orange)[0].Orange,
                title: `User warned. ${this.client.Iemojis.warning}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been warned.
                > **Reason:** ${reason ? reason : "no reason specified."}
                > **Warned by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${member.id}`
                 }
            }],
        })
    }

    bannedUser = async (member: GuildMember, actionBy: string, reason: string, duration: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ red }) => red)[0].red,
                title: `User Banned. ${this.client.Iemojis.hammer}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been banned.
                > **Reason:** ${reason ? reason : "no reason specified."}
                > **Duration:** ${duration ? duration : "no duration given"}
                > **Banned by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${member.id}`
                 }
                
            }],
        })
    }

    mutedUser = async (member: GuildMember, actionBy: string, reason: string, duration: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Purple }) => Purple)[0].Purple,
                title: `User Muted. ${this.client.Iemojis.mute}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been muted.
                > **Reason:** ${reason ? reason : "no reason specified."}
                > **Duration:** ${duration ? duration : "no duration given"}
                > **Muted by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${member.id}`
                 }
            }],
        })
    }

    kickedUser = async (member: GuildMember, actionBy: string, reason?: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Blue }) => Blue)[0].Blue,
                title: `User Kicked. ${this.client.Iemojis.kick}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been kicked.
                > **Reason:** ${reason ? reason : "no reason specified."}
                > **Kicked by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${member.id}`
                 }
            }],
        })
    }

    unbanUser = async (user: User, guild_id:string, actionBy: string, reason?: string) => {
        const channel = await this.getLogChannel(guild_id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Green }) => Green)[0].Green,
                title: `User Unbanned. ${this.client.Iemojis.success}`,
                description: `

                > **User** *${user.username}#${user.discriminator}* has been unbanned.
                > **Reason:** ${reason}
                > **Action by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${user.id}`
                 }
            }],
        })
    }

    unMuteUser = async (member: GuildMember, actionBy: string, reason?: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Green }) => Green)[0].Green,
                title: `User unmuted. ${this.client.Iemojis.success}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been unmuted.
                > **Reason:** ${reason}
                > **Action by:** ${actionBy}
                `,
                timestamp: new Date,
                footer: {
                    text: `ID: ${member.id}`
                 }
            }],
        })
    }

}