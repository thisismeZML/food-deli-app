const mongoose = require("mongoose");

const openingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Opening time must be in HH:MM format (24-hour)",
    },
  },
  close: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Closing time must be in HH:MM format (24-hour)",
    },
  },
  isClosed: { type: Boolean, default: false },
});

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          // Improved phone validation
          return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ""));
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    totalReviews: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    cuisine: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cuisine",
        required: [true, "At least one cuisine is required"],
        // Remove the entire validate object
      },
    ],
    priceRange: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4, 5],
        message: "{VALUE} is not a valid price range",
      },
      required: [true, "Price range is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    logo: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    serviceType: {
      type: [String],
      enum: {
        values: ["dine-in", "takeaway", "delivery"],
        message: "{VALUE} is not a valid service type",
      },
      default: ["dine-in"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one service type must be selected",
      },
    },
    openingHours: {
      monday: openingHoursSchema,
      tuesday: openingHoursSchema,
      wednesday: openingHoursSchema,
      thursday: openingHoursSchema,
      friday: openingHoursSchema,
      saturday: openingHoursSchema,
      sunday: openingHoursSchema,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, "Delivery fee cannot be negative"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
restaurantSchema.index({ location: "text", name: "text" });
restaurantSchema.index({ "address.coordinates": "2dsphere" });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ isDeleted: 1, status: 1 });

// Virtual for average rating (if you have separate reviews)
restaurantSchema.virtual("averageRating").get(function () {
  return this.totalReviews > 0 ? this.rating / this.totalReviews : 0;
});



const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
