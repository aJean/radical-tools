"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var encrypt_1 = require("./encrypt");
var canvas_1 = require("canvas");
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
    return canvas_1.loadImage(url).then(function (img) {
        var width = img.width;
        var height = img.height;
        var canvas = canvas_1.createCanvas(width, height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        ctx.font = '20px Georgia';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Hello Radical', width / 2, height / 2);
        return encrypt_1.default.dataEncode(canvas.toDataURL('image/jpeg', 1), key_1.default.spliter);
    });
}
/**
 * 加密 cube map
 */
function encodeFile(sourcePath, outPath, domain) {
    return Promise.all(key_1.default.suffixs.map(function (name) { return watermark(sourcePath + name); })).then(function (ret) {
        // source
        fs.writeFileSync(outPath + 'cube.r', ret.join(''));
        // pem
        fs.writeFileSync(outPath + 'cret.txt', encrypt_1.default.keyEncode(domain));
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
     * generate pem only
     * @param {string} domain 产品线域名
     */
    dopem: function (domain) {
        var pem = encrypt_1.default.keyEncode(domain);
        fs.writeFileSync(path.resolve('./') + '/images.pem', pem);
    },
    /**
     * find key from pem
     * @param {string} sourcePath
     */
    findKey: function (sourcePath) {
        fs.readFile(sourcePath, 'utf8', function (err, data) {
            var secretKey = data.replace(/-*[A-Z\s]*-\n?/g, '');
            var ret = encrypt_1.default.keyDecode(secretKey);
            log_1.default.infoLog(['真实key: ' + ret.key, 'EOF: ' + ret.eof]);
        });
    }
};
