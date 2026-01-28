const mongoose = require("mongoose");
const paymentMethodModel = require("../models/payment-method-model");
const paymentProviderModel = require("../models/payment-provider-model");
const paymentInstrumentModel = require("../models/payment-instrument-model");
require("dotenv").config();

async function seedPayments(force = false) {
  await mongoose.connect(process.env.MONGOURL);

  console.log("🌱 Seeding payment data...");

  if (force) {
    console.log("🧹 Force mode: Deleting old data...");
    await paymentInstrumentModel.deleteMany();
    await paymentProviderModel.deleteMany();
    await paymentMethodModel.deleteMany();
  }

  // 1️⃣ Payment Methods - Upsert
  const methodsData = [
    { code: "CASH", name: "Cash" },
    { code: "WALLET", name: "Mobile Wallet" },
    { code: "BANK", name: "Bank Transfer" },
    { code: "CARD", name: "Card Payment" },
  ];

  const methods = [];
  for (const methodData of methodsData) {
    const method = await paymentMethodModel.findOneAndUpdate(
      { code: methodData.code },
      methodData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    methods.push(method);
    console.log(`✓ ${method.code}: ${method.name}`);
  }

  // Helper function to get method ID
  const getMethod = (code) => methods.find((m) => m.code === code)._id;

  // 2️⃣ Payment Providers - Upsert
  const providersData = [
    // Wallets
    { method: getMethod("WALLET"), code: "AYAPAY", name: "Aya Pay" },
    { method: getMethod("WALLET"), code: "KPAY", name: "KPay" },
    { method: getMethod("WALLET"), code: "APLUS", name: "A+" },

    // Banks
    { method: getMethod("BANK"), code: "AYA", name: "AYA Bank" },
    { method: getMethod("BANK"), code: "KBZ", name: "KBZ Bank" },
    { method: getMethod("BANK"), code: "ABANK", name: "A Bank" },

    // Card Providers (with _CARD suffix as you wanted)
    { method: getMethod("CARD"), code: "AYA_CARD", name: "AYA Bank Cards" },
    { method: getMethod("CARD"), code: "KBZ_CARD", name: "KBZ Bank Cards" },
    { method: getMethod("CARD"), code: "A_CARD", name: "A Bank Cards" },
  ];

  const providers = [];
  for (const providerData of providersData) {
    const provider = await paymentProviderModel.findOneAndUpdate(
      {
        code: providerData.code,
        method: providerData.method
      },
      providerData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    providers.push(provider);
    console.log(`✓ ${provider.code}: ${provider.name}`);
  }

  // Helper function to get provider ID
  const getProvider = (methodCode, providerCode) => {
    const methodId = getMethod(methodCode);
    return providers.find(
      (p) => p.code === providerCode && p.method.toString() === methodId.toString()
    )._id;
  };

  // 3️⃣ Payment Instruments - Upsert (for CARD providers only)
  const cardProviders = providers.filter(
    (p) => p.method.toString() === getMethod("CARD").toString()
  );

  for (const provider of cardProviders) {
    // Visa Debit
    await paymentInstrumentModel.findOneAndUpdate(
      {
        provider: provider._id,
        type: "DEBIT",
        network: "VISA",
      },
      {
        provider: provider._id,
        type: "DEBIT",
        network: "VISA",
        name: `${provider.name.replace(" Cards", "")} Visa Debit`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Visa Credit
    await paymentInstrumentModel.findOneAndUpdate(
      {
        provider: provider._id,
        type: "CREDIT",
        network: "VISA",
      },
      {
        provider: provider._id,
        type: "CREDIT",
        network: "VISA",
        name: `${provider.name.replace(" Cards", "")} Visa Credit`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Optional: Add Mastercard versions
    await paymentInstrumentModel.findOneAndUpdate(
      {
        provider: provider._id,
        type: "DEBIT",
        network: "MASTER",
      },
      {
        provider: provider._id,
        type: "DEBIT",
        network: "MASTER",
        name: `${provider.name.replace(" Cards", "")} Mastercard Debit`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await paymentInstrumentModel.findOneAndUpdate(
      {
        provider: provider._id,
        type: "CREDIT",
        network: "MASTER",
      },
      {
        provider: provider._id,
        type: "CREDIT",
        network: "MASTER",
        name: `${provider.name.replace(" Cards", "")} Mastercard Credit`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✓ Created instruments for ${provider.name}`);
  }

  // Optional: Add some wallet-specific instruments if needed
  const ayaPayProviderId = getProvider("WALLET", "AYAPAY");
  await paymentInstrumentModel.findOneAndUpdate(
    { provider: ayaPayProviderId, name: "Aya Pay Wallet" },
    {
      provider: ayaPayProviderId,
      type: "DEBIT", // Using DEBIT as wallet type
      network: "VISA", // Not applicable but required
      name: "Aya Pay Wallet",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("\n✅ Payment seed completed!");
  console.log("📊 Summary:");
  console.log(`   • Methods: ${methods.length}`);
  console.log(`   • Providers: ${providers.length}`);

  const instrumentCount = await paymentInstrumentModel.countDocuments();
  console.log(`   • Instruments: ${instrumentCount}`);

  process.exit();
}

// Handle command line arguments
const force = process.argv.includes('--force') || process.argv.includes('-f');

seedPayments(force).catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
