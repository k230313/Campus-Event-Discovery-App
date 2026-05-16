const loginAttempts = new Map();
const requestWindows = new Map();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getAllowedOrigins() {
  return [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_ALT,
  ].filter(Boolean);
}

function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("[CORS] Blocked request from origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
}

function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
}

function authRateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const key = `${req.path}:${ip}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    next();
    return;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.firstAttemptAt)) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  entry.count += 1;
  loginAttempts.set(key, entry);
  next();
}

function clearAuthRateLimit(req) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const key = `${req.path}:${ip}`;
  loginAttempts.delete(key);
}

function createRateLimit({ windowMs, maxRequests, keyPrefix, message }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const userId = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;
    const key = `${keyPrefix}:${req.method}:${req.path}:${userId}`;
    const now = Date.now();
    const entry = requestWindows.get(key);

    if (!entry || now - entry.firstRequestAt > windowMs) {
      requestWindows.set(key, { count: 1, firstRequestAt: now });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - entry.firstRequestAt)) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ error: message });
      return;
    }

    entry.count += 1;
    requestWindows.set(key, entry);
    next();
  };
}

const adminRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 60,
  keyPrefix: "admin",
  message: "Too many admin requests. Try again later.",
});

const generalWriteRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 40,
  keyPrefix: "write",
  message: "Too many write requests. Try again later.",
});

const registrationRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
  keyPrefix: "registration",
  message: "Too many registration requests. Try again later.",
});

const chatRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 15,
  keyPrefix: "chat",
  message: "Too many chat requests. Try again later.",
});

const chatQuotaRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 40,
  keyPrefix: "chat-quota",
  message: "Chat usage limit reached. Try again later.",
});

module.exports = {
  corsOptions,
  securityHeaders,
  authRateLimit,
  adminRateLimit,
  chatRateLimit,
  chatQuotaRateLimit,
  clearAuthRateLimit,
  generalWriteRateLimit,
  registrationRateLimit,
};
