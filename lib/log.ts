import colors = require('colors');

/**
 * @file log
 */

const symbol = new Array(process.stdout.columns).fill('=').join('');

export default {
    errorLog(err: Error) {
        console.log(colors.red(symbol));
        console.log(colors.magenta(err.stack));
        console.log(colors.red(symbol));
    },

    infoLog(msg: any) {
        if (!msg.pop) {
            msg = [msg];
        }

        console.info(colors.green(symbol));
        msg.forEach(s => console.info('    ' + colors.magenta(s)));
        console.info(colors.green(symbol));
    }
}