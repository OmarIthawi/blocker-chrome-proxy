#!/usr/bin/env nodejs
var http = require('http');
var fs = require('fs');
var path = require('path');
var util = require('util');

var configPath = path.join(__dirname, 'config.json');

var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

http.createServer(function (clientReq, clientRes) {
    var endRequest = function () {
        var httpForbidden = 403;
        clientRes.writeHead(httpForbidden);
        clientRes.write('Host is blocked.');
        clientRes.end();
    };

    var options = {
        host: clientReq.headers.host,
        port: 80,
        path: clientReq.url,
        method: clientReq.method,
        headers: clientReq.headers
    };

    console.log('request:', {
        'h': clientReq.headers,
        'm': clientReq.method,
        'u': clientReq.url
    });

    var allowHost = false;

    config.allowedHosts.forEach(function (host) {
        if (host === clientReq.headers.host) {
            allowHost = true;
        }
    });

    if (!allowHost) {
        console.log('Denied request from host:', clientReq.headers.host);
        return endRequest();
    }

    var proxyReq = http.request(options, function (proxyRes) {
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes);
    });

    if ('POST' === clientReq.method) {
        console.log('Piping post data...');

        clientReq.on('data', function (data) {
            proxyReq.write(data);
        });

        clientReq.on('end', function () {
            console.log('Done piping post data.');
            proxyReq.end();
        });
    }


    proxyReq.on('error', function (e) {
        console.log('problem with clientReq: ' + e.message);
    });


    proxyReq.end();

}).listen(config.proxy.port, config.proxy.host);


console.log(util.format(
    'Running proxy on http://%s:%s',
        config.proxy.host,
        config.proxy.port
));
