/*global require, exports, Buffer*/

/**
 * Copyright (c) 2013 Javier Dall' Amore <javier@event-fabric.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var http = require("http"),
    url = require('url');

var eventfabric = exports;
eventfabric.version = "0.1.0";
eventfabric.client = function (username, password, root_url) {
    "use strict";
    var cookie, credentials = {
        "username": username,
        "password": password
    };

    function endpoint(path) {
        return root_url + path;
    }

    root_url = root_url || "https://event-fabric.com/api/";
    root_url = root_url[root_url.length - 1] === '/' ? root_url : root_url + "/";

    function request(path, body, successCb, failCb) {
        var req, reqUrl = url.parse(endpoint(path)),
            settings = {
                host: reqUrl.hostname,
                port: reqUrl.port || 80,
                path: reqUrl.pathname,
                headers: {
                    'Cookie': cookie,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(body), 'utf8')
                },
                method: 'POST'
            };

        req = http.request(settings);

        req.on('response', function (res) {
            if (path === "session") {
                cookie = res.headers['set-cookie'];
            }
            res.body = '';
            res.setEncoding('utf-8');

            res.on('data', function (chunk) {
                res.body += chunk;
            });

            res.on('end', function () {
                if (res.statusCode === 201) {
                    successCb(res.statusCode, res.body);
                } else {
                    failCb(res.statusCode, res.message);
                }
            });
        });

        req.on('error', function (err) {
            failCb(err);
        });

        req.write(JSON.stringify(body));
        req.end();
    }

    function login(successCb, failCb) {
        request("session", credentials, successCb, failCb);
    }

    function sendEvent(value, channel, successCb, failCb) {
        request("event", {
            "channel": channel,
            "value": value
        }, successCb, failCb);
    }

    return {
        login: login,
        credentials: credentials,
        endpoint: endpoint,
        sendEvent: sendEvent
    };
};

