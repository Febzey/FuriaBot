import date from 'date-and-time';
import TimeAgo from 'javascript-time-ago'
import { createRequire } from "module"; 
import moment from "moment";
const require = createRequire(import.meta.url); 
const en = require('javascript-time-ago/locale/en.json') 
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US');


export const monthYear = () => {    
    const ddate = new Date();
    const p = date.compile("MMM DD/YY");
    return date.format(ddate as any, p);
}


export const dateTimeString = (t: any) => moment.unix(t / 1000).format("DD-MM-YYYY HH:mm:ss");


export const timeAgoStr = (time: number) => timeAgo.format(time);