import { GuildMember, MessageAttachment }              from 'discord.js';
import generateImage                                   from '../util/generate/generateWelcomeImage.js';
import type { guild }                                  from '../../index';
import type FuriaBot                                   from '../struct/discord/client';
import _dirname                                        from '../util/dirname.js';

export default {
    name: "guildMemberAdd",
    once: false,
    execute: async (member: GuildMember, client: FuriaBot) => {
        if (member.user.bot) return;

        const guild: guild = await client.guildHandler.getGuild(member.guild.id)      
        if (!guild || !guild.welcome_c_id) return;

        const welcomeChannel = client.channels.cache.get(guild.welcome_c_id);
        if (welcomeChannel.type !== "GUILD_TEXT") return;

        const welcomeImage: MessageAttachment = await generateImage(member);

        return welcomeChannel.send({
          content: `> <@${member.id}> Welcome to **${member.guild.name}**! You are member **#${member.guild.memberCount}**`,
          files: [welcomeImage]
        })

    }
}

