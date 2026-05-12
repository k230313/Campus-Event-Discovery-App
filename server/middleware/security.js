const loginAttempts = new Map();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0) {
        const localhostAllowed =
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          origin.startsWith("https://localhost:") ||
          origin.startsWith("https://127.0.0.1:");

        callback(localhostAllowed ? null : new Error("CORS origin not allowed"), localhostAllowed);
        return;
      }

      const isAllowed = allowedOrigins.includes(origin);
      callback(isAllowed ? null : new Error("CORS origin not allowed"), isAllowed);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

module.exports = {
  corsOptions,
  securityHeaders,
  authRateLimit,
  clearAuthRateLimit,
};
