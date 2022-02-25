export const getCurrentUnixTimestampInSeconds = () => Date.now() / 1000;

export const durationChoiceConvert = (durationChoice: string) => {

    let duration: number;
    let durationString: string;
    const currentDate = getCurrentUnixTimestampInSeconds();

    switch (durationChoice) {
        case '1d':
            duration = currentDate + 86400
            durationString = "1 day"
            break;
        case '2d':
            duration = currentDate + 172800
            durationString = "2 days"
            break;
        case '3d':
            duration = currentDate + 259200
            durationString = "3 days"
            break;
        case '4d':
            duration = currentDate + 345600
            durationString = "4 days"
            break;
        case '5d':
            duration = currentDate + 432000
            durationString = "5 days"
            break;
        case '6d':
            duration = currentDate + 518400
            durationString = "6 days"
            break;
        case '7d':
            duration = currentDate + 604800
            durationString = "7 days"
            break;
        case '2w':
            duration = currentDate + 1209600
            durationString = "2 weeks"
            break;
        case 'perm':
            duration = 0
            durationString = "Permanent"
            break;
    }

    return {
        duration: Math.floor(duration),
        durationString: durationString
    }

}


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