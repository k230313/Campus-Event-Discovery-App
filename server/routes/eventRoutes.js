const express = require("express");
const router = express.Router();
const { eventFields } = require("../models/eventModel");
const validateEvent = require("../validation/eventValidation");

const events = [
  {
    id: 1,
    title: "Tech Talk",
    description: "Industry speaker session",
    date: "2026-04-20",
    location: "Main Hall",
    category: "Academic"
  },
  {
    id: 2,
    title: "Career Fair",
    description: "Meet employers on campus",
    date: "2026-04-22",
    location: "Student Center",
    category: "Career"
  }
];

router.get("/", (req, res) => {
  res.json(events);
});

router.get("/schema", (req, res) => {
  res.json(eventFields);
});

router.post("/", (req, res) => {
  const { isValid, errors } = validateEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const newEvent = {
    id: events.length + 1,
    ...req.body
  };

  events.push(newEvent);

  return res.status(201).json(newEvent);
});

module.exports = router;
