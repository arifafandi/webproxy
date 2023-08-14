const express = require('express');
const httpProxy = require('http-proxy');
const app = express();

const proxy = httpProxy.createProxyServer();

app.use('/', (req, res) => {
  // Spoofed IP address for educational purposes
  const spoofedIP = '192.168.1.100'; // Replace with any IP you want

  // Set up proxy headers with the spoofed IP
  req.headers['x-forwarded-for'] = spoofedIP;

  const target = req.query.request;

  // Proxy the request using the spoofed IP
  proxy.web(req, res, { target });
});

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});
