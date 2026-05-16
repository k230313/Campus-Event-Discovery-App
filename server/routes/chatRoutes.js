const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { chatRateLimit } = require("../middleware/security");

const router = express.Router();

const SYSTEM_PROMPT = "You are a campus event assistant. You only answer questions about the campus events provided to you. If asked anything unrelated, politely say you can only help with campus events.";

function normalizeHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) {
    return [];
  }

  return conversationHistory
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
}

function normalizeEvents(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.slice(0, 50).map((event) => ({
    id: event?.id ?? null,
    title: event?.title ?? "",
    description: event?.description ?? "",
    date: event?.date ?? "",
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    location: event?.location ?? "",
    category: event?.category ?? "",
    organizerName: event?.organizerName ?? event?.organiser_name ?? "",
    status: event?.status ?? "",
  }));
}

router.post("/", chatRateLimit, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const safeEvents = normalizeEvents(req.body?.events);
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
