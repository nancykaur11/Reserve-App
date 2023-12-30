const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { mongoose } = require("./db");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: "rzp_test_ISZIkTa5BDsapy",
  key_secret: "cdo8ce5WDCOtRCnsHk6uyMdq",
});

router.get("/", (req, res) => {
  res.json("This is Trip Api");
});

router.get("/apis", async (req, res) => {
  try {
    const tripCollection = mongoose.connection.collection("trips_details");
    const trips = await tripCollection.find({}).toArray();
    res.json(trips);
  } catch (error) {
    console.error("Error retrieving past trips:", error);
    res.status(500).json({ error: "Error retrieving past trips", details: error.message });
  }
});

router.get("/api", async (req, res) => {
  try {
    const limit = 50;
    const tripCollection = mongoose.connection.collection("trips_details");
    
    const tripsCursor = tripCollection.find();
    const trips = await tripsCursor.toArray();

    // Manually limit the array if necessary
    const limitedTrips = trips.slice(0, limit);

    res.json(limitedTrips);
  } catch (error) {
    console.error("Error retrieving past trips:", error);
    res.status(500).json({ error: "Error retrieving past trips", details: error.message });
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

  if (date) {
    filter.date = date;
  }
  if (from) {
    filter.from = from;
  }
  if (to) {
    filter.to = to;
  }
  if (startTime) {
    filter.startTime = startTime;
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

    const filteredTrips = await tripCollection.find(filter).toArray();

    // Use the $lookup aggregation stage to join with 'bus_details'
    const result = await tripCollection
      .aggregate([
        {
          $match: {
            _id: { $in: filteredTrips.map((trip) => trip._id) },
          },
        },
        {
          $lookup: {
            from: 'bus_details',
            localField: 'busName',
            foreignField: 'name',
            as: 'schedules',
          },
        },
      ])
      .toArray();

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
  const tripCollection = mongoose.connection.collection("trips_details");
  const filteredTrips = await tripCollection.find({ date: date }).toArray();

  res.json(filteredTrips);
});

// router.post('/create-order', async (req, res) => {
//   try {
//     const options = {
//       amount: 50,
//       currency: "INR",
//       receipt: "order_rcptid_11"
//     };
//     const order = await razorpay.orders.create(options);
//     console.log(order,"orders")
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Error creating order with Razorpay" ,error});
//   }
// });

// router.post('/create-order', async (req, res) => {
//   try {
//     const options = {
//       amount: 100, // Set to at least 100 paise, which is the minimum required amount (equivalent to 1 INR)
//       currency: "INR",
//       receipt: "order_rcptid_11"
//     };
//     const order = await razorpay.orders.create(options);
//     console.log(order, "orders");
//     res.json(order);
//   } catch (error) {
//     console.error(error); // It's good to log the error to the console for debugging.
//     res.status(500).json({ error: "Error creating order with Razorpay", details: error });
//   }
// });
// router.post('/submit-payment', async (req, res) => {
//   try {
//     // Step 1 & 2: The card info is tokenized by the payment gateway on the client-side
//     const { token, amount } = req.body;

//     // Step 3: Use the token to make a payment request to the gateway
//     const paymentResult = await paymentGateway.processPayment({
//       token,
//       amount
//     });

//     // Step 4: Verify the payment result
//     if (paymentResult.success) {
//       // Step 5: Save the payment confirmation in the database
//       const paymentCollection = mongoose.connection.collection("trips_details");
//       const paymentConfirmation = await tripCollection.insertOne({
//         paymentId: paymentResult.id,
//         amount: paymentResult.amount,
//         status: 'completed',
//         date: new Date()
//       });

//       res.json({ success: true, message: "Payment processed and saved.", paymentId: paymentResult.id });
//     } else {
//       res.status(400).json({ success: false, message: "Payment failed.", error: paymentResult.error });
//     }
//   } catch (error) {
//     console.error("Error processing payment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


router.get('/api/buses', async (req, res) => {
  try {
    const busesCollection = mongoose.connection.collection("trips_details");
      const result = await busesCollection.aggregate([
          {
              $lookup: {
                  from: 'bus_details',
                  localField: 'busName',
                  foreignField: 'name',
                  as: 'schedules'
              }
          }
      ]).toArray();

      res.json(result);
  } catch (err) {
      console.error('Error retrieving data from MongoDB', err);
      res.status(500).send('Internal Server Error');
  }
});

router.post("/orders", async (req, res) => {
  try {
    // const instance = new Razorpay({
    // 	key_id: process.env.KEY_ID,
    // 	key_secret: process.env.KEY_SECRET,
    // });
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

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

// Mongoose model for orders (simplified)
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

// Endpoint to create an order
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

// Endpoint to verify payment
router.post("/verify-payment", async (req, res) => {
  const { payment_id, order_id } = req.body;
  res.json({ status: "Payment verified successfully" });
});

module.exports = router;
