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

        const rulesChannel = interaction.guild.rulesChannel;

        await member.send(`> ${client.Iemojis.warning} You have been **Warned** in the guild **${member.guild.name}**\n> \n> **Reason:** "${reason}"\n> \n> \`multiple warnings may result in a ban or kick.\`\n> ${rulesChannel ? `Consider reading the rules. <#${rulesChannel.id}>` : ""}`)
        .catch(() => {
            interaction.channel.send(`> ${client.Iemojis.warning} <@${member.id}> You have received a **Warning**\n> \n> **Reason:** "${reason}"\n> \n> \`multiple warnings may result in a ban or kick.\`\n> ${rulesChannel ? `Consider reading the rules. <#${rulesChannel.id}>` : ""}`)
            .then(m => setTimeout(async () => { await m.delete() }, 2 * 60000))
        });

        await client.guildHandler.updateUser(member.guild.id, member.user.id, "warns").catch(() => {});

        interaction.reply({
            content: `> ${client.Iemojis.success} ${user.username}#${user.discriminator} has been warned.`,
            ephemeral: true
        })

        await client.Logger.warnedUser(member, `${interaction.user.username}#${interaction.user.discriminator}`, reason);

        return;

    }
}