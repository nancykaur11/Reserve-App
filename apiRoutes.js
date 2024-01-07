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
  

  router.post("/orders", async (req, res) => {
    try {
      const razorpay = new Razorpay({
        key_id: "rzp_test_ISZIkTa5BDsapy",
        key_secret: "cdo8ce5WDCOtRCnsHk6uyMdq",
      });
  
      const options = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
      };
  
      razorpay.orders.create(options, (error, order) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Something Went Wrong!" });
        }
        res.status(200).json({ data: order });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error!" });
      console.log(error);
    }
  });
  
  // router.post("/verify", async (req, res) => {
  //   try {
  //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
  //       req.body;
  //     const sign = razorpay_order_id + "|" + razorpay_payment_id;
  //     const expectedSign = crypto
  //       .createHmac("sha256", process.env.KEY_SECRET)
  //       .update(sign.toString())
  //       .digest("hex");
  
  //     if (razorpay_signature === expectedSign) {
  //       return res.status(200).json({ message: "Payment verified successfully" });
  //     } else {
  //       return res.status(400).json({ message: "Invalid signature sent!" });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ message: "Internal Server Error!",error });
  //     console.log(error);
  //   }
  // });
  
  router.post("/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      // Debugging: Log the received values
      console.log("Received Values:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
  
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", "cdo8ce5WDCOtRCnsHk6uyMdq")
        .update(sign.toString())
        .digest("hex");
  
      // Debugging: Log the calculated signature
      console.log("Expected Signature:", expectedSign,razorpay_signature);
  
      if (razorpay_signature === expectedSign) {
        return res.status(200).json({ message: "Payment verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid signature sent!" });
      }
    } catch (error) {
      // Debugging: Log any errors
      console.error("Error in /verify:", error);
  
      res.status(500).json({ message: "Internal Server Error!", error });
    }
  });
  
  
  
  const Order = mongoose.model(
    "Order",
    new mongoose.Schema({
      orderId: String,
      paymentId: String,
      amount: Number,
      currency: String,
      status: String,
    })
  );
  
  router.post("/create-order", async (req, res) => {
    const payment_capture = 1;
    const amount = 500;
    const currency = "INR";
  
    const options = {
      amount: amount * 100,
      currency,
      receipt: "receipt#1",
      payment_capture,
    };
  
    try {
      const response = await razorpay.orders.create(options);
      let order = new Order({
        orderId: response.id,
        amount: response.amount,
        currency: response.currency,
        status: "created",
      });
      await order.save();
      res.json({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  router.post("/verify-payment", async (req, res) => {
    const { payment_id, order_id } = req.body;
    res.json({ status: "Payment verified successfully" });
  });
  
module.exports = router;
