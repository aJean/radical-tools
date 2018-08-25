import * as downloadUrl from 'download';
import cp = require('child_process');
import fs = require('fs');
import Log from './log';

/**
 * @file make project
 */

export function create(data) {
    Log.infoLog('初始化项目');

    const name = data.name;
    download('direct:https://github.com/aJean/cli-template/archive/master.zip', `./${name}`, function(err) {
        if (err) {
            return Log.errorLog(err);
        }

        const fileName = `${name}/package.json`;
        const content = fs.readFileSync(fileName).toString();
        const result = replace(content, data)
        fs.writeFileSync(fileName, result);

        const libData = JSON.parse(fs.readFileSync(`${name}/lib/lib.json`).toString());

        downloadUrl(libData.libjs, `./${name}/lib`);
        downloadUrl(libData.libcss, `./${name}/lib`);

        cp.exec(`rm -rf ./${name}/lib/lib.json`, function (err) {
            Log.infoLog('初始化完成');
        });
    });
}

function replace(str, data) {
    return str.replace(/{{([^}]*)}}/g, function ($, $1) {
        return data[$1];
    });
}

function download(repo, dest, fn) {
    repo = normalize(repo);
    const url = repo.url || getUrl(repo);

    downloadUrl(url, dest, { extract: true, strip: 1, headers: { accept: 'application/zip' } })
        .then(data => fn())
        .catch(err => fn(err));
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo) {
    let regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
    let match = regex.exec(repo);

    if (match) {
        const url = match[2];
        const checkout = match[3] || 'master';

        return {
            type: 'direct',
            url: url,
            checkout: checkout
        }
    } else {
        regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^\/]+)\/([^#]+)(?:#(.+))?$/;
        match = regex.exec(repo);
        const type = match[1] || 'github';
        let origin = match[2] || null;
        const owner = match[3];
        const name = match[4];
        const checkout = match[5] || 'master';

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
            name: name,
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
    let origin = addProtocol(repo.origin);
    let url;

    // Get origin with protocol and add trailing slash or colon (for ssh)
    origin += /^git\@/i.test(origin) ? ':' : '/';

    // Build url
    if (repo.type === 'github') {
        url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip';
    } else if (repo.type === 'gitlab') {
        url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout;
    } else if (repo.type === 'bitbucket') {
        url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip';
    }

    return url;
}