import { CommandInteraction, Channel } from 'discord.js';
import { en_text }                     from '../../struct/config.js';
import type { guild }                  from '../../../index';
import type FuriaBot                   from '../../struct/discord/client.js';


export default {
    permissions: ["ADMINISTRATOR"],
    data: en_text.command.config.data,
    run: async (interaction: CommandInteraction, guild: guild, client: FuriaBot) => {

        let choice:  String;
        let channel: Channel;

        choice = interaction.options.getString("option")

        switch (interaction.options.getSubcommandGroup()) {
            case 'toggle':
                switch (interaction.options.getSubcommand()) {
                    case "greetings":

                        channel = interaction.options.getChannel("channel") as Channel;

                        if (channel.type !== "GUILD_TEXT") return client.ErrorHandler.notTextChannel(interaction);
                        if (choice === "disable" && !guild.welcome_c_id) return client.ErrorHandler.notEnabled(interaction);

                        await client.guildHandler.updateWelcomeMessageId(interaction.guild.id, choice === "enable" ? channel.id : false)

                        return interaction.reply({
                            content: choice === "enable"
                            ? `> **Enabled** ${client.Iemojis.success} I will welcome new users in the channel <#${channel.id}>.`
                            : `> **Disabled** ${client.Iemojis.success} I will no longer use <#${guild.welcome_c_id}> to welcome new users.`,
                            ephemeral: true
                        })

                    case "antispam":
                        try {
                            const opt = await client.guildHandler.toggleAntiSpam(interaction.guildId, choice);
                            return interaction.reply({
                                content: `> ${client.Iemojis.success} **Anti-Spam** has been ${opt === 1 ? "enabled." : "disabled."}`,
                                ephemeral: true
                            })
                        }
                        catch { return client.ErrorHandler.unexpected(interaction) } 
                }
        }
    }
}