import { PoolConfig }                           from "mysql";
import { readFile }                             from 'fs/promises';
import { ClientOptions, Intents, PartialTypes, PresenceData } from 'discord.js';

export const rootGuildID          = process.env.rootGuild;
export const loadCommandsBoolean  = process.env.loadCommandsBool === "true" ? true : false;
export const ownerID              = process.env.ownerID

export const en_text  = JSON.parse(await readFile('./lang/en/commands/commands.json') as any)
export const colors   = JSON.parse(await readFile('./colors.json') as any)
export const config   = JSON.parse(await readFile('./config.json') as any)
export const presences = JSON.parse(await readFile('./presences.json') as any);

class DatabaseOptions implements PoolConfig {
    host               = process.env.host;
    user               = process.env.user;
    password           = process.env.pass;
    multipleStatements = true
}

class DiscordSettings implements ClientOptions {
    partials: PartialTypes[] = ['CHANNEL']
    intents = [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ]
    disabledCommands: string[] = []
}

export class Options {
    database = new DatabaseOptions();
    discord  = new DiscordSettings();
};

