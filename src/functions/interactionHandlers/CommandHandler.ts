import type { CommandInteraction, GuildMember } from 'discord.js';
import type FuriaBot                            from '../../struct/discord/client';

export default async function commandHandler(interaction: CommandInteraction, client: FuriaBot) {

    const member:GuildMember = await interaction.guild.members.fetch(interaction.user.id);

    let { permissions, run } = client.commandCollection.get(interaction.commandName).default;

    if (permissions) {
        if (typeof permissions === "string") permissions = [permissions];

        for (const perm of permissions) {
            if (!member.guild.me.permissions.has(perm) && perm !== "ADMINISTRATOR")
                return client.ErrorHandler.noBotPermission(interaction, perm);

            if (!member.permissions.has(perm))
                return client.ErrorHandler.noUserPermission(interaction, perm);
        }
    }

    return run(interaction, client);

}