const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const request = require('request-http2');

const app = express();
const path = require('path');

app.use(bodyParser());
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

app.listen(80, "0.0.0.0", () => {
    console.log('Express server on 80, 0.0.0.0');
});

app.get('/cors', (req, res) => {
    const { request } = require('http2-client');
    console.log ('req headers', req.headers);

    const host = req.headers.targeturl.split(/\/\//)[1];
    const protocol = req.headers.targeturl.split(/\/\//)[0];

    const headers = {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'cache-control' : 'max=age=0',
        'user-agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36'
    }

    const options = {
        protocol : protocol,
        hostname : host,
        method : req.headers.targetmethod,
        headers : headers
    }
    createAndSendProxyReq(options);

    function createAndSendProxyReq (options) {

        const proxyReq = request(options, (proxyRes) => {

            console.log('proxyResHeaders', proxyRes.headers);

            if (proxyRes.headers['location']) {
                let newLocation = proxyRes.headers['location'];
                let host = newLocation.split(/\/\//)[1];
                host = host.substring(0, host.length-1);
                const protocol = newLocation.split(/\/\//)[0];
                options.hostname = host;
                options.protocol = protocol;

                createAndSendProxyReq (options);
                return;
            }
            else {
                res.send(proxyRes);
                // let finishedBody = "";
                // proxyRes.setEncoding('utf8');
                // proxyRes.on('data', (chunk) => {
                //     finishedBody += chunk;
                // });
                // proxyRes.on('end', () => {
                //     console.log(finishedBody);
                //     console.log('There will be no more data.');
                //     res.send(finishedBody);
                // });
            }
        });
        proxyReq.end();
    }
})

app.get('/events', (req, res) => {
    res.header('Content-Type', 'text/event-stream');
    res.header('Cache-Control', 'no-cache');

    let id=0;

    setInterval(function() {
        res.write('event: my-custom-event\n');
        res.write('id: ' + id++ + '\n');
        res.write(`data: Your headers: ${JSON.stringify(req.headers)}\n`);
        res.write('\n\n')
    }, 2500);
});

app.post('/events', (req, res) => {
    res.header('Content-Type', 'text/event-stream');
    res.header('Cache-Control', 'no-cache');

    let id=0;

    setInterval(function() {
        res.write('event: my-custom-event\n');
        res.write('id: ' + id++ + '\n');
        res.write(`data: Your headers: ${JSON.stringify(req.headers)}\n`);
        res.write(`data: Your body: ${JSON.stringify(req.body)}\n`);
        res.write('\n\n')
    }, 2500);
});

module.exports = app;
