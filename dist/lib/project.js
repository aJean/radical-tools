"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var downloadUrl = require("download");
var cp = require("child_process");
var fs = require("fs");
var log_1 = require("./log");
/**
 * @file make project
 */
function create(data) {
    log_1.default.infoLog('初始化项目');
    var name = data.name;
    download('direct:https://github.com/aJean/cli-template/archive/master.zip', "./" + name, function (err) {
        if (err) {
            return log_1.default.errorLog(err);
        }
        var fileName = name + "/package.json";
        var content = fs.readFileSync(fileName).toString();
        var result = replace(content, data);
        fs.writeFileSync(fileName, result);
        var libData = JSON.parse(fs.readFileSync(name + "/lib/lib.json").toString());
        downloadUrl(libData.libjs, "./" + name + "/lib");
        downloadUrl(libData.libcss, "./" + name + "/lib");
        cp.exec("rm -rf ./" + name + "/lib/lib.json", function (err) {
            log_1.default.infoLog('初始化完成');
        });
    });
}
exports.create = create;
function replace(str, data) {
    return str.replace(/{{([^}]*)}}/g, function ($, $1) {
        return data[$1];
    });
}
function download(repo, dest, fn) {
    repo = normalize(repo);
    var url = repo.url || getUrl(repo);
    downloadUrl(url, dest, { extract: true, strip: 1, headers: { accept: 'application/zip' } })
        .then(function (data) { return fn(); })
        .catch(function (err) { return fn(err); });
}
/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo) {
    var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
    var match = regex.exec(repo);
    if (match) {
        var url = match[2];
        var checkout = match[3] || 'master';
        return {
            type: 'direct',
            url: url,
            checkout: checkout
        };
    }
    else {
        regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^\/]+)\/([^#]+)(?:#(.+))?$/;
        match = regex.exec(repo);
        var type = match[1] || 'github';
        var origin = match[2] || null;
        var owner = match[3];
        var name_1 = match[4];
        var checkout = match[5] || 'master';
        if (origin == null) {
            if (type === 'github')
                origin = 'github.com';
            else if (type === 'gitlab')
                origin = 'gitlab.com';
            else if (type === 'bitbucket')
                origin = 'bitbucket.com';
        }
        return {
            type: type,
            origin: origin,
            owner: owner,
            name: name_1,
            checkout: checkout
        };
    }
}
/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */
function addProtocol(origin) {
    if (!/^(f|ht)tps?:\/\//i.test(origin)) {
        origin = 'https://' + origin;
    }
    return origin;
}
/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */
function getUrl(repo) {
    var origin = addProtocol(repo.origin);
    var url;
    // Get origin with protocol and add trailing slash or colon (for ssh)
    origin += /^git\@/i.test(origin) ? ':' : '/';
    // Build url
    if (repo.type === 'github') {
        url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip';
    }
    else if (repo.type === 'gitlab') {
        url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout;
    }
    else if (repo.type === 'bitbucket') {
        url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip';
    }
    return url;
}
