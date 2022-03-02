import { 
    rootGuildID,
    loadCommandsBoolean, 
    Options, 
    config,
    presences 
}                              from '../config.js';
import { Collection, Client }  from 'discord.js';
import { readdir }             from 'fs/promises';
import { lstatSync }           from 'fs';
import { REST }                from '@discordjs/rest';
import { Routes }              from 'discord-api-types/v9';
import { logger }              from '../../index.js';
import _dirname                from '../../util/dirname.js';
import GuildHandler            from './guildHandler.js';
import ErrorHandler            from './errorHandler.js';
import path                    from 'path';
import Logger                  from './Logger.js';
import Iemojis                 from './Iemojis.js';

export default class FuriaBot extends Client {

    public disabledCommands:  string[];
    public commandCollection: any;
    public commands:          any[];
    public ErrorHandler:      ErrorHandler;
    public guildHandler:      GuildHandler;
    public Iemojis:           Iemojis;
    public presences:         any;
    public Logger:            Logger;   

    constructor(options: Options['discord']) {
        super(options)

        this.token             = process.env.token;
        this.disabledCommands  = config.disabledCommands || [];
        this.guildHandler      = new GuildHandler(this);
        this.ErrorHandler      = new ErrorHandler(this);
        this.Logger            = new Logger(this)
        this.commandCollection = new Collection();
        this.Iemojis           = new Iemojis;
        this.presences         = presences;
        this.commands          = [];

        this.on("ready", async () => {
            logger.discordReady(this.user.tag);
            this.handleEvents();
            await this.loadCommands();
            await this.guildHandler.getAllGuilds().catch(console.error);
            this.guildHandler.handleSentenceTime();
            this.guildHandler.clientActivity();
            this.user.setActivity("for commands", {type: "WATCHING"})
        })
    }

    public async handleEvents() {
        for (const file of (await readdir('./dist/events')).filter(file => file.endsWith(".js"))) {
            const event = (await import(`../../events/${file}`)).default;
            event.once
                ? this.once(event.name, (...args) => event.execute(...args, this))
                : this.on(event.name, (...args) => event.execute(...args, this))
        };
    }; 

    private async _loadCmd(file: string, dir?: string) {
        const command = dir ? await import(`../../commands/${dir}/${file}`) : await import(`../../commands/${file}`)        
        this.commands.push(command.default.data);
        this.commandCollection.set(command.default.data.name, command);
    
    };
    
    public async loadCommands() {
        for (const element of await readdir('./dist/commands')) {
            element.endsWith("js") && await this._loadCmd(element, "not dir");
            if (lstatSync(path.join(_dirname, '../commands', element)).isDirectory()) {
                for (const file of (await readdir(`./dist/commands/${element}`)).filter(file => file.endsWith(".js")))
                    await this._loadCmd(file, element)
            };
        };

        const rest: REST = new REST({ version: '9' }).setToken(this.token);
        const botID = this.user.id
    
        await rest.put(Routes.applicationGuildCommands(botID, rootGuildID), { body: this.commands }).catch(console.error);
        loadCommandsBoolean && await rest.put(Routes.applicationCommands(botID), { body: [] }).catch(console.error);
    };
};