const Model = require("../models/parties.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Parties";
const {
  uploadImage,
} = require("../Helpers/helper_functions");


module.exports = {
    create: async (req, res, next) => {
        try {
            const data = req.body; // Extracting data from request body
            console.log("data", data);
            
            // Check if the title is provided
            if (!data.name) {
                return res.status(400).json({ error: "Party is required." });
            }
    
            // Check for duplicate title
            const existingParty = await Model.findOne({ name: data.name });
            if (existingParty) {
                return res.status(400).json({ error: "party must be unique." });
            }
    
            // Assign the `created_by` field from the authenticated user's ID
            if (req.user) {
                data.created_by = req.user.id;
            }
    
            // Create a new Party instance with the provided data
            const newParty = new Model(data);
            
            // Save the new party to the database
            const result = await newParty.save();
    
            // Respond with the saved party and a status of 201 (Created)
            res.status(201).json(result);
        } catch (error) {
            console.error("Error saving party:", error);
            next(createError(500, "Failed to save party.")); // Handle errors and send a 500 response
        }
    },
    
    list: async (req, res, next) => {
        try {
            const { name, disabled, page, limit, order_by, order_in } = req.query;
    
            const _page = page ? parseInt(page) : 1;
            const _limit = limit ? parseInt(limit) : 20;
            const _skip = (_page - 1) * _limit;
    
            // Define sorting logic
            let sorting = {};
            if (order_by) {
                sorting[order_by] = order_in === "desc" ? -1 : 1;
            } else {
                sorting["_id"] = -1; // Default sorting by _id (descending)
            }
    
            const query = {};
    
            // Filter by title if provided (case-insensitive)
            if (name) {
                query.name = new RegExp(name, "i");
            }
    
            query.disabled = { $ne: true }; 

            query.is_inactive = { $ne: true }; 
        
            console.log(query);
    
            // Aggregate query to get parties with applied filters, pagination, and sorting
            let result = await Model.aggregate([
                {
                    $match: query, // Apply query filters
                },
                {
                    $sort: sorting, // Apply sorting
                },
                {
                    $skip: _skip, // Skip for pagination
                },
                {
                    $limit: _limit, // Limit for pagination
                },
            ]);
    
            // Count total number of results for pagination metadata
            const resultCount = await Model.countDocuments(query);
    
            // Respond with data and pagination metadata
            res.json({
                data: result,
                meta: {
                    current_page: _page,
                    from: _skip + 1,
                    last_page: Math.ceil(resultCount / _limit),
                    per_page: _limit,
                    to: _skip + result.length,
                    total: resultCount,
                },
            });
        } catch (error) {
            next(error); // Handle errors
        }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params; // Extracting party ID from the request parameters
    
            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }
    
            const data = req.body; // Extracting the update data from the request body
    
            if (!data || Object.keys(data).length === 0) {
                throw createError.BadRequest("Invalid Parameters: No data provided");
            }
    
            data.updated_at = Date.now(); // Updating the 'updated_at' field with the current time
    
            // Updating the Party document by ID and returning the updated document
            const result = await Model.findByIdAndUpdate(
                id,                    // The Party document ID
                { $set: data },         // Setting the new data
                { new: true }           // Returning the updated document
            );
    
            if (!result) {
                throw createError.NotFound("Party not found");
            }
    
            res.json(result); // Sending the updated Party document as a response
        } catch (error) {
            if (error.isJoi === true) error.status = 422; // Handling validation errors
            res.status(error.status || 500).send({
                error: {
                    status: error.status || 500,
                    message: error.message,
                },
            });
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params; // Extracting party ID from the request parameters
    
            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }
    
            const deleted_at = Date.now(); // Setting the current timestamp for the deleted_at field
    
            // Performing a soft delete by marking the party as inactive and setting the deleted_at timestamp
            const result = await Model.updateOne(
                { _id: mongoose.Types.ObjectId(id) },    // Finding the party by ID
                { $set: { disabled: true, deleted_at } } // Marking as disabled (inactive) and updating deleted_at field
            );
    
            if (result.nModified === 0) {
                throw createError.NotFound("Party not found or already deleted");
            }
    
            res.json({ message: "Party deleted successfully", result });
        } catch (error) {
            next(error); // Handling errors and passing them to the error handler
        }
    },
    get: async (req, res, next) => {
        try {
            const { id } = req.params; // Extracting party ID from the request parameters
    
            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }
    
            // Finding the party document by its ID
            const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
    
            if (!result) {
                throw createError.NotFound("No Party Found");
            }
    
            // Sending the found party document as a response
            res.json(result);
        } catch (error) {
            next(error); // Handling any errors that occur
        }
    },   
    
}