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

    var proxy = util.format('%s:%s', config.host,config.port);

    if (config.blockHttp) {
        chromeCmdParts.push(
            format('--proxy-server="http=%s;"', proxy
        ));
    }

    if (config.blockHttps) {
        chromeCmdParts.push(
            util.format('--proxy-server="https=%s;"', proxy
        ));
    }

    chromeCmdParts.push(
        util.format('--proxy-server="https=%s;"', proxy
    ));

    chromeCmdParts.push(config.initialUrl);

    commands.push(chromeCmdParts.join(' '));

    gulp.task('chrome', shell.task(commands));
}());

gulp.task('proxy', shell.task([
  'nodejs ./node_modules/.bin/supervisor -- main.js'
]));

gulp.task('default', ['chrome', 'proxy']);
