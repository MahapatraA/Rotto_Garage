/**
 * Request logger middleware.
 * Format: [ROTTO][timestamp][METHOD][/path][userId or guest][Xms]
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const userId = req.user ? req.user.id : 'guest';
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${color}[ROTTO][${new Date().toISOString()}][${req.method}][${req.path}][${userId}][${ms}ms]\x1b[0m`
    );
  });

  next();
};

module.exports = { requestLogger };
