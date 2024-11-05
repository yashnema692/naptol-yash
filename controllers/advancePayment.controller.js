const Model = require("../models/advancePayment.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Farmer";
const { uploadImage } = require("../Helpers/helper_functions");
const { modelName } = require("../models/crops.model");

module.exports = {
    create: async (req, res, next) => {
        try {
          const data = req.body;
          console.log("data", data);
      
          // Validate required fields
          if (!data.receiver) {
            return res.status(400).json({ error: "Receiver is required." });
          }
      
          if (!data.amount) {
            return res.status(400).json({ error: "Amount is required." });
          }
      
          // Optionally, check for unique receiver if this needs to be unique
          const existingAdvance = await Model.findOne({ receiver: data.receiver });
          if (existingAdvance) {
            return res.status(400).json({ error: "Receiver must be unique." });
          }
      
          // Add the `created_by` field if user data is available
          if (req.user) {
            data.created_by = req.user.id;
          }
      
          // Create a new Advance entry
          const newAdvance = new Model(data);
          const result = await newAdvance.save();
      
          // Return success response
          res.status(201).json(result);
        } catch (error) {
          console.error("Error saving advance:", error);
          next(createError(500, "Failed to save advance."));
        }
      },
    //   list: async (req, res, next) => {
    //     try {
    //       const { Type, receiver, disabled, is_inactive, page, limit, order_by, order_in } = req.query;
      
    //       // Set default values for pagination
    //       const _page = page ? parseInt(page) : 1;
    //       const _limit = limit ? parseInt(limit) : 20;
    //       const _skip = (_page - 1) * _limit;
      
    //       // Sorting configuration
    //       let sorting = {};
    //       if (order_by) {
    //         sorting[order_by] = order_in === "desc" ? -1 : 1;
    //       } else {
    //         sorting["_id"] = -1;
    //       }
      
    //       // Query filtering
    //       const query = {};
          
    //       if (Type) {
    //         query.Type = new RegExp(Type, "i"); // Case-insensitive match for 'Type'
    //       }
      
    //       if (receiver) {
    //         query.receiver = receiver; // Exact match for 'receiver'
    //       }
      
    //       query.disabled = { $ne: true }; // Exclude disabled records
    //       query.is_inactive = { $ne: true }; // Exclude inactive records
      
    //       // Fetch results from the database using aggregation
    //       let result = await Model.aggregate([
    //         { $match: query },
    //         { $sort: sorting },
    //         { $skip: _skip },
    //         { $limit: _limit }
    //       ]);
      
    //       // Count the total number of matching documents
    //       const resultCount = await Model.countDocuments(query);
      
    //       // Send response with data and pagination info
    //       res.json({
    //         data: result,
    //         meta: {
    //           current_page: _page,
    //           from: _skip + 1,
    //           last_page: Math.ceil(resultCount / _limit),
    //           per_page: _limit,
    //           to: _skip + result.length,
    //           total: resultCount,
    //         },
    //       });
    //     } catch (error) {
    //       console.error("Error listing advances:", error);
    //       next(createError(500, "Failed to list advances."));
    //     }
    //   },
    list: async (req, res, next) => {
        try {
          const { Type, receiver, disabled, is_inactive, page, limit, order_by, order_in } = req.query;
      
          // Set default values for pagination
          const _page = page ? parseInt(page) : 1;
          const _limit = limit ? parseInt(limit) : 20;
          const _skip = (_page - 1) * _limit;
      
          // Sorting configuration
          let sorting = {};
          if (order_by) {
            sorting[order_by] = order_in === "desc" ? -1 : 1;
          } else {
            sorting["_id"] = -1;
          }
      
          // Query filtering
          const query = {};
          
          if (Type) {
            query.Type = new RegExp(Type, "i"); // Case-insensitive match for 'Type'
          }
      
          if (receiver) {
            query.receiver = receiver; // Exact match for 'receiver'
          }
      
          query.disabled = { $ne: true }; // Exclude disabled records
          query.is_inactive = { $ne: true }; // Exclude inactive records
      
          // Aggregate pipeline
          let result = await Model.aggregate([
            { $match: query },
            { $sort: sorting },
            { $skip: _skip },
            { $limit: _limit },
            {
                $lookup: {
                  from: "farmers",
                  localField: "details",
                  foreignField: "_id",
                  as: "detailsFarmerInfo",
                },
              },
              {
                $lookup: {
                  from: "trucks",
                  localField: "details",
                  foreignField: "_id",
                  as: "detailsTruckInfo",
                },
              },
            { $unwind: { path: "$detailsFarmerInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$detailsTruckInfo", preserveNullAndEmptyArrays: true } }, // Unwind to extract the object
          ]);
      
          // Count the total number of matching documents
          const resultCount = await Model.countDocuments(query);
      
          // Send response with data and pagination info
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
          console.error("Error listing advances:", error);
          next(createError(500, "Failed to list advances."));
        }
      },
      
    update: async (req, res, next) => {
        try {
          // Extract the ID from the request parameters
          const { id } = req.params;
      
          // Check if the ID is provided
          if (!id) {
            throw createError.BadRequest("Invalid Parameters: Missing ID");
          }
      
          // Extract the data to be updated from the request body
          const data = req.body;
      
          // Ensure data is provided in the request body
          if (!data || Object.keys(data).length === 0) {
            throw createError.BadRequest("Invalid Parameters: No data provided");
          }
      
          // Set the updated_at timestamp to the current time
          data.updated_at = Date.now();
      
          // Perform the update operation using Mongoose's findByIdAndUpdate
          const result = await Model.findByIdAndUpdate(
            id,
            { $set: data }, // Update only the fields provided in 'data'
            { new: true }   // Return the updated document
          );
      
          // If no document is found by the given ID, return a 404 error
          if (!result) {
            throw createError.NotFound("Advance not found");
          }
      
          // Respond with the updated document
          res.json(result);
        } catch (error) {
          // Handle validation errors from Joi or other error types
          if (error.isJoi === true) error.status = 422;
          res.status(error.status || 500).send({
            error: {
              status: error.status || 500,
              message: error.message,
            },
          });
        }
      },
      delete :async (req, res, next) => {
        try {
          const { id } = req.params;
      
          if (!id) {
            throw createError.BadRequest("Invalid Parameters: Missing ID");
          }
      
          const deleted_at = Date.now();
      
          // Marking the advance entry as deleted by setting 'disabled' and 'deleted_at'
          const result = await Model.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $set: { disabled: true, deleted_at } }
          );
      
          if (result.nModified === 0) {
            throw createError.NotFound("Advance not found or already deleted");
          }
      
          res.json({ message: "Advance deleted successfully", result });
        } catch (error) {
          next(error);
        }
      },
      get:async (req, res, next) => {
        try {
          const { id } = req.params;
      
          if (!id) {
            throw createError.BadRequest("Invalid Parameters: Missing ID");
          }
      
          // Fetch the advance entry by ID
          const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id), disabled: false });
      
          if (!result) {
            throw createError.NotFound("No Advance Found");
          }
      
          res.json(result);
        } catch (error) {
          next(error);
        }
      }
      
}