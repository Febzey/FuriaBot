import { CommandInteraction, Channel } from 'discord.js';
import { en_text }                     from '../../struct/config.js';
import type FuriaBot                   from '../../struct/discord/client.js';
import type { guild } from '../../../index';

export default {
    permissions: ["ADMINISTRATOR"],
    data: en_text.command.config.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {

        let guild: guild;

        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand      = interaction.options.getSubcommand();

        guild = client.guildHandler.GuildsCache.get(interaction.guild.id);

        if (!guild) {
            guild = await client.guildHandler.insertGuild(interaction.guild.id)
        }

        let choice:  String = interaction.options.getString("option")
        let channel: Channel;

        switch (subCommandGroup) {
            case 'toggle':
                switch (subCommand) {
                    case "greetings":
                        channel = interaction.options.getChannel("channel") as Channel;
                        if (channel.type !== "GUILD_TEXT")
                            return client.ErrorHandler.notTextChannel(interaction);
                        if (choice === "disable" && !guild.welcome_c_id)
                            return client.ErrorHandler.notEnabled(interaction);
                        try {
                            await client.guildHandler.updateWelcomeMessageId(interaction.guild.id, choice === "enable" ? channel.id : false)
                            return interaction.reply({
                                content: choice === "enable"
                                    ? `> **Enabled** ${client.Iemojis.success} I will welcome new users in the channel <#${channel.id}>.`
                                    : `> **Disabled** ${client.Iemojis.success} I will no longer use <#${guild.welcome_c_id}> to welcome new users.`,
                                ephemeral: true
                            })
                        }
                        catch { return client.ErrorHandler.unexpected(interaction) };

                    case "antispam":
                        try {
                            const opt = await client.guildHandler.toggleAntiSpam(interaction.guildId, choice);
                            return interaction.reply({
                                content: `> ${client.Iemojis.success} **Anti-Spam** has been ${opt === 1 ? "enabled." : "disabled."}`,
                                ephemeral: true
                            })
                        }
                        catch { return client.ErrorHandler.unexpected(interaction) }

                    case "automod":
                        try {
                            let max_warns: number | string = interaction.options.getString("maxwarns");
                            if (!+max_warns) return client.ErrorHandler.notNumber(interaction);
                            max_warns = parseInt(max_warns);
                            const opt = await client.guildHandler.toggleAutoMod(interaction.guildId, max_warns, choice);
                            return interaction.reply({
                                content: `> ${client.Iemojis.success} **Auto-Mod** has been ${opt === 1 ? "enabled." : "disabled."}`,
                                ephemeral: true
                            })
                        }
                        catch { return client.ErrorHandler.unexpected(interaction) }
                }
        }
    }
}