import env = require('commander');
import Pack from './lib/pack';
import Incise from './lib/incise';
import * as inquirer from 'inquirer';
import {create} from './lib/project';
import Log from './lib/log';

/**
 * @file radical 标准化工具
 */

const json = require("../package.json");
env.version(json.version);

env.command('encode [path]').description('加密资源')
    .option('-i, --input [path]', '目标资源路径')
    .option('-o, --output [path]', '输出资源路径')
    .option('-d, --domain [name]', '产品线域名')
    .option('-k, --key [key]', '加密 key')
    .action((path, opts) => Pack.dopack(path || opts.input, opts));

env.command('key [path]').description('从证书中提取 key')
    .action(path => Pack.findKey(path));

env.command('pem [domain]').description('生成证书')
    .action(path => Pack.dopem(path));

env.command('incise [path]').description('切割文件')
    .option('-l, --level [level]', '所属层级')
    .action((path , opts)=> Incise.invoke(path, opts.level));

env.command('inciseall [path]').description('按项目切割文件')
    .action((path , opts)=> Incise.invokeAll(path));

env.command('flatten [path]').description('拼接预览图')
    .action((path , opts)=> Incise.flatten(path));

env.command('init').description('生成工程')
    .action(() => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: '请输入项目名称'
            },
            {
                type: 'input',
                name: 'author',
                message: '请输入作者名称'
            },
            {
                type: 'input',
                name: 'description',
                message: '请输入项目描述'
            }
        ]).then(answers => create(answers));
    });

env.parse(process.argv);


if (!process.argv.slice(2).length) {
    Log.infoLog(['hello stranger, radical is a webxr solution base on webgl', 'you can find the project in: https://github.com/aJean/radical']);
}