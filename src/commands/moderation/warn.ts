import { en_text }                              from '../../struct/config.js';
import type { CommandInteraction, GuildMember } from 'discord.js';
import type FuriaBot                            from '../../struct/discord/client.js';

export default {
    permissions: "MODERATE_MEMBERS",
    data: en_text.command.warn.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        const user         = interaction.options.getUser("user");
        const reason       = interaction.options.getString("reason");
        let   member:        GuildMember;

        try { member = await interaction.guild.members.fetch(user.id) }
        catch { return client.ErrorHandler.userNotInGuild(interaction) }

        const warnArgs = {
            member:     member,
            actionBy:   interaction.user.tag,
            reason:     reason,
            channel_id: interaction.channel.id
        }

        try {
            await client.guildHandler.Moderation.warnUser(warnArgs);

            return interaction.reply({
                content: `> ${client.Iemojis.success} ${user.username}#${user.discriminator} has been warned.`,
                ephemeral: true
            })
        }

        catch (err) {
            return client.ErrorHandler.unexpected(interaction);
        }

    }
}