import type FuriaBot   from "./client";
import { GuildMember } from "discord.js";
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
                timestamp: new Date
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
                timestamp: new Date
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
                timestamp: new Date
            }],
        })
    }

    kickedUser = async (member: GuildMember, actionBy: string, reason?: string) => {
        const channel = await this.getLogChannel(member.guild.id);
        if (!channel) return;
        return await channel.send({
            embeds: [{
                color: colors.colors.filter(({ Blue }) => Blue)[0].Blue,
                title: `User Kicked. ${this.client.Iemojis.hammer}`,
                description: `

                > **User** *${member.user.username}#${member.user.discriminator}* has been kicked.
                > **Reason:** ${reason ? reason : "no reason specified."}
                > **Kicked by:** ${actionBy}
                `,
                timestamp: new Date
            }],
        })
    }



}