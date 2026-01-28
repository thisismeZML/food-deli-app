const OwnerProfile = require("../../models/owner-profile");
const mongoose = require("mongoose");
const PaymentMethod = require("../models/payment-method-model");
const PaymentProvider = require("../models/payment-provider-model");
const PaymentInstrument = require("../../models/payment-instrument-model");

const PayoutController = {
  // 1. Get all payment methods
  getPaymentMethods: async (req, res) => {
    try {
      // 🔥 FIXED: Use imported model
      const paymentMethods = await PaymentMethod
        .find({ isActive: true })
        .select("_id code name")
        .sort({ name: 1 });

      return res.status(200).json({
        success: true,
        message: "Payment methods fetched successfully",
        data: paymentMethods,
      });
    } catch (err) {
      console.error("Get payment methods error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment methods",
      });
    }
  },

  // 2. Get providers based on selected method
  getPaymentProviders: async (req, res) => {
    try {
      const { methodId } = req.params;

      if (!methodId || !mongoose.Types.ObjectId.isValid(methodId)) {
        return res.status(400).json({
          success: false,
          message: "Valid payment method ID is required",
        });
      }

      // 🔥 FIXED: Use imported model
      const providers = await PaymentProvider
        .find({
          method: methodId,
          isActive: true,
        })
        .select("_id code name")
        .sort({ name: 1 });

      return res.status(200).json({
        success: true,
        message: "Payment providers fetched successfully",
        data: providers,
      });
    } catch (err) {
      console.error("Get payment providers error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment providers",
      });
    }
  },

  // 3. Get instruments based on selected provider
  getPaymentInstruments: async (req, res) => {
    try {
      const { providerId } = req.params;

      if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
        return res.status(400).json({
          success: false,
          message: "Valid payment provider ID is required",
        });
      }

      // 🔥 FIXED: Use imported model
      const instruments = await PaymentInstrument
        .find({
          provider: providerId,
          isActive: true,
        })
        .select("_id type network name")
        .sort({ name: 1 });

      return res.status(200).json({
        success: true,
        message: "Payment instruments fetched successfully",
        data: instruments,
      });
    } catch (err) {
      console.error("Get payment instruments error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment instruments",
      });
    }
  },

  updateOwnerPayout: async (req, res) => {
    try {
      const { id } = req.params; // OwnerProfile ID
      const {
        payoutMethod,
        payoutProvider,
        payoutInstrument,
        accountNumber,
        accountName,
        phone,
      } = req.body;

      // Find owner profile
      const ownerProfile = await OwnerProfile.findById(id);
      if (!ownerProfile) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found",
        });
      }

      // Check if the requesting user owns this profile or is admin
      if (
        req.user.role !== "admin" &&
        ownerProfile.user.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own payout details",
        });
      }

      // Prepare update object
      const updates = {};

      // Update phone if provided
      if (phone !== undefined) {
        updates.phone = phone;
      }

      // Update payout details
      if (
        payoutMethod !== undefined ||
        payoutProvider !== undefined ||
        payoutInstrument !== undefined ||
        accountNumber !== undefined ||
        accountName !== undefined
      ) {
        updates.payout = { ...ownerProfile.payout.toObject() };

        if (payoutMethod !== undefined) {
          if (payoutMethod === null) {
            updates.payout.method = null;
            updates.payout.provider = null;
            updates.payout.instrument = null;
          } else {
            // 🔥 FIXED: Use imported model
            const methodExists = await PaymentMethod.findById(payoutMethod);
            if (!methodExists) {
              return res.status(400).json({
                success: false,
                message: "Payment method not found",
              });
            }
            updates.payout.method = payoutMethod;
          }
        }

        if (payoutProvider !== undefined) {
          updates.payout.provider = payoutProvider || null;
        }

        if (payoutInstrument !== undefined) {
          updates.payout.instrument = payoutInstrument || null;
        }

        if (accountNumber !== undefined) {
          updates.payout.accountNumber = accountNumber || null;
        }

        if (accountName !== undefined) {
          updates.payout.accountName = accountName || null;
        }

        // Update payout phone separately if needed
        if (phone !== undefined) {
          updates.payout.phone = phone;
        }
      }

      // Update the profile
      const updatedProfile = await OwnerProfile.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate([
        { path: "payout.method", select: "code name" },
        { path: "payout.provider", select: "code name" },
        { path: "payout.instrument", select: "type network name" },
      ]);

      return res.status(200).json({
        success: true,
        message: "Payout details updated successfully",
        data: updatedProfile,
      });
    } catch (err) {
      console.error("Update owner payout error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update payout details",
      });
    }
  },
};

module.exports = PayoutController;
