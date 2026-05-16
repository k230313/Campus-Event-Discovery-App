const express = require("express");
const crypto = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");
const { chatQuotaRateLimit, chatRateLimit } = require("../middleware/security");

const router = express.Router();

const SYSTEM_PROMPT = "You are a campus event assistant. You only answer questions about the campus events provided to you. If asked anything unrelated, politely say you can only help with campus events.";
const CHAT_CACHE_TTL_MS = 10 * 60 * 1000;
const chatResponseCache = new Map();

function normalizeHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) {
    return [];
  }

  const normalized = conversationHistory
    .filter((entry) => (
      entry &&
      (entry.role === "user" || entry.role === "assistant") &&
      typeof entry.content === "string" &&
      entry.content.trim()
    ))
    .slice(-10)
    .map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: entry.content.trim() }],
    }));

  while (normalized.length > 0 && normalized[0].role !== "user") {
    normalized.shift();
  }

  return normalized;
}

async function loadEventContext() {
  const [rows] = await pool.query(
    `SELECT
       CAST(e.event_id AS CHAR) AS id,
       e.title,
       e.description,
       DATE_FORMAT(e.event_date, '%Y-%m-%d') AS date,
       TIME_FORMAT(e.start_time, '%H:%i:%s') AS startTime,
       TIME_FORMAT(e.end_time, '%H:%i:%s') AS endTime,
       e.location,
       c.name AS category,
       u.full_name AS organizerName,
       e.status
     FROM events e
     INNER JOIN categories c ON c.category_id = e.category_id
     INNER JOIN users u ON u.user_id = e.organiser_id
     WHERE e.status = 'published'
       AND e.event_date >= CURDATE()
     ORDER BY e.event_date ASC, e.start_time ASC
     LIMIT 50`
  );

  return rows.map((event) => ({
    id: event.id,
    title: event.title || "",
    description: event.description || "",
    date: event.date || "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location || "",
    category: event.category || "",
    organizerName: event.organizerName || "",
    status: event.status || "",
  }));
}

function getRelevantEvents(events, message) {
  const query = message.toLowerCase();
  const terms = query
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3);

  const scored = events.map((event) => {
    const haystack = [
      event.title,
      event.description,
      event.category,
      event.location,
      event.organizerName,
    ].join(" ").toLowerCase();

    let score = 0;

    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 2;
      }
    }

    if (query.includes("this month") || query.includes("this week") || query.includes("upcoming") || query.includes("soon")) {
      score += 1;
    }

    return { event, score };
  });

  const matches = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.event.date.localeCompare(b.event.date))
    .slice(0, 3)
    .map((entry) => ({
      id: entry.event.id,
      title: entry.event.title,
      date: entry.event.date,
    }));

  if (matches.length > 0) {
    return matches;
  }

  if (query.includes("this month") || query.includes("this week") || query.includes("upcoming") || query.includes("soon")) {
    return events.slice(0, 3).map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
    }));
  }

  return [];
}

function buildCacheKey(message, history, events) {
  const historyKey = history.map((entry) => ({
    role: entry.role,
    content: entry.parts?.[0]?.text || "",
  }));

  const eventKey = events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    category: event.category,
  }));

  return crypto
    .createHash("sha256")
    .update(JSON.stringify({
      message: message.toLowerCase(),
      history: historyKey,
      events: eventKey,
    }))
    .digest("hex");
}

function getCachedReply(cacheKey) {
  const cached = chatResponseCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.createdAt > CHAT_CACHE_TTL_MS) {
    chatResponseCache.delete(cacheKey);
    return null;
  }

  return cached.reply;
}

function setCachedReply(cacheKey, reply) {
  chatResponseCache.set(cacheKey, {
    reply,
    createdAt: Date.now(),
  });

  if (chatResponseCache.size > 500) {
    const oldestKey = chatResponseCache.keys().next().value;
    if (oldestKey) {
      chatResponseCache.delete(oldestKey);
    }
  }
}

router.post("/", chatRateLimit, chatQuotaRateLimit, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const history = normalizeHistory(req.body?.conversationHistory);

  if (!apiKey) {
    console.error("POST /api/chat error: GEMINI_API_KEY is not configured");
    return res.status(500).json({ error: "Chat service is not configured" });
  }

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  if (message.length > 500) {
    return res.status(400).json({ error: "message must be 500 characters or fewer" });
  }

  try {
    const safeEvents = await loadEventContext();
    const relatedEvents = getRelevantEvents(safeEvents, message);
    const cacheKey = buildCacheKey(message, history, safeEvents);
    const cachedReply = getCachedReply(cacheKey);

    if (cachedReply) {
      return res.json({ reply: cachedReply, events: relatedEvents, cached: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history,
    });

    const prompt = [
      "These are the only campus events you may use to answer the user.",
      "If the user asks something unrelated to these campus events, say you can only help with campus events.",
      "Keep the reply concise and easy to read for a public user.",
      "Use short paragraphs or compact bullet-style lines in plain text.",
      "Do not invent links.",
      "",
      "Campus events:",
      JSON.stringify(safeEvents, null, 2),
      "",
      `User question: ${message}`,
    ].join("\n");

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const reply = response.text().trim();

    setCachedReply(cacheKey, reply);

    return res.json({ reply, events: relatedEvents });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return res.status(500).json({ error: "Failed to generate chat response" });
  }
});

module.exports = router;
