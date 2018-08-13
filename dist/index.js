"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var env = require("commander");
var pack_1 = require("./lib/pack");
var incise_1 = require("./lib/incise");
/**
 * @file bxl 标准化工具
 */
var json = require("../package.json");
env.version(json.version)
    .command('encode [path]').description('加密资源')
    .option('-i, --input [path]', '目标资源路径')
    .option('-o, --output [path]', '输出资源路径')
    .option('-d, --domain [name]', '产品线域名')
    .option('-k, --key [key]', '加密 key')
    .action(function (path, opts) { return pack_1.default.dopack(path || opts.input, opts); });
env.command('key [path]').description('从证书中提取 key')
    .action(function (path) { return pack_1.default.findKey(path); });
env.command('pem [domain]').description('生成证书')
    .action(function (path) { return pack_1.default.dopem(path); });
env.command('incise [path]').description('切割文件')
    .option('-l, --level [level]', '所属层级')
    .action(function (path, opts) { return incise_1.default.invoke(path, opts.level); });
env.command('inciseall [path]').description('按项目切割文件')
    .action(function (path, opts) { return incise_1.default.invokeAll(path); });
env.command('flatten [path]').description('拼接预览图')
    .action(function (path, opts) { return incise_1.default.flatten(path); });
env.parse(process.argv);
