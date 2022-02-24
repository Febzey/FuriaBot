import 'dotenv/config';
import Database    from './struct/database/pool.js';
import FuriaBot    from "./struct/discord/client.js";
import Logger      from "./util/Logger.js";
import { Options } from './struct/config.js';
import { Pool }    from 'mysql';

const options: Options                   = new Options;
export const logger: Logger              = new Logger;
export const db:     Pool                = (new Database(options.database)).database;
export const client: FuriaBot            = new FuriaBot(options.discord);

await client.login();