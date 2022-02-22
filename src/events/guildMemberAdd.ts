import { GuildMember, TextChannel, MessageAttachment } from 'discord.js';
import generateImage from '../util/generate/generateWelcomeImage.js';
import type { guild } from '../../index';
import type FuriaBot from '../struct/discord/client';
import _dirname from '../util/dirname.js';
import path from 'path';


export default {
    name: "guildMemberAdd",
    once: false,
    execute: async (member: GuildMember, client: FuriaBot) => {

        const guild: guild = client.guildHandler.guildContents.filter(item => item.guildID === member.guild.id)[0];
        
        if (!guild.welcome_c_id) return;

        const welcomeChannel = client.channels.cache.get(guild.welcome_c_id);
        if (welcomeChannel.type !== "GUILD_TEXT") return;

        const welcomeImage: MessageAttachment = await generateImage(member);

        welcomeChannel.send({
          content: `<@${member.id}> Welcome to the server!`,
          files: [welcomeImage]
        })

    }
}

