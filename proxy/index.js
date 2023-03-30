const backendPort = 4567
const frontendPort = 5173
const proxyPort = 8282

const backendUrl = `http://localhost:${backendPort}/`
const frontendUrl = `http://localhost:${frontendPort}/`

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/api/highscore', createProxyMiddleware({ target: backendUrl, pathRewrite: { '^/api/highscore': '/'}, changeOrigin: true }));
app.use('/', createProxyMiddleware({ target: frontendUrl, changeOrigin: true }));

app.listen(proxyPort);
