'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var util = require('util');

var fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, 'config.json');

var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));


(function () {
    var commands = [
        'rm -r /tmp/tmp-prof || true'
    ];

    var chromeCmdParts = [
        'google-chrome',
         '--no-first-run',
         '--user-data-dir=/tmp/tmp-prof',
    ];

    var proxy = util.format('%s:%s', config.proxy.host,config.proxy.port);
    var proxyRules = [];

    if (config.block.http) {
        proxyRules.push(util.format('http=%s', proxy));
    }

    if (config.block.https) {
        proxyRules.push(util.format('https=%s', proxy));
    }

    if (proxyRules.length) {
        chromeCmdParts.push(
            util.format('--proxy-server="%s"', proxyRules.join(';'))
        );
    } else {
        throw new Exception('Either of `http` or `https` should be blocked.');
    }


    chromeCmdParts.push(util.format('"%s"', config.initialUrl));

    commands.push(chromeCmdParts.join(' '));

    gulp.task('chrome', shell.task(commands));
}());

gulp.task('proxy', shell.task([
  'nodejs ./node_modules/.bin/supervisor -- main.js'
]));

gulp.task('default', ['chrome', 'proxy']);
