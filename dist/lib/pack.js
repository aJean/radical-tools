"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var images = require("images");
var encrypt_1 = require("./encrypt");
var log_1 = require("./log");
var key_1 = require("./key");
/**
 * @file 打包
 */
function getPath(url) {
    var preix = path.resolve('./');
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
function watermark(url) {
    return new Promise(function (resolve, reject) {
        try {
            var img = images(url);
            var size = img.size();
            var data = img.draw(images(__dirname + '/xr.png'), size.width / 2, 20).encode('jpg');
            var str = 'data:image/jpg;base64,' + data.toString('base64');
            resolve(encrypt_1.default.dataEncode(str, key_1.default.spliter));
        }
        catch (err) {
            reject(err);
        }
    });
}
/**
 * 加密 6 张全景图
 */
function encodeFile(sourcePath, outPath, domain) {
    return Promise.all(key_1.default.suffixs.map(function (name) { return watermark(sourcePath + name); })).then(function (ret) {
        // source
        fs.writeFileSync(outPath + 'images.bxl', ret.join(''));
        // pem
        fs.writeFileSync(outPath + 'images.pem', encrypt_1.default.keyEncode(domain));
    }).catch(function (e) { return log_1.default.errorLog(e); });
}
exports.default = {
    dopack: function (source, opts) {
        if (!source) {
            return log_1.default.errorLog(new Error('no input files'));
        }
        var sourcePath = getPath(source);
        var outPath = (opts.output ? getPath(opts.output) : sourcePath);
        return encodeFile(sourcePath, outPath, opts.domain);
    },
    /**
     * 只生成 pem 证书
     * @param {string} domain 产品线域名
     */
    dopem: function (domain) {
        var pem = encrypt_1.default.keyEncode(domain);
        fs.writeFileSync(path.resolve('./') + '/images.pem', pem);
    },
    /**
     * 从证书中获取 key
     * @param {string} sourcePath
     */
    findKey: function (sourcePath) {
        fs.readFile(sourcePath, 'utf8', function (err, data) {
            var secretKey = data.replace(/-*[A-Z\s]*-\n?/g, '');
            var ret = encrypt_1.default.keyDecode(secretKey);
            log_1.default.infoLog('真实key: ' + ret.key + '\nEOF: ' + ret.eof);
        });
    }
};
