const gracefulShutdown = (server) => {
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received. Shutting down gracefully.');
        server.close(() => {
            console.log('Closed remaining connections.');
            process.exit(0);
        });
    });
};

module.exports = gracefulShutdown;
