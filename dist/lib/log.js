"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors = require("colors");
/**
 * @file log
 */
var symbol = new Array(process.stdout.columns).fill('=').join('');
exports.default = {
    errorLog: function (err) {
        console.log(colors.red(symbol));
        console.log(colors.magenta(err.stack));
        console.log(colors.red(symbol));
    },
    infoLog: function (msg) {
        if (!msg.pop) {
            msg = [msg];
        }
        console.info(colors.green(symbol));
        msg.forEach(function (s) { return console.info('    ' + colors.magenta(s)); });
        console.info(colors.green(symbol));
    }
};
