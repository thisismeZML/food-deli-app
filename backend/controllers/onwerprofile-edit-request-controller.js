// controllers/ownerprofile-controller.js

const OwnerProfile = require("../models/ownerprofile-model");
const OwnerProfileEditRequest = require("../models/ownerprofile-edit-request-model");
const mongoose = require("mongoose");
const { sendEditRequestRejectedEmail, sendEditRequestApprovedEmail } = require("../helpers/email-service");
const PaymentMethod = require("../models/payment-method-model");
const PaymentProvider = require("../models/payment-provider-model");
const PaymentInstrument = require("../models/payment-instrument-model");

const OwnerProfileController = {
  // GET OWNER PROFILE (OWNER'S VIEW)
  getOwnerProfile: async (req, res) => {
    try {
      const ownerProfile = await OwnerProfile.findOne({ user: req.user.id })
        .populate({
          path: "payout.method",
          select: "code name",
        })
        .populate({
          path: "payout.provider",
          select: "code name",
        })
        .populate({
          path: "payout.instrument",
          select: "type network name",
        });

      if (!ownerProfile) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: ownerProfile,
      });
    } catch (err) {
      console.error("Get owner profile error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch owner profile",
      });
    }
  },

  // SUBMIT EDIT REQUEST (OWNER)
  submitEditRequest: async (req, res) => {
    try {
      const {
        name,
        phone,
        payoutMethod,
        payoutProvider,
        payoutInstrument,
        accountNumber,
        accountName,
      } = req.body;

      // Check if owner profile exists
      const ownerProfile = await OwnerProfile.findOne({ user: req.user.id });

      if (!ownerProfile) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found",
        });
      }

      // Check for pending edit requests
      const existingPendingRequest = await OwnerProfileEditRequest.findOne({
        ownerProfile: ownerProfile._id,
        status: "pending",
      });

      if (existingPendingRequest) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending edit request",
        });
      }

      // Validate payment method exists if provided
      let paymentMethodId = null;
      if (payoutMethod) {
        if (!mongoose.Types.ObjectId.isValid(payoutMethod)) {
          return res.status(400).json({
            success: false,
            message: "Invalid payment method ID",
          });
        }
        const methodExists = await PaymentMethod.findById(payoutMethod);
        if (!methodExists) {
          return res.status(400).json({
            success: false,
            message: "Payment method not found",
          });
        }
        paymentMethodId = payoutMethod;
      }

      // Validate provider exists if provided
      let paymentProviderId = null;
      if (payoutProvider) {
        if (!mongoose.Types.ObjectId.isValid(payoutProvider)) {
          return res.status(400).json({
            success: false,
            message: "Invalid payment provider ID",
          });
        }
        const providerExists = await PaymentProvider.findById(payoutProvider);
        if (!providerExists) {
          return res.status(400).json({
            success: false,
            message: "Payment provider not found",
          });
        }
        paymentProviderId = payoutProvider;
      }

      // Validate instrument exists if provided
      let paymentInstrumentId = null;
      if (payoutInstrument) {
        if (!mongoose.Types.ObjectId.isValid(payoutInstrument)) {
          return res.status(400).json({
            success: false,
            message: "Invalid payment instrument ID",
          });
        }
        const instrumentExists = await PaymentInstrument.findById(
          payoutInstrument
        );
        if (!instrumentExists) {
          return res.status(400).json({
            success: false,
            message: "Payment instrument not found",
          });
        }
        paymentInstrumentId = payoutInstrument;
      }

      // Track changes
      const changes = {};
      if (name && name !== ownerProfile.name) changes.name = name;
      if (phone && phone !== ownerProfile.phone) changes.phone = phone;

      // Create edit request
      const editRequest = await OwnerProfileEditRequest.create({
        ownerProfile: ownerProfile._id,
        user: req.user.id,
        name: name || ownerProfile.name,
        phone: phone || ownerProfile.phone,
        payout: {
          method: paymentMethodId || ownerProfile.payout?.method,
          provider: paymentProviderId || ownerProfile.payout?.provider,
          instrument: paymentInstrumentId || ownerProfile.payout?.instrument,
          accountNumber: accountNumber || ownerProfile.payout?.accountNumber,
          accountName: accountName || ownerProfile.payout?.accountName,
          phone: phone || ownerProfile.payout?.phone,
        },
        changes,
      });

      return res.status(201).json({
        success: true,
        message: "Edit request submitted successfully",
        data: editRequest,
      });
    } catch (err) {
      console.error("Submit edit request error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to submit edit request",
      });
    }
  },

  // GET PENDING EDIT REQUESTS (ADMIN)
  getEditRequests: async (req, res) => {
    try {
      let { page = 1, limit = 10, status = "pending", search = "" } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const searchQuery = { status };

      const editRequests = await OwnerProfileEditRequest.find(searchQuery)
        .populate({
          path: "ownerProfile",
          populate: {
            path: "user",
            select: "username email",
          },
        })
        .populate({
          path: "payout.method",
          select: "code name",
        })
        .populate({
          path: "payout.provider",
          select: "code name",
        })
        .populate({
          path: "payout.instrument",
          select: "type network name",
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await OwnerProfileEditRequest.countDocuments(
        searchQuery
      );

      return res.status(200).json({
        success: true,
        data: editRequests,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (err) {
      console.error("Get edit requests error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch edit requests",
      });
    }
  },

  // APPROVE EDIT REQUEST (ADMIN)
  approveEditRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;

      const editRequest = await OwnerProfileEditRequest.findById(id).populate(
        "ownerProfile"
      );

      const edituser = await OwnerProfileEditRequest.findById(id).populate(
        "user"
      );

      if (!editRequest) {
        return res.status(404).json({
          success: false,
          message: "Edit request not found",
        });
      }

      if (editRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Edit request is not pending",
        });
      }

      // Update owner profile with new data
      const updatedOwnerProfile = await OwnerProfile.findByIdAndUpdate(
        editRequest.ownerProfile._id,
        {
          name: editRequest.name,
          phone: editRequest.phone,
          payout: editRequest.payout,
        },
        { new: true }
      );

      // Update edit request status
      editRequest.status = "approved";
      editRequest.reviewedAt = new Date();
      editRequest.reviewedBy = req.user.id;
      editRequest.rejectionReason = null;
      await editRequest.save();

      // Log audit trail
      if (auditRemark) {
        await AuditLog.create({
          action: "APPROVE_OWNER_EDIT",
          userId: req.user.id,
          targetUserId: editRequest.user,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      // Send email notification
      await sendEditRequestApprovedEmail(
        edituser.user.email,
        edituser.user.username
      );

      return res.status(200).json({
        success: true,
        message: "Edit request approved successfully",
        data: {
          editRequest,
          ownerProfile: updatedOwnerProfile,
        },
      });
    } catch (err) {
      console.error("Approve edit request error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to approve edit request",
      });
    }
  },

  // REJECT EDIT REQUEST (ADMIN)
  rejectEditRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;

      const editRequest = await OwnerProfileEditRequest.findById(id);

      const edituser = await OwnerProfileEditRequest.findById(id).populate(
        "user"
      );

      if (!editRequest) {
        return res.status(404).json({
          success: false,
          message: "Edit request not found",
        });
      }

      if (editRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Edit request is not pending",
        });
      }

      editRequest.status = "rejected";
      editRequest.reviewedAt = new Date();
      editRequest.reviewedBy = req.user.id;
      editRequest.rejectionReason = auditRemark || null;
      await editRequest.save();

      // Log audit trail
      if (auditRemark) {
        await AuditLog.create({
          action: "REJECT_OWNER_EDIT",
          userId: req.user.id,
          targetUserId: editRequest.user,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      // Send email notification
      await sendEditRequestRejectedEmail(
        edituser.user.email,
        edituser.user.username
      );

      return res.status(200).json({
        success: false,
        message: "Edit request rejected",
        data: editRequest,
      });
    } catch (err) {
      console.error("Reject edit request error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to reject edit request",
      });
    }
  },
};

module.exports = OwnerProfileController;
