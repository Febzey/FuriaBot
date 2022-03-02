import chalk from "chalk";
import type { Guild } from 'discord.js';

/**
 * Logging certain information to console.
 */

export default class Logger {
    Warn              = (text: string) => console.log(chalk.yellow(`⚠️ [WARNING]: ${text} ⚠️`))
    Error             = (text: string) => console.log(chalk.red(`❗❗[ERROR]: ${text} ❗❗`))
    discordReady      = (user: string) => console.info(chalk.bgBlack(chalk.green("DISCORD BOT CONNECTED. USER: " + user)))
    databaseConnected = (user: string, host: string) => console.info(chalk.green(`Database connection established.`,chalk.blue(`[USER]:`),chalk.cyan(`${user}`),chalk.blue(`[HOST]:`),chalk.cyan(`${host}`)))
    GuildJoined       = (guild: Guild) => console.info(chalk.green("Joined the guild:"), chalk.cyan(guild.name), chalk.blue(`Time: ${Date.now()}`))
    newGuildJoined    = (guild: Guild) => console.info(chalk.green("Joined the guild:"),chalk.cyan(guild.name),chalk.green("for the first time!"),chalk.blue(`Time: ${Date.now()}`))
}   