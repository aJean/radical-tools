import fs = require('fs');
import path = require('path');
import images = require("images");
import encrypt from './encrypt';
import log from './log';
import Key from './key';

/**
 * @file 打包
 */

function getPath(url: string) {
    const preix = path.resolve('./');
    // absolute
    if (url[0] === '/') {
        return url;
    }

    if (!/\/$/.test(url)) {
        url += '/';
    }

    return preix + '/' + url;
}

/**
 * 图片加水印并生成 base64
 */
function watermark(url: string) {
    return new Promise((resolve, reject) => {
        try {
            const img = images(url);
            const size = img.size();
            const data:any = img.draw(images(__dirname + '/xr.png'), size.width / 2, 20).encode('jpg');
            const str = 'data:image/jpg;base64,' + data.toString('base64');

            resolve(encrypt.dataEncode(str, Key.spliter));
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * 加密 6 张全景图
 */
function encodeFile(sourcePath: string, outPath: string, domain: string) {
    return Promise.all(Key.suffixs.map(name => watermark(sourcePath + name))).then(ret => {
        // source
        fs.writeFileSync(outPath + 'images.bxl', ret.join(''));
        // pem
        fs.writeFileSync(outPath + 'images.pem', encrypt.keyEncode(domain));
    }).catch(e => log.errorLog(e));
}

export default {
    dopack(source:string, opts?: any) {
        if (!source) {
            return log.errorLog(new Error('no input files'));
        }
    
        const sourcePath = getPath(source);
        const outPath = (opts.output ? getPath(opts.output) : sourcePath);
    
        return encodeFile(sourcePath, outPath, opts.domain);
    },

    /**
     * 只生成 pem 证书
     * @param {string} domain 产品线域名
     */
    dopem(domain: string) {
        const pem =  encrypt.keyEncode(domain);
        fs.writeFileSync(path.resolve('./') + '/images.pem', pem);
    },

    /**
     * 从证书中获取 key
     * @param {string} sourcePath 
     */
    findKey(sourcePath: string) {
        fs.readFile(sourcePath, 'utf8', (err, data) => {
            const secretKey = data.replace(/-*[A-Z\s]*-\n?/g, '');
            const ret = encrypt.keyDecode(secretKey);

            log.infoLog('真实key: ' + ret.key + '\nEOF: ' + ret.eof);
        });
    }
}
