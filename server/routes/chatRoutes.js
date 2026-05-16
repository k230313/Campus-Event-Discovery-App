const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");
const { chatRateLimit } = require("../middleware/security");

const router = express.Router();

const SYSTEM_PROMPT = "You are a campus event assistant. You only answer questions about the campus events provided to you. If asked anything unrelated, politely say you can only help with campus events.";

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

router.post("/", chatRateLimit, async (req, res) => {
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
      "",
      "Campus events:",
      JSON.stringify(safeEvents, null, 2),
      "",
      `User question: ${message}`,
    ].join("\n");

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const reply = response.text().trim();

    return res.json({ reply });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return res.status(500).json({ error: "Failed to generate chat response" });
  }
});

module.exports = router;
