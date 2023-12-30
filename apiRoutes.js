// apiRoutes.js
const express = require("express");
const router = express.Router();
const { mongoose } = require("./db");
const Bus = require("./models/Bus");

router.get("/", (req, res) => {
  res.json("This is Trip Api");
});

router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    console.error("Error fetching bus data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
