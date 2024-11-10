const http = require('http');
const app = require('./app');
const config = require('./config/config');
const gracefulShutdown = require('./middleware/gracefulShutdown');

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

gracefulShutdown(server);

