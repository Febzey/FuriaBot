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

        //TODO: Change commands from "/config <feature Name> toggle"
        //TODO: to "/config toggle <feature name>"

        switch (interaction.options.getSubcommandGroup()) {
            case 'greetings':
                switch (interaction.options.getSubcommand()) {
                    case "toggle":

                        choice  = interaction.options.getString("option")
                        channel = interaction.options.getChannel("channel") as Channel;

                        if (channel.type !== "GUILD_TEXT") return client.ErrorHandler.notTextChannel(interaction);
                        if (choice === "disable" && !guild.welcome_c_id) return client.ErrorHandler.notEnabled(interaction);

                        await client.guildHandler.updateWelcomeMessageId(interaction.guild.id, choice === "enable" ? channel.id : false)

                        return interaction.reply({
                            embeds: [{
                                color: choice === "enable" ? '#22c55e' : '#ef4444',
                                description: choice === "enable"
                                    ? `**Enabled** ${client.Iemojis.success} \nI will welcome new users in the channel <#${channel.id}>.`
                                    : `**Disabled** ${client.Iemojis.success} \nI will no longer use <#${guild.welcome_c_id}> to welcome new users.`
                            }],
                            ephemeral: true
                        })
                }
        }
    }
}