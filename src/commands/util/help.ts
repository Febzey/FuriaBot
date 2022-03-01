import { en_text, colors } from '../../struct/config.js';
import type { CommandInteraction, GuildMember, Guild } from 'discord.js';
import type FuriaBot from '../../struct/discord/client.js';


export default {
    permissions: "MODERATE_MEMBERS",
    data: en_text.command.help.data,
    run: async (interaction: CommandInteraction, client: FuriaBot) => {
        
        const member = await interaction.guild.members.fetch(interaction.user.id);

        const createHelpEmbed = () => {
            return {
                color: colors.colors.filter(({ Violet }) => Violet)[0].Violet,
                title: 'Learn how to use my features.',
                thumbnail: {
                    url: `${client.user.displayAvatarURL({ format: 'png' })}`,
                },
                description: `
                **What can I do**?
                > - Ban members.
                > - Kick members.
                > - Mute members.
                > - basic utility features.
                > - Keep moderation logs in a channel.
                \u200b
                **Auto Moderate**.
                > - I can auto warn spammers, then eventually mute the user if they continue to spam.
                > - Detect malicious links and delete them.
                > - Feature for auto banning/kicking members if they reach a certain \`warn\` limit.
                \u200b
                **Banning a user**
                > \`\`\`/ban <user> <silent> <reason> <duration> \`\`\`
                > *user* - the user you want to ban.
                > *silent* - choose if you want this action to be silent.            
                > *reason* - the reason for banning the user.
                > *duration* - how long you want to ban the user for.
                \u200b
                **Kicking a user**
                > \`\`\`/kick <user> <silent> <reason> \`\`\`
                > *user* - the user you want to ban.
                > *silent* - choose if you want this action to be silent.            
                > *reason* - the reason for banning the user.
                \u200b
                **Muting a user**
                > \`\`\`/mute <user> <silent> <reason> <duration> \`\`\`
                > *user* - the user you want to ban.
                > *silent* - choose if you want this action to be silent.            
                > *reason* - the reason for banning the user.
                > *duration* - how long you want to ban the user for.
                \u200b
                **Warning a user**
                > \`\`\`/warn <user> <reason> \`\`\`
                > *user* - the user you want to warn.           
                > *reason* - the reason for warning the user.
                \u200b
                **Enable/Disable welcome messages**
                > \`\`\`/config toggle greetings <option> <channel>  \`\`\`
                > *option* - either disable or enable welcome messages.           
                > *channel* - select a channel for me to welcome users in.
                \u200b
                **Enable/Disable auto anti-spam**
                > \`\`\`/config toggle antispam <option>  \`\`\`
                > *option* - either disable or enable anti spam.   
                \u200b
                **Enable/Disable auto Auto-Moderate**
                > \`\`\`/config toggle automod <option> <maxwarns>  \`\`\`
                > *option* - either disable or enable auto moderate.
                > *maxwarns* - set the max amount of warnings a user can have until I automatically kick them from the guild.        
                \u200b
                \u200b
                **Moderation Logs**
                I can keep track and log all Moderation actions in a text channel,
                simply create a private channel with the name \`#furia-logs\` then give me the correct permissions to use the channel.
                \u200b
                \u200b
                **Durations**
                Here is where you can learn about duration formats.
                I accept the following formats for duration:
                \`\`\`
# = number (example: 15 minutes)
Seconds:
# second
# seconds
# secs
# sec
    
Minutes:
# minute 
# minutes
# mins 
# min  
    
Hours:
# h 
# hr  
# hrs
# hours
# hour
# h

Days: 
# d
# days 
# day

Weeks:
# weeks 
# week
# w             \`\`\`      
                `,
                timestamp: Date.now()
            }
        }

        try {
            await member.send({
                // ephemeral: true,
                embeds: [createHelpEmbed()],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Support discord",
                        style: 5,
                        url: "https://discord.gg/jyk7aBuFrT"
                    }]
                }]
            })
            return interaction.reply({
                content: `> ${client.Iemojis.success} I sent a help embed to you. Check you direct messages.`,
                ephemeral: true
            })

        }
        catch {
            return interaction.reply({
                ephemeral: true,
                embeds: [createHelpEmbed()],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Support discord",
                        style: 5,
                        url: "https://discord.gg/jyk7aBuFrT"
                    }]
                }]
            })
        }



    }
}