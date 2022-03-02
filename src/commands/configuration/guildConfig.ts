import { CommandInteraction, Channel } from 'discord.js';
import { en_text }                     from '../../struct/config.js';
import { logger }                      from '../../index.js';
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
                       
                        let welcomeMessage = interaction.options.getString("welcomemessage");

                        if (!welcomeMessage) welcomeMessage = null;

                        if (channel && channel.type !== "GUILD_TEXT")
                            return client.ErrorHandler.notTextChannel(interaction);
                       
                        if (choice === "disable" && !guild.welcome_c_id)
                            return client.ErrorHandler.notEnabled(interaction);
                       
                        try {
                            await client.guildHandler.updateWelcomeMessageSettings(interaction.guild.id, choice === "enable" ? channel.id : false, welcomeMessage)
                            return interaction.reply({
                                content: choice === "enable"
                                    ? `> **Enabled** ${client.Iemojis.success} I will welcome new users in the channel <#${channel.id}>.`
                                    : `> **Disabled** ${client.Iemojis.success} I will no longer use <#${guild.welcome_c_id}> to welcome new users.`,
                                ephemeral: true
                            })
                        }
                        
                        catch (error) { 
                            client.ErrorHandler.unexpected(interaction)
                            return logger.Error(`Was not able to toggle welcome messages in guild: ${interaction.guild.name}. Trace: ${error}`);
                        };

                    case "antispam":
                        try {
                            const opt = await client.guildHandler.toggleAntiSpam(interaction.guildId, choice);
                            return interaction.reply({
                                content: `> ${client.Iemojis.success} **Anti-Spam** has been ${opt === 1 ? "enabled." : "disabled."}`,
                                ephemeral: true
                            })
                        }
                        
                        catch (error) { 
                            client.ErrorHandler.unexpected(interaction)
                            return logger.Error(`Was not able to toggle anti-spam in guild: ${interaction.guild.name}. Trace: ${error}`)
                         }

                    case "automod":
                        try {
                            let max_warns: number | string = interaction.options.getString("maxwarns");
                            if (!+max_warns) return client.ErrorHandler.notNumber(interaction);
                            max_warns = parseInt(max_warns);
                            const opt = await client.guildHandler.toggleAutoMod(interaction.guildId, max_warns, choice);
                            return interaction.reply({
                                content: `> ${client.Iemojis.success} **Auto Moderation** has been ${opt === 1 ? "enabled." : "disabled."}`,
                                ephemeral: true
                            })
                        }
                        catch (error) {
                            client.ErrorHandler.unexpected(interaction)
                            return logger.Error(`Was not able to toggle auto-mod in guild: ${interaction.guild.name}. Trace: ${error}`)
                        }
                }
        }
    }
}