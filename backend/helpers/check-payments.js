const mongoose = require("mongoose");
require("dotenv").config();
const PaymentMethod = require("../models/payment-method-model");
const PaymentProvider = require("../models/payment-provider-model");
const PaymentInstrument = require("../models/payment-instrument-model");

async function checkPayments() {
  await mongoose.connect(process.env.MONGOURL);


  console.log("=== PAYMENT METHODS ===");
  const methods = await PaymentMethod.find();
  methods.forEach(m => console.log(`${m._id} - ${m.code}: ${m.name}`));

  console.log("\n=== PAYMENT PROVIDERS ===");
  const providers = await PaymentProvider.find().populate("method", "code");
  providers.forEach(p => console.log(`${p._id} - ${p.code}: ${p.name} (${p.method.code})`));

  console.log("\n=== PAYMENT INSTRUMENTS ===");
  const instruments = await PaymentInstrument.find().populate({
    path: "provider",
    select: "code name",
    populate: {
      path: "method",
      select: "code"
    }
  });
  instruments.forEach(i => console.log(`${i._id} - ${i.name} (Provider: ${i.provider?.code})`));

  process.exit();
}

checkPayments().catch(console.error);
