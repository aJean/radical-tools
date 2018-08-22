import fs = require('fs');
import path = require('path');
import encrypt from './encrypt';
import {createCanvas, loadImage} from 'canvas';
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
    return loadImage(url).then(function (img) {
        const width = img.width;
        const height = img.height;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);

        ctx.font = '20px Georgia';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Hello Radical', width / 2, height / 2);

        return encrypt.dataEncode(canvas.toDataURL('image/jpeg', 1), Key.spliter);
    });
}

/**
 * 加密 cube map
 */
function encodeFile(sourcePath: string, outPath: string, domain: string) {
    return Promise.all(Key.suffixs.map(name => watermark(sourcePath + name))).then(ret => {
        // source
        fs.writeFileSync(outPath + 'cube.r', ret.join(''));
        // pem
        fs.writeFileSync(outPath + 'cret.txt', encrypt.keyEncode(domain));
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
     * generate pem only
     * @param {string} domain 产品线域名
     */
    dopem(domain: string) {
        const pem =  encrypt.keyEncode(domain);
        fs.writeFileSync(path.resolve('./') + '/images.pem', pem);
    },

    /**
     * find key from pem
     * @param {string} sourcePath 
     */
    findKey(sourcePath: string) {
        fs.readFile(sourcePath, 'utf8', (err, data) => {
            const secretKey = data.replace(/-*[A-Z\s]*-\n?/g, '');
            const ret = encrypt.keyDecode(secretKey);

            log.infoLog(['真实key: ' + ret.key, 'EOF: ' + ret.eof]);
        });
    }
}
