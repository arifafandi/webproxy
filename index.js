const express = require('express');
const httpProxy = require('http-proxy');
const fs = require('fs');

const app = express();
const proxy = httpProxy.createProxyServer();

// Function to log errors to a file
function logError(error) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${error.stack}\n`;

  fs.appendFile('error.log', logMessage, (err) => {
    if (err) {
      console.error('Error writing to error.log:', err);
    }
  });
}

app.use('/', (req, res) => {
  // Spoofed IP address for educational purposes
  const spoofedIP = '192.168.1.100'; // Replace with any IP you want

  // Set up proxy headers with the spoofed IP
  req.headers['x-forwarded-for'] = spoofedIP;

  const target = req.query.request;

  // Proxy the request using the spoofed IP
  proxy.web(req, res, { target }, (error) => {
    console.error('An error occurred:', error);
    logError(error);
    res.sendStatus(500); // Send an error response to the client
  });
});

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});
