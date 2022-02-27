import { CommandInteraction, GuildMember, Role, } from 'discord.js';

export type guild = {
    guildID:       string,
    guildName:     string,
    ownerName:     string,
    cmd_c_id?:     null | string,
    welcome_c_id?: null | string,
    welcome_msg?:  null | string,
    leave_msg?:    null | string,
    created_at?:   null | string,
    anti_spam?:    0 | 1
}

export type MuteOptions = {
    member:      GuildMember,
    mutedRole:   Role,
    interaction: CommandInteraction
    reason?:     string,
    duration?:   string
}

export type UserHistory = {
    guild_id:   string, 
    user_id:    string, 
    warns:      number, 
    bans:       number, 
    muted:      number
}