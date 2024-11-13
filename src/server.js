const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

// Proxy setup
app.use('/api', createProxyMiddleware({
    target: 'https://g2p.broadinstitute.org/api/gene/', 
    changeOrigin: true,
    pathRewrite: {
        '^/api': '',
    },
    onProxyReq: (proxyReq, req, res) => {
    }
}));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
