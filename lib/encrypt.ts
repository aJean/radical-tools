import crypto = require('crypto');
import Key from './key';

/**
 * @file 加密
 */

export default {
    dataEncode(data: string, split: string) {
        const cipher = crypto.createCipher('aes-256-cbc', Key.code);
        const head = data.substring(0, 50);
        const body = data.substring(50);

        // 加密前 50 个字符
        const text = cipher.update(head, 'utf8', 'hex') + cipher.final('hex');
        return text + body + split;
    },

    keyDecode(data: string) {
        const list = data.split('~#~');
        const decipher1 = crypto.createDecipher('aes-256-cbc', Key.secret);
        const decipher2 = crypto.createDecipher('aes-256-cbc', Key.secret);

        return {
            key: decipher1.update(list[0], 'hex', 'utf8') + decipher1.final('utf8'),
            eof: decipher2.update(list[1], 'hex', 'utf8') + decipher2.final('utf8')
        };
    },

    keyEncode(domain: string) {
        const cipher1 = crypto.createCipher('aes-256-cbc', Key.secret);
        const cipher2 = crypto.createCipher('aes-256-cbc', Key.secret);
        const secretKey = cipher1.update(Key.code, 'utf8', 'hex') + cipher1.final('hex');
        const EOF = Key.len + '*' + (domain || '');
        const secretEOF = cipher2.update(EOF, 'utf8', 'hex') + cipher2.final('hex');

        return ('-----BEGIN PRIVATE KEY-----\n'
            + secretKey + '~#~' + secretEOF
            + '\n-----END PRIVATE KEY-----');
    }
}