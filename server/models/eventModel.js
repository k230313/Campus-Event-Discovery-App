// ============================================
// File:    eventModel.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements event Model for the backend.
// ============================================

const eventFields = {
  eventId: "number",
  title: "string",
  description: "string",
  date: "YYYY-MM-DD",
  startTime: "HH:MM:SS",
  endTime: "HH:MM:SS",
  location: "string",
  category: "string",
  image: "string | null",
  capacity: "number | null",
  registrationRequired: "boolean",
  status: "draft | pending | published | rejected | cancelled",
  notes: "string | null"
};

module.exports = { eventFields };
