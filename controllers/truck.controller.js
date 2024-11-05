const Model = require("../models/truck.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Truck";

module.exports = {
    create: async (req, res, next) => {
        try {
            const data = req.body;
            console.log("data", data);
            
            if (!data.truckNumber) {
                return res.status(400).json({ error: "Truck number is required." });
            }

            const existingTruck = await Model.findOne({ truckNumber: data.truckNumber });
            if (existingTruck) {
                return res.status(400).json({ error: "Truck number must be unique." });
            }

            if (req.user) {
                data.created_by = req.user.id;
            }

            const newTruck = new Model(data);
            const result = await newTruck.save();

            res.status(201).json(result);
        } catch (error) {
            console.error("Error saving truck:", error);
            next(createError(500, "Failed to save truck."));
        }
    },

    list: async (req, res, next) => {
        try {
            const { truckNumber, disabled, page, limit, order_by, order_in } = req.query;

            const _page = page ? parseInt(page) : 1;
            const _limit = limit ? parseInt(limit) : 20;
            const _skip = (_page - 1) * _limit;

            let sorting = {};
            if (order_by) {
                sorting[order_by] = order_in === "desc" ? -1 : 1;
            } else {
                sorting["_id"] = -1; 
            }

            const query = {};

            if (truckNumber) {
                query.truckNumber = new RegExp(truckNumber, "i"); 
            }

            query.disabled = { $ne: true }; 
            query.is_inactive = { $ne: true }; 
    
            console.log(query);

            const result = await Model.aggregate([
                { $match: query },
                { $sort: sorting },
                { $skip: _skip },
                { $limit: _limit },
            ]);

            const resultCount = await Model.countDocuments(query);

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
            next(error);
        }  
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params; 

            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }

            const data = req.body; 

            if (!data || Object.keys(data).length === 0) {
                throw createError.BadRequest("Invalid Parameters: No data provided");
            }

            data.updated_at = Date.now();

            const result = await Model.findByIdAndUpdate(
                id,                    
                { $set: data },        
                { new: true }           
            );

            if (!result) {
                throw createError.NotFound("Truck not found");
            }

            res.json(result);
        } catch (error) {
            if (error.isJoi === true) error.status = 422; 
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
            const { id } = req.params; 

            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }

            const deleted_at = Date.now();

            const result = await Model.updateOne(
                { _id: mongoose.Types.ObjectId(id) },   
                { $set: { disabled: true, deleted_at } }
            );

            if (result.nModified === 0) {
                throw createError.NotFound("Truck not found or already deleted");
            }

            res.json({ message: "Truck deleted successfully", result });
        } catch (error) {
            next(error); 
        }
    },

    get: async (req, res, next) => {
        try {
            const { id } = req.params; 

            if (!id) {
                throw createError.BadRequest("Invalid Parameters: Missing ID");
            }

            const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });

            if (!result) {
                throw createError.NotFound("No Truck Found");
            }

            res.json(result);
        } catch (error) {
            next(error); 
        }
    },
    getByType: async (req, res, next) => {
        try {
            const { truckNumber, disabled, page, limit, order_by, order_in } = req.query;
    
            const _page = page ? parseInt(page) : 1;
            const _limit = limit ? parseInt(limit) : 20;
            const _skip = (_page - 1) * _limit;
    
            let sorting = {};
            if (order_by) {
                sorting[order_by] = order_in === "desc" ? -1 : 1;
            } else {
                sorting["_id"] = -1; 
            }
    
            const query = {};
    
            // Filtering only premium truck type
            query.truckType = 'premium';
    
            if (truckNumber) {
                query.truckNumber = new RegExp(truckNumber, "i");
            }
    
            query.disabled = { $ne: true };
            query.is_inactive = { $ne: true };
    
            console.log(query);
    
            const result = await Model.aggregate([
                { $match: query },
                { $sort: sorting },
                { $skip: _skip },
                { $limit: _limit },
            ]);
    
            const resultCount = await Model.countDocuments(query);
    
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
            next(error);
        }
        
}
}
