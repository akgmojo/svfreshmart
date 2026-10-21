const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server_debug.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log(`CRITICAL Uncaught Exception: ${err.stack || err}`);
});

process.on('unhandledRejection', (reason) => {
  log(`CRITICAL Unhandled Rejection: ${reason && reason.stack ? reason.stack : reason}`);
});

log('Server process starting...');
log(`Node.js version: ${process.version}`);
log(`Working directory: ${process.cwd()}`);
log(`PORT env: ${process.env.PORT}`);

let port = process.env.PORT || 3000;
if (!isNaN(port) && typeof port === 'string') {
  port = parseInt(port, 10);
}

let app;
let handle;
let isNextReady = false;
let startupError = null;

try {
  const next = require('next');
  app = next({ dev: false });
  handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      isNextReady = true;
      log('Next.js app prepared successfully');
    })
    .catch((err) => {
      startupError = err;
      log(`FATAL: Next.js prepare failed: ${err.stack || err}`);
    });
} catch (err) {
  startupError = err;
  log(`FATAL: Next module load failed: ${err.stack || err}`);
}

const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);

    // Diagnostic endpoint to debug Hostinger environment
    if (parsedUrl.pathname === '/__diagnostic') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: isNextReady ? 'ready' : (startupError ? 'failed' : 'preparing'),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        envPort: process.env.PORT,
        startupError: startupError ? String(startupError.stack || startupError) : null,
        recentLogs: fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').split('\n').slice(-30) : []
      }, null, 2));
    }

    if (startupError) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>SV Freshmart - Startup Diagnostic</title></head>
        <body style="font-family: monospace; padding: 30px; background: #1a1a1a; color: #f87171;">
          <h2>SV Freshmart Server Startup Notice</h2>
          <p>The Node.js server is online, but Next.js encountered an issue during startup:</p>
          <pre style="background: #262626; padding: 15px; border-radius: 6px; overflow-x: auto; color: #ffedd5;">${startupError.stack || startupError}</pre>
          <p style="color: #9ca3af;">Node Version: ${process.version} | Platform: ${process.platform}</p>
          <p style="color: #60a5fa;"><a href="/__diagnostic" style="color: #60a5fa;">View Full Diagnostic JSON</a></p>
        </body>
        </html>
      `);
    }

    if (!isNextReady) {
      res.writeHead(503, { 'Content-Type': 'text/html' });
      return res.end('<!DOCTYPE html><html><body><h3>SV Freshmart is initializing, please refresh in 5 seconds...</h3></body></html>');
    }

    await handle(req, res, parsedUrl);
  } catch (err) {
    log(`Error handling ${req.url}: ${err.stack || err}`);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.once('error', (err) => {
  log(`Server listen error: ${err.stack || err}`);
});

server.listen(port, () => {
  log(`> SV Freshmart production server listening on ${typeof port === 'number' ? `port ${port}` : port}`);
});
