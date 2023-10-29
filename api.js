const express = require("express");
const router = express.Router();

const { mongoose } = require("./db");

router.get("/", async (req, res) => {
  try {
    const limit = 50;
    const tripCollection = mongoose.connection.collection("trips_details");
    const trips = await tripCollection.find({}).limit(limit).toArray();
    res.json(trips);
  } catch (error) {
    console.error("Error retrieving past trips:", error);
    res.status(500).json({ error: "Error retrieving past trips" });
  }
});


router.get('/trips', async (req, res) => {
  const {
    date,
    from,
    to,
    arrival,
    departure,
    startRating,
    endRating,
    operators,
  } = req.query;

  const filter = {};

  if (date) {
    filter.date = new Date(parseInt(date));
  }
  if (from) {
    filter.from = from;
  }
  if (to) {
    filter.to = to;
  }
  if (arrival) {
    filter.arrival = arrival;
  }
  if (departure) {
    filter.departure = departure;
  }
  if (startRating) {
    filter.startRating = startRating;
  }
  if (endRating) {
    filter.endRating = endRating;
  }
  if (operators) {
    filter.operators = operators;
  }

  try {
    const tripCollection = mongoose.connection.collection("trips_details");
    const trips = await tripCollection.find(filter).toArray();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching trips' });
  }
});












module.exports = router;
