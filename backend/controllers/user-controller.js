const User = require("../models/user-model");
const OwnerProfile = require("../models/ownerprofile-model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const removeFile = require("../helpers/remove-file");
const AuditLog = require("../models/auditlog-model");
const path = require("path");
const PaymentMethod = require("../models/payment-method-model");
const PaymentProvider = require("../models/payment-provider-model");
const PaymentInstrument = require("../models/payment-instrument-model");
const { sendOwnerWelcomeEmail } = require("../helpers/email-service");

const UserController = {
  getUsersList: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 5,
        search = "",
        sortBy = "username",
        order = "asc",
        role,
      } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const searchQuery = { isDeleted: false };

      if (search) {
        searchQuery.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (role) searchQuery.role = role;

      const sortOption = { [sortBy]: order === "asc" ? 1 : -1 };

      const users = await User.find(searchQuery)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort(sortOption);

      const totalUsers = await User.countDocuments(searchQuery);

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;

      // Validate ID
      if (!id || id === "undefined") {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role === "owner") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete owner user. Change role first.",
        });
      }

      // Delete user and associated owner profile (if exists)
      await User.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      });

      // Delete owner profile if it exists
      await OwnerProfile.findOneAndDelete({ user: id });

      // Log audit trail if needed
      if (auditRemark) {
        await AuditLog.create({
          action: "DELETE_USER",
          userId: req.user.id,
          targetUserId: id,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Find the user (only active users)
      const user = await User.findOne({ _id: id, isDeleted: false });

      if (!user) {
        // If file was uploaded but user not found, remove it
        if (req.file) {
          await removeFile(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Define updates object
      const updates = {};

      // Handle text fields from req.body
      const { username, email, role } = req.body;

      // Validate required fields
      if (username !== undefined) {
        if (!username.trim()) {
          return res.status(400).json({
            success: false,
            message: "Username cannot be empty",
          });
        }
        updates.username = username;
      }

      if (email !== undefined) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: "Invalid email format",
          });
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
          const existingUser = await User.findOne({
            email,
            _id: { $ne: id }, // Exclude current user
          });
          if (existingUser) {
            if (req.file) {
              await removeFile(req.file.path);
            }
            return res.status(400).json({
              success: false,
              message: "Email already in use",
            });
          }
        }
        updates.email = email;
      }

      // Handle role update (admin only)
      if (role !== undefined) {
        const validRoles = ["customer", "admin", "owner"];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid role",
          });
        }

        // Only update role if it's different
        if (role !== user.role) {
          updates.role = role;

          // If changing TO owner role
          if (role === "owner") {
            // Check if owner profile exists
            const existingOwnerProfile = await OwnerProfile.findOne({
              user: id,
            });
            if (!existingOwnerProfile) {
              // Create a basic owner profile with minimal data
              await OwnerProfile.create({
                user: id,
                name: updates.username || user.username,
                phone: "",
                verificationStatus: "pending",
                isVerified: false,
                createdAt: new Date(),
              });
            } else {
              // If owner profile exists but user lost owner role before,
              // update the profile status
              await OwnerProfile.findOneAndUpdate(
                { user: id },
                {
                  verificationStatus: "pending",
                  isVerified: false,
                  verifiedAt: null,
                  verifiedBy: null,
                  rejectionReason: null,
                }
              );
            }
          }
          // If changing FROM owner role
          else if (user.role === "owner" && role !== "owner") {
            // Delete the owner profile since user is no longer an owner
            await OwnerProfile.findOneAndDelete({ user: id });

            // Alternatively, if you want to keep it for audit purposes:
            // await OwnerProfile.findOneAndUpdate(
            //   { user: id },
            //   {
            //     verificationStatus: "rejected",
            //     isVerified: false,
            //     previousRole: "owner",
            //     roleChangedAt: new Date(),
            //   }
            // );
          }
        }
      }

      // Handle photo upload (your existing code remains the same)
      if (req.file) {
        // Generate new photo URL
        const photoUrl = `/uploads/${req.file.filename}`;
        updates.photo = photoUrl;

        // Remove old photo file if it exists
        if (user.photo) {
          const oldPhotoPath = user.photo.replace("/uploads/", "");
          const fullOldPath = path.join(
            __dirname,
            "../public/uploads",
            oldPhotoPath
          );
          try {
            await removeFile(fullOldPath);
          } catch (fileErr) {
            console.error("Failed to remove old photo:", fileErr);
          }
        }
      } else if (req.body.photo === null || req.body.photo === "") {
        // If photo is explicitly set to null/empty in request, remove it
        if (user.photo) {
          const oldPhotoPath = user.photo.replace("/uploads/", "");
          const fullOldPath = path.join(
            __dirname,
            "../public/uploads",
            oldPhotoPath
          );
          try {
            await removeFile(fullOldPath);
          } catch (fileErr) {
            console.error("Failed to remove old photo:", fileErr);
          }
        }
        updates.photo = null;
      }

      // If no updates, return early
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No updates provided",
        });
      }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      // Update owner profile name if username changed and user is an owner
      if (updates.username && updatedUser.role === "owner") {
        await OwnerProfile.findOneAndUpdate(
          { user: id },
          { name: updates.username }
        );
      }

      if (auditRemark) {
        await AuditLog.create({
          action: "UPDATE_USER",
          userId: req.user.id,
          targetUserId: id,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      console.error("Update user error:", err);

      // Clean up uploaded file if error occurred
      if (req.file) {
        try {
          await removeFile(req.file.path);
        } catch (fileErr) {
          console.error("Failed to remove uploaded file:", fileErr);
        }
      }

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  createUserByAdmin: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ message: "username, email, and password are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.file) {
          await removeFile(req.file.path);
        }
        return res.status(400).json({ message: "Email already in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const validRoles = ["customer", "admin", "owner"];

      const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: validRoles.includes(role) ? role : "customer",
        photo: photoUrl,
      });

      await newUser.save();

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          photo: newUser.photo,
        },
      });
    } catch (err) {
      if (req.file) {
        try {
          await removeFile(req.file.path);
        } catch (fileErr) {
          console.error("Failed to remove uploaded file:", fileErr);
        }
      }
      return res.status(500).json({ message: err.message });
    }
  },

  ownerRegister: async (req, res) => {
    try {
      const {
        phone,
        payoutMethod,
        payoutProvider,
        payoutInstrument,
        accountNumber,
        accountName,
      } = req.body;

      const existingProfile = await OwnerProfile.findOne({
        user: req.user.id,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "You have already applied to become an owner",
        });
      }

      const user = await User.findById(req.user.id).select("username photo");

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

      if (payoutMethod && payoutProvider) {
        const provider = await mongoose.model("PaymentProvider").findOne({
          _id: payoutProvider,
          method: payoutMethod,
        });
        if (!provider) {
          return res.status(400).json({
            success: false,
            message: "Selected provider does not belong to the selected method",
          });
        }
      }

      // Validate that instrument belongs to selected provider
      if (payoutProvider && payoutInstrument) {
        const instrument = await mongoose.model("PaymentInstrument").findOne({
          _id: payoutInstrument,
          provider: payoutProvider,
        });
        if (!instrument) {
          return res.status(400).json({
            success: false,
            message:
              "Selected instrument does not belong to the selected provider",
          });
        }
      }

      // Create owner profile with new structure
      const ownerProfile = await OwnerProfile.create({
        user: req.user.id,
        name: user.username,
        phone,
        payout: {
          method: paymentMethodId,
          provider: paymentProviderId,
          instrument: paymentInstrumentId,
          accountNumber,
          accountName,
          phone: phone, // Duplicate for payout-specific phone if needed
        },
        verificationStatus: "pending",
        isVerified: false,
      });

      return res.status(201).json({
        success: true,
        message: "Owner registration submitted. Await admin approval.",
        data: {
          _id: ownerProfile._id,
          verificationStatus: ownerProfile.verificationStatus,
          isVerified: ownerProfile.isVerified,
        },
      });
    } catch (err) {
      console.error("Owner register error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to register owner",
      });
    }
  },

  approveOwnerByAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;
      const ownerProfile = await OwnerProfile.findById(id).populate("user");

      if (!ownerProfile) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found",
        });
      }

      // Update verification status and related fields
      ownerProfile.verificationStatus = "approved";
      ownerProfile.isVerified = true;
      ownerProfile.verifiedAt = new Date();
      ownerProfile.verifiedBy = req.user.id;
      ownerProfile.rejectionReason = null;

      await ownerProfile.save();

      // ✅ THIS IS WHERE WE CHANGE THE ROLE TO "OWNER"
      const user = await User.findByIdAndUpdate(ownerProfile.user._id, {
        role: "owner",
      });

      // Log audit trail if needed
      if (auditRemark) {
        await AuditLog.create({
          action: "APPROVE_OWNER",
          userId: req.user.id,
          targetUserId: id,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      const emailSent = await sendOwnerWelcomeEmail(user.email, user.username);

      if (!emailSent) {
        return res
          .status(500)
          .json({ success: false, message: "Email sending failed" });
      }

      return res.status(200).json({
        success: true,
        message: "Owner approved successfully",
        data: {
          _id: ownerProfile._id,
          verificationStatus: ownerProfile.verificationStatus,
          isVerified: ownerProfile.isVerified,
          verifiedAt: ownerProfile.verifiedAt,
          user: {
            _id: ownerProfile.user._id,
            role: "owner", // Return updated role
          },
        },
      });
    } catch (err) {
      console.error("Approve owner error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to approve owner",
      });
    }
  },

  rejectOwnerByAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { auditRemark } = req.body;

      const ownerProfile = await OwnerProfile.findById(id).populate("user");

      if (!ownerProfile) {
        return res.status(404).json({
          success: false,
          message: "Owner profile not found",
        });
      }

      // Update verification status
      ownerProfile.verificationStatus = "rejected";
      ownerProfile.isVerified = false;
      ownerProfile.verifiedAt = null;
      ownerProfile.verifiedBy = null;
      ownerProfile.rejectionReason = auditRemark || null;

      await ownerProfile.save();

      if (ownerProfile.user.role === "owner") {
        await User.findByIdAndUpdate(ownerProfile.user._id, {
          role: "customer",
        });
      }

      // Log audit trail if needed
      if (auditRemark) {
        await AuditLog.create({
          action: "REJECT_OWNER",
          userId: req.user.id,
          targetUserId: id,
          remark: auditRemark,
          timestamp: new Date(),
        });
      }

      await sendOwnerRejectionEmail(
        ownerProfile.user.email,
        ownerProfile.user.username
      );

      return res.status(200).json({
        success: true,
        message: "Owner application rejected",
        data: {
          _id: ownerProfile._id,
          verificationStatus: ownerProfile.verificationStatus,
          isVerified: ownerProfile.isVerified,
          rejectionReason: ownerProfile.rejectionReason,
        },
      });
    } catch (err) {
      console.error("Reject owner error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to reject owner application",
      });
    }
  },

  getOwnerProfiles: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc",
        verificationStatus,
        isVerified,
        payoutMethod,
      } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const searchQuery = {};

      // Filter by verification status
      if (verificationStatus) {
        searchQuery.verificationStatus = verificationStatus;
      }

      // Filter by isVerified
      if (isVerified !== undefined) {
        searchQuery.isVerified = isVerified === "true" || isVerified === true;
      }

      // Build the base query with full population
      const query = OwnerProfile.find(searchQuery)
        .populate({
          path: "user",
          select: "-password",
          match: { isDeleted: false },
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
        .sort({ [sortBy]: order === "asc" ? 1 : -1 });

      let ownerProfiles = await query;

      // Filter out deleted users
      ownerProfiles = ownerProfiles.filter((profile) => profile.user !== null);

      // Apply search filter if needed
      if (search) {
        const searchLower = search.toLowerCase();
        ownerProfiles = ownerProfiles.filter(
          (profile) =>
            (profile.name &&
              profile.name.toLowerCase().includes(searchLower)) ||
            (profile.phone &&
              profile.phone.toLowerCase().includes(searchLower)) ||
            (profile.payout?.accountName &&
              profile.payout.accountName.toLowerCase().includes(searchLower)) ||
            (profile.user.username &&
              profile.user.username.toLowerCase().includes(searchLower)) ||
            (profile.user.email &&
              profile.user.email.toLowerCase().includes(searchLower)) ||
            (profile.payout?.method?.name &&
              profile.payout.method.name.toLowerCase().includes(searchLower)) ||
            (profile.payout?.provider?.name &&
              profile.payout.provider.name.toLowerCase().includes(searchLower))
        );
      }

      // Filter by payout method if specified
      if (payoutMethod) {
        ownerProfiles = ownerProfiles.filter(
          (profile) =>
            profile.payout?.method &&
            profile.payout.method._id.toString() === payoutMethod
        );
      }

      // Get total count
      const totalCount = await OwnerProfile.countDocuments(searchQuery);

      return res.status(200).json({
        success: true,
        message: "Owner profiles fetched successfully",
        data: ownerProfiles,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (err) {
      console.error("Get owner profiles error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch owner profiles",
      });
    }
  },
};
module.exports = UserController;
