const http = require('http');
const https = require('https');
const faker = require('faker');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const targetDomain = parsedUrl.query.request;

  if (!targetDomain) {
    res.statusCode = 400;
    res.end('Invalid request: target domain is missing');
    return;
  }

  // Generate a random IP address for X-Forwarded-For header
  const randomIP = faker.internet.ip();

  // Clone the request headers to avoid modifying the original object
  const modifiedHeaders = { ...req.headers };

  // Modify the X-Forwarded-For header with the random IP address
  modifiedHeaders['x-forwarded-for'] = randomIP;

  // Determine the protocol (http or https) based on the target domain
  const protocol = targetDomain.startsWith('https://') ? https : http;

  // Forward the modified request
  const proxyReq = protocol.request(targetDomain, {
    method: req.method,
    headers: modifiedHeaders
  }, (proxyRes) => {
    // Set the response headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    // Forward the response from the target domain to the client
    proxyRes.pipe(res);
  });

  // Handle errors during the proxy request
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    res.statusCode = 500;
    res.end('Proxy request error');
  });

  // Forward the request body to the target domain
  req.pipe(proxyReq);
});

const port = 3000;
server.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
