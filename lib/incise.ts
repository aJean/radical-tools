import * as Canvas from 'canvas';
import Key from './key';
import fs = require('fs');
import mkdirp = require('mkdirp');

/**
 * @file 切割文件
 * @TODO: cluster 多进程改造, remode 异步化改造
 */

const noop = function() {};

/**
 * 存储文件 (async)
 * @param {Image} img 瓦片图
 * @param {string} name 图片名
 */
function saveImg(img, name) {
    const base64 = img.replace(/^data:image\/\w+;base64,/, '');
    const buffer = new Buffer(base64, 'base64');

    fs.writeFile(name, buffer, noop);
}

/**
 * 瓦片化 (async)
 * @param {Image} img 当前位面图
 * @param {number} rect 瓦片尺寸
 * @param {number} x 起始 x 位置
 * @param {number} y 起始 y 位置
 * @param {number} width 裁剪尺寸
 * @param {number} quality 图片质量
 * @param {string} name 图片名
 */
function drawImg(img, rect, x, y, width, quality, name) {
    const canvas = new Canvas(rect, rect);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, x, y, width, width, 0, 0, rect, rect);
    canvas.toDataURL('image/jpeg', quality, function (err, img) {
        !err && saveImg(img, name);
    });
}

function calcOpts(level) {
    return {size: 1600, limit: 1, rect: level == 1 ? 800 : 400};
}

/**
 * 重新构建图片
 * @param path 路径
 * @param key 六面体编号
 * @param opts 选项
 * @param level 级别
 */
function remodeImg(path, key, opts, level) {
    const size = opts.size;
    const rect = opts.rect;
    const buffer = fs.readFileSync(`${path}/${key}.jpg`);
    const img = new Canvas.Image();
    img.src = buffer;

    // level 0: only compress quality
    if (level == 0) {
        const canvas = new Canvas(size, size);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, size, size);
        canvas.toDataURL('image/jpeg', 0.3, function (err, img) {
            !err && saveImg(img, `${path}/mobile_${key}.jpg`);
        });
    // level 1: 2 * 2
    } else if (level == 1) {
        try {
            mkdirp.sync(`${path}/hd_${key}/l1/1`);
            mkdirp.sync(`${path}/hd_${key}/l1/2`);
        } catch(e) {}

        const width = img.width / 2;

        for (let i = 0; i < 2; i++) {
            const row = i + 1;
            drawImg(img, rect, 0, i * width, width, 0.6, `${path}/hd_${key}/l1/${row}/l1_${key}_${row}_1.jpg`);
            drawImg(img, rect, width, i * width, width, 0.6, `${path}/hd_${key}/l1/${row}/l1_${key}_${row}_2.jpg`);
        }
    // level 2: 4 * 4
    } else if (level == 2) {
        try {
            mkdirp.sync(`${path}/hd_${key}/l2/1`);
            mkdirp.sync(`${path}/hd_${key}/l2/2`);
            mkdirp.sync(`${path}/hd_${key}/l2/3`);
            mkdirp.sync(`${path}/hd_${key}/l2/4`);
        } catch(e) {}

        const width = img.width / 4;

        for (let i = 0; i < 4; i++) {
            const row = i + 1;
            drawImg(img, rect, 0, i * width, width, 1, `${path}/hd_${key}/l2/${row}/l2_${key}_${row}_1.jpg`);
            drawImg(img, rect, width, i * width, width, 1, `${path}/hd_${key}/l2/${row}/l2_${key}_${row}_2.jpg`);
            drawImg(img, rect, width * 2, i * width, width, 1, `${path}/hd_${key}/l2/${row}/l2_${key}_${row}_3.jpg`);
            drawImg(img, rect, width * 3, i * width, width, 1, `${path}/hd_${key}/l2/${row}/l2_${key}_${row}_4.jpg`);
        }
    } 

}

export default {
    /**
     * 拼接预览图
     */
    flatten(path) {
        const canvas = new Canvas(256, 1536);
        const ctx = canvas.getContext('2d');

        Key.porder.forEach((key, i) => {
            const buffer = fs.readFileSync(`${path}/${key}.jpg`);
            const img = new Canvas.Image();
            img.src = buffer;

            ctx.drawImage(img, 0, i * 256, 256, 256);
        });

        canvas.toDataURL('image/jpeg', 0.3, function (err, img) {
            !err && saveImg(img, `${path}/preview.jpg`);
        });
    },
    /**
     * 按级别切割图片
     */
    invoke(path, level = 0) {
        const opts = calcOpts(level);

        if (!fs.existsSync(path)) {
            return;
        }

        Key.order.forEach(key => remodeImg(path, key, opts, level));
    },

    /**
     * 全部级别切割, 可能需要时间较长
     */
    invokeAll(path) {
        this.invoke(path, 0);
        this.invoke(path, 1);
        this.invoke(path, 2);
    }
}