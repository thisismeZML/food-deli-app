const Cuisine = require("../models/cuisine-model");

const CuisineController = {
    get: async (req, res) => {
        try {
            const cuisines = await Cuisine.find();
            res.status(200).json({
                success: true,
                message: "Cuisines fetched successfully",
                data: cuisines,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Server Error",
                error: err.message,
            });
        }
    },
}

module.exports = CuisineController;
