try {
  console.log("Loading razorpay package...");
  const Razorpay = require('razorpay');
  console.log("Loaded successfully.");
  console.log("Type of Razorpay:", typeof Razorpay);
  console.log("Razorpay keys/properties:", Object.keys(Razorpay));
  
  const instance = new Razorpay({
    key_id: 'rzp_test_LzQYFj61tq9X8R',
    key_secret: 'n9qC1h4Xz8RuY5tQ'
  });
  console.log("Instantiated successfully!");
} catch (err) {
  console.error("Instantiation failed:", err);
}
