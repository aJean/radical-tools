"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var key_1 = require("./key");
/**
 * @file 加密
 */
exports.default = {
    dataEncode: function (data, split) {
        var cipher = crypto.createCipher('aes-256-cbc', key_1.default.code);
        var head = data.substring(0, 50);
        var body = data.substring(50);
        // 加密前 50 个字符
        var text = cipher.update(head, 'utf8', 'hex') + cipher.final('hex');
        return text + body + split;
    },
    keyDecode: function (data) {
        var list = data.split('~#~');
        var decipher1 = crypto.createDecipher('aes-256-cbc', key_1.default.secret);
        var decipher2 = crypto.createDecipher('aes-256-cbc', key_1.default.secret);
        return {
            key: decipher1.update(list[0], 'hex', 'utf8') + decipher1.final('utf8'),
            eof: decipher2.update(list[1], 'hex', 'utf8') + decipher2.final('utf8')
        };
    },
    keyEncode: function (domain) {
        var cipher1 = crypto.createCipher('aes-256-cbc', key_1.default.secret);
        var cipher2 = crypto.createCipher('aes-256-cbc', key_1.default.secret);
        var secretKey = cipher1.update(key_1.default.code, 'utf8', 'hex') + cipher1.final('hex');
        var EOF = key_1.default.len + '*' + (domain || '');
        var secretEOF = cipher2.update(EOF, 'utf8', 'hex') + cipher2.final('hex');
        return ('-----BEGIN PRIVATE KEY-----\n'
            + secretKey + '~#~' + secretEOF
            + '\n-----END PRIVATE KEY-----');
    }
};
