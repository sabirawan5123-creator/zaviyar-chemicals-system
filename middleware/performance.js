// Performance optimization middleware

// Response time logger
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
};

// Cache middleware for read-only operations
const cache = {};
const CACHE_DURATION = 30000; // 30 seconds

const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const cached = cache[key];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }

  // Store original json function
  const originalJson = res.json.bind(res);

  // Override json function to cache response
  res.json = (data) => {
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    return originalJson(data);
  };

  next();
};

// Clear cache on data modification
const clearCache = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Clear all cache
    Object.keys(cache).forEach(key => delete cache[key]);
  }
  next();
};

module.exports = {
  responseTime,
  cacheMiddleware,
  clearCache
};

