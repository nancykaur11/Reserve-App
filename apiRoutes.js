const express = require("express");
const router = express.Router();
const { mongoose } = require("./db");
const TripDetail= require("./models/TripDetails");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: "rzp_test_ISZIkTa5BDsapy",
  key_secret: "cdo8ce5WDCOtRCnsHk6uyMdq",
});

router.get("/", (req, res) => {
  res.json("This is Trip Api");
});

router.get("/tripdetails", async (req, res) => {
  try {
    const buses = await TripDetail.find();
    res.json(buses);
  } catch (error) {
    console.error("Error fetching bus data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/trips", async (req, res) => {
    const {
      date,
      from,
      to,
      startTime,
      departure,
      startRating,
      endRating,
      operators,
    } = req.query;
  
    const filter = {};
  
    if (date) filter.date = date;
    if (from) filter.from = from;
    if (to) filter.to = to;
    if (startTime) filter.startTime = startTime;
    if (departure) filter.departure = departure;
    if (startRating) filter.startRating = startRating;
    if (endRating) filter.endRating = endRating;
    if (operators) filter.operators = operators;
  
    try {
      const result = await TripDetail.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "bus_details",
            localField: "busName",
            foreignField: "name",
            as: "schedules",
          },
        },
      ]);
  
      res.json(result);
    } catch (err) {
      console.error("Error fetching trips:", err);
      res.status(500).json({ error: "Error fetching trips" });
    }
  });

  router.get("/trips/date", async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }
    //const tripCollection = mongoose.connection.collection("trips_details");
    const filteredTrips = await TripDetail.find({ date: date }).toArray();
    res.json(filteredTrips);
  });

  router.get("/api/buses", async (req, res) => {
    try {const result = await TripDetail
        .aggregate([
          {
            $lookup: {
              from: "bus_details",
              localField: "busName",
              foreignField: "name",
              as: "sch",
            },
          },
        ])
        .toArray();
     res.json(result);
    } catch (err) {
      console.error("Error retrieving data from MongoDB", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  
module.exports = router;
