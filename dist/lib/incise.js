"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Canvas = require("canvas");
var fs = require("fs");
var mkdirp = require("mkdirp");
/**
 * @file 切割文件
 * @TODO: cluster 多进程改造, remode 异步化改造
 */
var keys = ['r', 'l', 'u', 'd', 'f', 'b'];
var pkeys = ['l', 'f', 'r', 'b', 'u', 'd'];
var noop = function () { };
function saveImg(img, name) {
    var base64 = img.replace(/^data:image\/\w+;base64,/, '');
    var buffer = new Buffer(base64, 'base64');
    fs.writeFile(name, buffer, noop);
}
function drawImg(img, rect, x, y, width, quality, name) {
    var canvas = new Canvas(rect, rect);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, x, y, width, width, 0, 0, rect, rect);
    canvas.toDataURL('image/jpeg', quality, function (err, img) {
        !err && saveImg(img, name);
    });
}
function calcOpts(level) {
    return { size: 1600, limit: 1, rect: level == 1 ? 800 : 400 };
}
/**
 * 重新构建图片
 * @param path 路径
 * @param key 六面体编号
 * @param opts 选项
 * @param level 级别
 */
function remodeImg(path, key, opts, level) {
    var size = opts.size;
    var rect = opts.rect;
    var buffer = fs.readFileSync(path + "/" + key + ".jpg");
    var img = new Canvas.Image();
    img.src = buffer;
    // level 0: only compress quality
    if (level == 0) {
        var canvas = new Canvas(size, size);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toDataURL('image/jpeg', 0.3, function (err, img) {
            !err && saveImg(img, path + "/mobile_" + key + ".jpg");
        });
        // level 1: 2 * 2
    }
    else if (level == 1) {
        try {
            mkdirp.sync(path + "/hd_" + key + "/l1/1");
            mkdirp.sync(path + "/hd_" + key + "/l1/2");
        }
        catch (e) { }
        var width = img.width / 2;
        for (var i = 0; i < 2; i++) {
            var row = i + 1;
            drawImg(img, rect, 0, i * width, width, 0.6, path + "/hd_" + key + "/l1/" + row + "/l1_" + key + "_" + row + "_1.jpg");
            drawImg(img, rect, width, i * width, width, 0.6, path + "/hd_" + key + "/l1/" + row + "/l1_" + key + "_" + row + "_2.jpg");
        }
        // level 2: 4 * 4
    }
    else if (level == 2) {
        try {
            mkdirp.sync(path + "/hd_" + key + "/l2/1");
            mkdirp.sync(path + "/hd_" + key + "/l2/2");
            mkdirp.sync(path + "/hd_" + key + "/l2/3");
            mkdirp.sync(path + "/hd_" + key + "/l2/4");
        }
        catch (e) { }
        var width = img.width / 4;
        for (var i = 0; i < 4; i++) {
            var row = i + 1;
            drawImg(img, rect, 0, i * width, width, 1, path + "/hd_" + key + "/l2/" + row + "/l2_" + key + "_" + row + "_1.jpg");
            drawImg(img, rect, width, i * width, width, 1, path + "/hd_" + key + "/l2/" + row + "/l2_" + key + "_" + row + "_2.jpg");
            drawImg(img, rect, width * 2, i * width, width, 1, path + "/hd_" + key + "/l2/" + row + "/l2_" + key + "_" + row + "_3.jpg");
            drawImg(img, rect, width * 3, i * width, width, 1, path + "/hd_" + key + "/l2/" + row + "/l2_" + key + "_" + row + "_4.jpg");
        }
    }
}
exports.default = {
    /**
     * 拼接预览图
     */
    flatten: function (path) {
        var canvas = new Canvas(256, 1536);
        var ctx = canvas.getContext('2d');
        pkeys.forEach(function (key, i) {
            var buffer = fs.readFileSync(path + "/" + key + ".jpg");
            var img = new Canvas.Image();
            img.src = buffer;
            ctx.drawImage(img, 0, i * 256, 256, 256);
        });
        canvas.toDataURL('image/jpeg', 0.3, function (err, img) {
            !err && saveImg(img, path + "/preview.jpg");
        });
    },
    /**
     * 按级别切割图片
     */
    invoke: function (path, level) {
        if (level === void 0) { level = 0; }
        var opts = calcOpts(level);
        if (!fs.existsSync(path)) {
            return;
        }
        keys.forEach(function (key) { return remodeImg(path, key, opts, level); });
    },
    /**
     * 全部级别切割, 可能需要时间较长
     */
    invokeAll: function (path) {
        this.invoke(path, 0);
        this.invoke(path, 1);
        this.invoke(path, 2);
    }
};
