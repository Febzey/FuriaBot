/**
 * Returns the number of seconds for correct format.
 */

export const getUnmuteTime = (durationString: string): Promise<number> => {
    const regex = /(\d+)\s?([a-zA-Z]+)/;
    return new Promise((resolve, reject) => {
        const matches = regex.exec(durationString);
        if (!matches) return reject("convert_time");
        const givenTime: number = parseInt(matches[0]);
        switch (matches[2].toLowerCase()) {
            case "s":
            case "seconds":
            case "second":
            case "secs":
            case "sec":
                resolve(givenTime);

            case "m":
            case "minute":
            case "mins":
            case "min":
            case "minutes":
                resolve(givenTime * 60)
            
            case "h":
            case "hr":
            case "hour":
            case "hours":
                resolve(givenTime * 3600)
            
            case "d":
            case "days":
            case "day":
                resolve(givenTime * 86400)
            
            case "weeks":
            case "week":
            case "w":
                resolve(givenTime * 604800)


            default:
                reject("convert_time");
        }
    })
};