import { GuildMember }                from 'discord.js';
import type { guild }                 from '../../index';
import type FuriaBot                  from '../struct/discord/client';
import _dirname                       from '../util/dirname.js';
import { convertWelcomeMessageString} from '../util/convertString.js';

export default {
    name: "guildMemberAdd",
    once: false,
    execute: async (member: GuildMember, client: FuriaBot) => {
        if (member.user.bot) return;

        let guild: guild;
        guild = client.guildHandler.GuildsCache.get(member.guild.id);

        if (!guild) {
          guild = await client.guildHandler.insertGuild(member.guild.id)
        }

        const welcomeChannel = client.channels.cache.get(guild.welcome_c_id);
        if (!welcomeChannel || welcomeChannel.type !== "GUILD_TEXT") return;

        let welcomeMsg: string = `> <@${member.id}> Welcome to **${member.guild.name}**! You are member **#${member.guild.memberCount}**`;

        if (guild.welcome_msg) welcomeMsg = convertWelcomeMessageString(guild.welcome_msg, member);

        return welcomeChannel.send({
          content: welcomeMsg
        })

    }
}

