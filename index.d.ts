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
    anti_spam?:    0 | 1,
    auto_mod?:     0 | 1,
    max_warns?:    number
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

export type reminderArgs = {
    user_id:    string,
    guild_id:   string,
    text:       string,
    duration:   number,
    channel_id: string
}

export type Reminder = {
    user_id:    string,
    guild_id:   string,
    text:       string,
    duration:   number,
    channel_id: string
    id:         number
}

export type removeReminder = {
    user_id: string,
    id:      number
};


export type unBanArgs = { 
    user_id:  string, 
    guild_id: string, 
    actionBy: string, 
    reason:   string 
}

export type unMuteArgs = unBanArgs;

export type warnUserArgs = {
    member:     GuildMember,
    actionBy:   string,
    reason:     string,
    channel_id: string
}

export type kickUserArgs = {
    member:     GuildMember,
    actionBy:   string,
    reason:     string,
}

export type banUserArgs = { 
    member:         GuildMember,
    actionBy:       string,
    reason:         string,
    duration:       number|false,
    durationString: string
}

export type muteUserArgs = {
    member:         GuildMember,
    actionBy:       string,
    reason:         string,
    duration:       number,
    durationString: string
}