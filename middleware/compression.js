// Compression middleware for faster responses
const compression = require('compression');

// Configure compression
const compressionMiddleware = compression({
  // Compress all responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (6 is good balance between speed and size)
  level: 6
});

module.exports = compressionMiddleware;

