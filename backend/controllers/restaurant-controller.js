const Restaurant = require("../models/restaurant-model");
const Cuisine = require("../models/cuisine-model");
const removeFile = require("../helpers/remove-file");

const RestaurantController = {
  // Create Restaurant
  create: async (req, res) => {
    try {
      const {
        name,
        location,
        cuisineIds,
        phone,
        email,
        description,
        serviceType = ["dine-in"],
        openingHours,
        priceRange,
        slug,
        deliveryFee = 0,
        address = {},
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !location ||
        !cuisineIds ||
        !phone ||
        !email ||
        !description ||
        !priceRange
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate cuisine IDs exist
      const cuisines = await Cuisine.find({ _id: { $in: cuisineIds } });
      if (cuisines.length !== cuisineIds.length) {
        return res.status(404).json({
          success: false,
          message: "One or more cuisines not found",
        });
      }

      // Check for existing restaurant with same name, location, or email
      const existing = await Restaurant.findOne({
        $or: [{ name, location }, { email }, { phone }],
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Restaurant with these details already exists",
        });
      }

      // Generate slug if not provided
      let restaurantSlug = slug;
      if (!restaurantSlug) {
        const baseSlug = name
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        restaurantSlug = baseSlug;

        // Check for duplicate slugs and append number if needed
        let counter = 1;
        while (await Restaurant.findOne({ slug: restaurantSlug })) {
          restaurantSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const restaurant = new Restaurant({
        owner: req.user.id,
        name,
        location,
        cuisine: cuisineIds,
        phone,
        email,
        description,
        serviceType,
        openingHours: openingHours || getDefaultOpeningHours(),
        priceRange,
        slug: restaurantSlug,
        deliveryFee,
        address,
        status: "pending",
      });

      await restaurant.save();

      // Populate related data
      const populatedRestaurant = await Restaurant.findById(restaurant._id)
        .populate("cuisine", "name description")
        .populate("owner", "username email photo")
        .lean();

      res.status(201).json({
        success: true,
        message: "Restaurant created successfully. Awaiting approval.",
        data: populatedRestaurant,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  // Get Restaurants with advanced filtering
  get: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        order = "asc",
        serviceType,
        priceRange,
        isOpen,
        location,
        minRating = 0,
        maxRating = 5,
        cuisineId,
        hasDelivery = false,
        status = "active",
      } = req.query;

      // Parse pagination parameters
      page = Math.max(1, parseInt(page));
      limit = Math.min(50, Math.max(1, parseInt(limit)));
      const skip = (page - 1) * limit;

      // Build query
      const query = { status: "active" }; // Only show active restaurants by default

      // Text search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } },
          { "address.state": { $regex: search, $options: "i" } },
        ];
      }

      // Filters
      if (serviceType) {
        query.serviceType = {
          $in: Array.isArray(serviceType) ? serviceType : [serviceType],
        };
      }

      if (priceRange) {
        const ranges = priceRange.split(",").map(Number);
        query.priceRange = { $in: ranges };
      }

      if (isOpen !== undefined) {
        query.isOpen = isOpen === "true";
      }

      if (location) {
        query["address.city"] = { $regex: new RegExp(location, "i") };
      }

      if (cuisineId) {
        query.cuisine = {
          $in: Array.isArray(cuisineId) ? cuisineId : [cuisineId],
        };
      }

      if (status) {
        query.status = status;
      }

      // Rating filter
      query.rating = { $gte: minRating, $lte: maxRating };

      // Delivery filter
      if (hasDelivery === "true") {
        query.serviceType = { $in: ["delivery"] };
        query.deliveryFee = { $gte: 0 };
      }

      // Sort options
      const sortOptions = {
        name: { name: order === "asc" ? 1 : -1 },
        rating: { rating: order === "asc" ? 1 : -1 },
        price: { priceRange: order === "asc" ? 1 : -1 },
        newest: { createdAt: -1 },
      };

      const sortOption = sortOptions[sortBy] || { name: 1 };

      // Execute query with pagination
      const [restaurants, total] = await Promise.all([
        Restaurant.find(query)
          .populate("cuisine", "name description icon")
          .populate("owner", "username email photo")
          .select("-isDeleted -deletedAt -__v")
          .skip(skip)
          .limit(limit)
          .sort(sortOption)
          .lean(),
        Restaurant.countDocuments(query),
      ]);

      // Calculate current status (open/closed) based on opening hours
      const restaurantsWithStatus = restaurants.map((restaurant) => ({
        ...restaurant,
        currentStatus: calculateCurrentStatus(restaurant.openingHours),
      }));

      res.status(200).json({
        success: true,
        message: "Restaurants fetched successfully",
        data: restaurantsWithStatus,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        filters: {
          search,
          sortBy,
          order,
          serviceType,
          priceRange,
        },
      });
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching restaurants",
        error: err.message,
      });
    }
  },

  // Get Single Restaurant by ID or Slug
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        $or: [{ _id: id }, { slug: id }],
      })
        .populate("cuisine", "name description icon")
        .populate("owner", "username email photo phone")
        .select("-isDeleted -deletedAt -__v")
        .lean();

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      // Add current open status
      restaurant.currentStatus = calculateCurrentStatus(
        restaurant.openingHours,
      );

      res.status(200).json({
        success: true,
        data: restaurant,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  // Update Restaurant
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (req.files) {
        if (req.files.logo) {
          updateData.logo = `/uploads/${req.files.logo[0].filename}`;
        }
        if (req.files.coverImage) {
          updateData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
        }
      }

      // Check if restaurant exists and user is owner
      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!restaurant) {
        // Clean up uploaded files if restaurant not found
        if (req.files) {
          if (req.files.logo) {
            await removeFile(req.files.logo[0].path);
          }
          if (req.files.coverImage) {
            await removeFile(req.files.coverImage[0].path);
          }
        }

        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      // Parse JSON strings if they exist
      if (updateData.address && typeof updateData.address === "string") {
        try {
          updateData.address = JSON.parse(updateData.address);
        } catch (error) {
          console.error("Error parsing address:", error);
        }
      }

      if (
        updateData.openingHours &&
        typeof updateData.openingHours === "string"
      ) {
        try {
          updateData.openingHours = JSON.parse(updateData.openingHours);
        } catch (error) {
          console.error("Error parsing openingHours:", error);
        }
      }

      // Prevent updating certain fields
      delete updateData.owner;
      delete updateData.rating;
      delete updateData.totalReviews;
      delete updateData.status;

      // If cuisine is being updated, validate cuisine IDs
      if (updateData.cuisineIds) {
        // cuisineIds might be a string or array (FormData sends multiple values with same key)
        let cuisineIds = updateData.cuisineIds;
        if (!Array.isArray(cuisineIds)) {
          cuisineIds = [cuisineIds];
        }

        const cuisines = await Cuisine.find({
          _id: { $in: cuisineIds },
        });

        if (cuisines.length !== cuisineIds.length) {
          // Clean up uploaded files if validation fails
          if (req.files) {
            if (req.files.logo) {
              await removeFile(req.files.logo[0].path);
            }
            if (req.files.coverImage) {
              await removeFile(req.files.coverImage[0].path);
            }
          }

          return res.status(404).json({
            success: false,
            message: "One or more cuisines not found",
          });
        }

        updateData.cuisine = cuisineIds;
        delete updateData.cuisineIds;
      }

      // Handle serviceType - might be string or array
      if (updateData.serviceType) {
        if (!Array.isArray(updateData.serviceType)) {
          updateData.serviceType = [updateData.serviceType];
        }
      }

      // Save old image paths to clean up later if needed
      const oldLogoPath = restaurant.logo;
      const oldCoverPath = restaurant.coverImage;

      // Update the restaurant
      Object.assign(restaurant, updateData);
      await restaurant.save();

      // Clean up old images if new ones were uploaded
      if (req.files && req.files.logo && oldLogoPath) {
        try {
          const oldPath = path.join(__dirname, "../public", oldLogoPath);
          await fs.promises.unlink(oldPath);
        } catch (fileErr) {
          console.error("Failed to remove old logo:", fileErr);
        }
      }

      if (req.files && req.files.coverImage && oldCoverPath) {
        try {
          const oldPath = path.join(__dirname, "../public", oldCoverPath);
          await fs.promises.unlink(oldPath);
        } catch (fileErr) {
          console.error("Failed to remove old cover image:", fileErr);
        }
      }

      const updatedRestaurant = await Restaurant.findById(id)
        .populate("cuisine", "name description")
        .populate("owner", "username email photo")
        .lean();

      res.status(200).json({
        success: true,
        message: "Restaurant updated successfully",
        data: updatedRestaurant,
      });
    } catch (err) {
      // Clean up uploaded files on error
      if (req.files) {
        try {
          if (req.files.logo) {
            await removeFile(req.files.logo[0].path);
          }
          if (req.files.coverImage) {
            await removeFile(req.files.coverImage[0].path);
          }
        } catch (fileErr) {
          console.error("Failed to clean up uploaded files:", fileErr);
        }
      }

      console.error("Update error details:", err);
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  // Delete/Soft Delete Restaurant
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      // Soft delete
      restaurant.isDeleted = true;
      restaurant.deletedAt = new Date();
      restaurant.status = "closed";
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: "Restaurant deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  approveRestaurant: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      restaurant.status = "active";
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: "Restaurant approved successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  suspendRestaurant: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      restaurant.status = "suspended";
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: "Restaurant suspended successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  closedRestaurant: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      restaurant.status = "closed";
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: "Restaurant closed successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  getMyRestaurants: async (req, res) => {
    try {
      const { id } = req.user;

      const restaurant = await Restaurant.findOne({
        owner: id,
        isDeleted: false,
      })
        .populate("cuisine", "name description")
        .populate("owner", "username email photo")
        .lean();

      res.status(200).json({
        success: true,
        data: restaurant,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  getPendingRestaurants: async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;

      page = Math.max(1, parseInt(page));
      limit = Math.min(50, Math.max(1, parseInt(limit)));
      const skip = (page - 1) * limit;

      const query = {
        status: "pending",
        isDeleted: false,
      };

      const [restaurants, total] = await Promise.all([
        Restaurant.find(query)
          .populate("owner", "username email phone createdAt")
          .populate("cuisine", "name")
          .select("name slug location phone email createdAt description logo")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Restaurant.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: restaurants,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get Pending Restaurants Error:", err);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      // Validate status
      if (!["pending", "active", "suspended", "closed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const restaurant = await Restaurant.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      const oldStatus = restaurant.status;
      restaurant.status = status;

      // Add to status history
      if (!restaurant.statusHistory) {
        restaurant.statusHistory = [];
      }

      restaurant.statusHistory.push({
        status,
        changedBy: req.user.id,
        reason: reason || "Status updated by admin",
        changedAt: new Date(),
      });

      // If suspending, also set isOpen to false
      if (status === "suspended") {
        restaurant.isOpen = false;
      }

      await restaurant.save();

      res.status(200).json({
        success: true,
        message: `Restaurant status updated to ${status}`,
        data: {
          id: restaurant._id,
          name: restaurant.name,
          oldStatus,
          newStatus: status,
        },
      });
    } catch (err) {
      console.error("Update Status Error:", err);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  toggleOpen: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        owner: req.user.id,
        isDeleted: false,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found or unauthorized",
        });
      }

      restaurant.isOpen = !restaurant.isOpen;
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: `Restaurant is now ${restaurant.isOpen ? "open" : "closed"}`,
        data: {
          id: restaurant._id,
          name: restaurant.name,
          isOpen: restaurant.isOpen,
        },
      });
    } catch (err) {
      console.error("Toggle Open Error:", err);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },

  // Restore deleted restaurant
  restore: async (req, res) => {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findOne({
        _id: id,
        isDeleted: true,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Deleted restaurant not found",
        });
      }

      // Only admin or original owner can restore
      if (
        restaurant.owner.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to restore this restaurant",
        });
      }

      restaurant.isDeleted = false;
      restaurant.deletedAt = null;
      restaurant.status = "pending"; // Needs re-approval
      await restaurant.save();

      res.status(200).json({
        success: true,
        message: "Restaurant restored successfully. Awaiting admin approval.",
        data: {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
        },
      });
    } catch (err) {
      console.error("Restore Restaurant Error:", err);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  },
};

// Helper Functions
function calculateCurrentStatus(openingHours) {
  const now = new Date();
  const day = now.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  if (!openingHours || !openingHours[day]) {
    return "closed";
  }

  const dayHours = openingHours[day];

  if (dayHours.isClosed) {
    return "closed";
  }

  const openTime = parseInt(dayHours.open.replace(":", ""));
  const closeTime = parseInt(dayHours.close.replace(":", ""));

  return currentTime >= openTime && currentTime <= closeTime
    ? "open"
    : "closed";
}

function getDefaultOpeningHours() {
  const defaultTime = { open: "09:00", close: "22:00", isClosed: false };
  return {
    monday: defaultTime,
    tuesday: defaultTime,
    wednesday: defaultTime,
    thursday: defaultTime,
    friday: defaultTime,
    saturday: defaultTime,
    sunday: { open: "10:00", close: "20:00", isClosed: false },
  };
}

module.exports = RestaurantController;
