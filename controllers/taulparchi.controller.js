const Model = require("../models/taulparchi.model");
const createError = require("http-errors");
const mongoose = require("mongoose");

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      console.log("data", data);
      if (data.tulai === "Labour" && (!data.hammal || data.hammal === "")) {
        return res
          .status(400)
          .json({ error: "Hammal must be selected when Tulai is 'Labour'." });
      }
      if (data.hammal === "") {
        data.hammal = null;
      }
      // Validate required fields
      if (!data.farmer) {
        return res.status(400).json({ error: "Farmer is required." });
      }
      if (!data.village) {
        return res.status(400).json({ error: "Village is required." });
      }
      if (!data.firm_company) {
        return res.status(400).json({ error: "Firm/Company is required." });
      }
      if (!data.rate) {
        return res.status(400).json({ error: "Rate is required." });
      }

      if (!data.boraQuantity) {
        return res.status(400).json({ error: "Bora Quantity is required." });
      }
      if (!data.unitBora) {
        return res.status(400).json({ error: "Unit Bora is required." });
      }
      if (!data.bharti) {
        return res.status(400).json({ error: "Bharti is required." });
      }
      if (!data.crop) {
        return res.status(400).json({ error: "Crop is required." });
      }

      // Calculate netWeight using the formula: netWeight = (boraQuantity * unitBora) + bharti
      data.netWeight = data.boraQuantity * data.unitBora + data.bharti;

      // Check for duplicates (optional)
      const existingTaulParchi = await Model.findOne({
        farmer: data.farmer,
        village: data.village,
        firm_company: data.firm_company,
      });
      if (existingTaulParchi) {
        return res
          .status(400)
          .json({
            error:
              "A TaulParchi entry already exists with the same Farmer, Village, and Firm/Company.",
          });
      }

      // Assign the `created_by` field from the authenticated user's ID
      if (req.user) {
        data.created_by = req.user.id;
      }

      // Create a new TaulParchi instance with the provided data
      const newTaulParchi = new Model(data);
      const result = await newTaulParchi.save();
      console.log("data", result);

      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving TaulParchi:", error);
      next(createError(500, "Failed to save TaulParchi.")); // Handle errors and send a 500 response
    }
  },
  // list: async (req, res, next) => {
  //   try {
  //     const { crop, firm_company, disabled, page, limit, order_by, order_in } =
  //       req.query;

  //     const _page = page ? parseInt(page) : 1;
  //     const _limit = limit ? parseInt(limit) : 20;
  //     const _skip = (_page - 1) * _limit;

  //     // Define sorting logic
  //     let sorting = {};
  //     if (order_by) {
  //       sorting[order_by] = order_in === "desc" ? -1 : 1;
  //     } else {
  //       sorting["_id"] = -1;
  //     }

  //     const query = {};
  //     if (firm_company) {
  //       query.firm_company = new RegExp(firm_company, "i");
  //     }
  //     if (crop) {
  //       query.crop = new mongoose.Types.ObjectId(crop);
  //     }
  //     query.disabled = { $ne: true };
  //     query.is_inactive = { $ne: true };

  //     console.log(query);

  //     // Aggregate query to get taul parchis with applied filters, pagination, and sorting
  //     let result = await Model.aggregate([
  //       { $match: query },
  //       { $sort: sorting },
  //       { $skip: _skip },
  //       { $limit: _limit },
  //       {
  //         $lookup: {
  //           from: "farmers",
  //           localField: "farmer",
  //           foreignField: "_id",
  //           as: "farmerDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "villages",
  //           localField: "village",
  //           foreignField: "_id",
  //           as: "villageDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "hammals",
  //           localField: "hammal",
  //           foreignField: "_id",
  //           as: "hammalDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "crops",
  //           localField: "crop",
  //           foreignField: "_id",
  //           as: "cropDetails",
  //         },
  //       },
  //       {
  //         $unwind: "$cropDetails",
  //       },
  //       {
  //         $unwind: "$hammalDetails",
  //       },
  //       {
  //         $unwind: "$villageDetails",
  //       },
  //       {
  //         $unwind: "$farmerDetails",
  //       },
  //     ]);

  //     // Count total number of results for pagination metadata
  //     const resultCount = await Model.countDocuments(query);

  //     // Respond with data and pagination metadata
  //     res.json({
  //       data: result,
  //       meta: {
  //         current_page: _page,
  //         from: _skip + 1,
  //         last_page: Math.ceil(resultCount / _limit),
  //         per_page: _limit,
  //         to: _skip + result.length,
  //         total: resultCount,
  //       },
  //     });
  //     console.log("gvgcav",result)
  //   } catch (error) {
  //     next(error); // Handle errors
  //   }
  // },


  list: async (req, res, next) => {
    try {
      const { crop, firm_company, disabled, page, limit, order_by, order_in } = req.query;
  
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
  
      // Define sorting logic
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in === "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
  
      const query = {};
      if (firm_company) {
        query.firm_company = new RegExp(firm_company, "i");
      }
      if (crop) {
        query.crop = new mongoose.Types.ObjectId(crop);
      }
      query.disabled = { $ne: true };
      query.is_inactive = { $ne: true };
  
      console.log("Query:", query);
  
      // Aggregate query to get taul parchis with applied filters, pagination, and sorting
      let result = await Model.aggregate([
        { $match: query },
        { $sort: sorting },
        { $skip: _skip },
        { $limit: _limit },
        {
          $lookup: {
            from: "farmers",
            localField: "farmer",
            foreignField: "_id",
            as: "farmerDetails",
          },
        },
        {
          $lookup: {
            from: "villages",
            localField: "village",
            foreignField: "_id",
            as: "villageDetails",
          },
        },
        {
          $lookup: {
            from: "hammals",
            localField: "hammal",
            foreignField: "_id",
            as: "hammalDetails",
          },
        },
        {
          $lookup: {
            from: "crops",
            localField: "crop",
            foreignField: "_id",
            as: "cropDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$cropDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$hammalDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$villageDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$farmerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind:{
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },         
        },
      ]);
  
      console.log("Result:", result);
  
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
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: "Invalid Parameters: Missing ID" });
      }

      const data = req.body;

      if (!data) {
        return res.status(400).json({ error: "No data provided for update." });
      }

      // Validate required fields
      if (data.farmer === undefined) {
        return res.status(400).json({ error: "Farmer is required." });
      }
      if (data.village === undefined) {
        return res.status(400).json({ error: "Village is required." });
      }
      if (data.firm_company === undefined) {
        return res.status(400).json({ error: "Firm/Company is required." });
      }
      if (data.rate === undefined) {
        return res.status(400).json({ error: "Rate is required." });
      }
      if (data.hammal === undefined) {
        return res.status(400).json({ error: "Hammal is required." });
      }
      if (data.boraQuantity === undefined) {
        return res.status(400).json({ error: "Bora Quantity is required." });
      }
      if (data.unitBora === undefined) {
        return res.status(400).json({ error: "Unit Bora is required." });
      }
      if (data.bharti === undefined) {
        return res.status(400).json({ error: "Bharti is required." });
      }
      if (data.crop === undefined) {
        return res.status(400).json({ error: "Crop is required." });
      }

      // Calculate netWeight using the formula: netWeight = (boraQuantity * unitBora) + bharti
      data.netWeight = data.boraQuantity * data.unitBora + data.bharti;

      // Assign the `updated_at` field
      data.updated_at = Date.now();

      // Update the TaulParchi document by ID and return the updated document
      const result = await Model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      if (!result) {
        return res.status(404).json({ error: "TaulParchi not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating TaulParchi:", error);
      next(createError(500, "Failed to update TaulParchi.")); // Handle errors and send a 500 response
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw createError.BadRequest("Invalid Parameters: Missing ID");
      }

      const deleted_at = Date.now();

      // Performing a soft delete by marking the TaulParchi as inactive and setting the deleted_at timestamp
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { disabled: true, deleted_at } }
      );

      if (result.nModified === 0) {
        throw createError.NotFound("TaulParchi not found or already deleted");
      }

      res.json({ message: "TaulParchi deleted successfully", result });
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

      // Finding the TaulParchi document by its ID
      const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });

      if (!result) {
        throw createError.NotFound("No TaulParchi Found");
      }

      // Sending the found TaulParchi document as a response
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  getTaulparchisAggregatedData: async (req, res) => {
    try {
      const result = await Model.aggregate([
        {
          $lookup: {
            from: "crops",
            localField: "crop",
            foreignField: "_id",
            as: "cropDetails",
          },
        },
        { $unwind: "$cropDetails" },
        {
          $group: {
            _id: "$crop",
            crop_name: { $first: "$cropDetails.name" },
            totalUnitBoraBoraQuantity: {
              $sum: { $multiply: ["$unitBora", "$boraQuantity"] },
            },
            totalBharti: { $sum: "$bharti" },
            grandTotal: {
              $sum: {
                $add: [
                  "$bharti",
                  { $multiply: ["$unitBora", "$boraQuantity"] },
                ],
              },
            },
            grandRate: {
              $sum: {
                calculatedRate: {
                  $multiply: ["$rate", "$grandTotal"],
                },
              },
            },
          },
        },
      ]);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in aggregation:", error);

      res.status(500).json({
        success: false,
        message: "Error occurred while fetching data",
        error: error.message,
      });
    }
  },

  getTaulParchiDetails: async (req, res) => {
    try {
      const results = await Model.aggregate([
        {
          $lookup: {
            from: "farmers",
            localField: "farmer",
            foreignField: "_id",
            as: "farmerDetails",
          },
        },
        {
          $lookup: {
            from: "villages",
            localField: "village",
            foreignField: "_id",
            as: "villageDetails",
          },
        },
        {
          $lookup: {
            from: "hammals",
            localField: "hammal",
            foreignField: "_id",
            as: "hammalDetails",
          },
        },
        {
          $lookup: {
            from: "crops",
            localField: "crop",
            foreignField: "_id",
            as: "cropDetails",
          },
        },
        {
          $project: {
            _id: 1,
            farmerName: { $arrayElemAt: ["$farmerDetails.name", 0] },
            villageName: { $arrayElemAt: ["$villageDetails.name", 0] },
            hammalName: { $arrayElemAt: ["$hammalDetails.name", 0] },
            cropName: { $arrayElemAt: ["$cropDetails.name", 0] },
          },
        },
      ]);
      res.status(200).json(results);
    } catch (error) {
      throw new Error(error);
    }
  },
  getTaulParchiSummary: async (req, res) => {
    try {
      const { firm_company, page, limit, order_by, order_in, from, to } =
        req.query;

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
      if (firm_company) {
        query.firm_company = new RegExp(firm_company, "i");
      }

      // Add date range filter based on 'from' and 'to' params
      if (from || to) {
        query.created_at = {};
        if (from) {
          query.created_at.$gte = new Date(from);
        }
        if (to) {
          query.created_at.$lte = new Date(to);
        }
      }

      query.disabled = { $ne: true };
      query.is_inactive = { $ne: true };

      console.log(query);

      // Aggregate query to get taul parchis with filters, pagination, and sorting
      let result = await Model.aggregate([
        { $match: query },
        { $sort: sorting },
        { $skip: _skip },
        { $limit: _limit },
        {
          $lookup: {
            from: "farmers",
            localField: "farmer",
            foreignField: "_id",
            as: "farmerDetails",
          },
        },
        // {
        //   $lookup: {
        //     from: "villages",
        //     localField: "village",
        //     foreignField: "_id",
        //     as: "villageDetails",
        //   },
        // },
        // {
        //   $lookup: {
        //     from: "hammals",
        //     localField: "hammal",
        //     foreignField: "_id",
        //     as: "hammalDetails",
        //   },
        // },
        {
          $lookup: {
            from: "crops",
            localField: "crop",
            foreignField: "_id",
            as: "cropDetails",
          },
        },
        { $unwind: "$farmerDetails" },
        // { $unwind: "$villageDetails" },
        // { $unwind: "$hammalDetails" },
        { $unwind: "$cropDetails" },

        // Grouping by crop to calculate sum of rates
        {
          $group: {
            _id: "$cropDetails._id",
            cropName: { $first: "$cropDetails.name" },
            totalRate: { $sum: "$rate" },
          },
        },
        { $sort: sorting },
      ]);
console.log("result",result)
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
      throw new Error(error);
    }
  },
  // getWeightSummary: async (req, res) => {
  //   try {
  //     const { firm_company, page, limit, order_by, order_in, from, to } =
  //       req.query;

  //     const _page = page ? parseInt(page) : 1;
  //     const _limit = limit ? parseInt(limit) : 20;
  //     const _skip = (_page - 1) * _limit;

  //     // Define sorting logic
  //     let sorting = {};
  //     if (order_by) {
  //       sorting[order_by] = order_in === "desc" ? -1 : 1;
  //     } else {
  //       sorting["_id"] = -1; // Default sorting by _id (descending)
  //     }

  //     const query = {};
  //     if (firm_company) {
  //       query.firm_company = new RegExp(firm_company, "i");
  //     }

  //     // Add date range filter based on 'from' and 'to' params
  //     if (from || to) {
  //       query.created_at = {};
  //       if (from) {
  //         query.created_at.$gte = new Date(from);
  //       }
  //       if (to) {
  //         query.created_at.$lte = new Date(to);
  //       }
  //     }

  //     query.disabled = { $ne: true };
  //     query.is_inactive = { $ne: true };

  //     console.log(query);

  //     // Aggregate query to get total weight per crop
  //     let result = await Model.aggregate([
  //       { $match: query },
  //       { $sort: sorting },
  //       { $skip: _skip },
  //       { $limit: _limit },
  //       {
  //         $lookup: {
  //           from: "farmers",
  //           localField: "farmer",
  //           foreignField: "_id",
  //           as: "farmerDetails",
  //         },
  //       },
  //       // {
  //       //   $lookup: {
  //       //     from: "villages",
  //       //     localField: "village",
  //       //     foreignField: "_id",
  //       //     as: "villageDetails",
  //       //   },
  //       // },
  //       {
  //         $lookup: {
  //           from: "hammals",
  //           localField: "hammal",
  //           foreignField: "_id",
  //           as: "hammalDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "crops",
  //           localField: "crop",
  //           foreignField: "_id",
  //           as: "cropDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "createdBy",
  //           foreignField: "_id",
  //           as: "userDetails",
  //         },
  //       },
  //       { $unwind: "$farmerDetails" },
  //       // { $unwind: "$villageDetails" },
  //       { $unwind: "$hammalDetails" },
  //       { $unwind: "$cropDetails" },
  //       {
  //         $unwind: "$userDetails",
  //       },

  //       // Dynamically calculate net weight based on (boraQuantity * unitBora) + bharti
  //       {
  //         $addFields: {
  //           calculatedNetWeight: {
  //             $add: [{ $multiply: ["$boraQuantity", "$unitBora"] }, "$bharti"],
  //           },
  //         },
  //       },

  //       {
  //         $group: {
  //           _id: "$cropDetails._id",
  //           cropName: { $first: "$cropDetails.name" },
  //           totalWeight: { $sum: "$calculatedNetWeight" }, // Summing up the dynamically calculated net weight
  //         },
  //       },
  //       { $sort: sorting },
  //     ]);

  //     // Count total number of results for pagination metadata
  //     const resultCount = await Model.countDocuments(query);

  //     // Respond with data and pagination metadata
  //     res.json({
  //       data: result,
  //       meta: {
  //         current_page: _page,
  //         from: _skip + 1,
  //         last_page: Math.ceil(resultCount / _limit),
  //         per_page: _limit,
  //         to: _skip + result.length,
  //         total: resultCount,
  //       },
  //     });
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },
  getWeightSummary: async (req, res) => {
    try {
      const { firm_company, page, limit, order_by, order_in, from, to } = req.query;
  
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
  
      // Create query object for filtering
      const query = {};
      if (firm_company) {
        query.firm_company = new RegExp(firm_company, "i");
      }
  
      // Date range filtering
      if (from || to) {
        query.created_at = {};
        if (from) query.created_at.$gte = new Date(from);
        if (to) query.created_at.$lte = new Date(to);
      }
  
      // Exclude disabled and inactive entries
      query.disabled = { $ne: true };
      query.is_inactive = { $ne: true };
  
      console.log(query);
  
      // Perform aggregation to calculate total weight per crop
      const result = await Model.aggregate([
        { $match: query },
        { $sort: sorting },
        { $skip: _skip },
        { $limit: _limit },
        {
          $lookup: {
            from: "farmers",
            localField: "farmer",
            foreignField: "_id",
            as: "farmerDetails",
          },
        },
        {
          $lookup: {
            from: "hammals",
            localField: "hammal",
            foreignField: "_id",
            as: "hammalDetails",
          },
        },
        {
          $lookup: {
            from: "crops",
            localField: "crop",
            foreignField: "_id",
            as: "cropDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: { path: "$farmerDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$hammalDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$cropDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
  
        // Calculate net weight: (boraQuantity * unitBora) + bharti
        {
          $addFields: {
            calculatedNetWeight: {
              $add: [{ $multiply: ["$boraQuantity", "$unitBora"] }, "$bharti"],
            },
          },
        },
  
        // Group by crop to sum up the weights
        {
          $group: {
            _id: "$cropDetails._id",
            cropName: { $first: "$cropDetails.name" },
            totalWeight: { $sum: "$calculatedNetWeight" },
          },
        },
        { $sort: sorting }, // Sort results based on sorting criteria
      ]);
  
      // Get total count for pagination
      const resultCount = await Model.countDocuments(query);
  
      // Send response with result and pagination metadata
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
      console.error("Error in getWeightSummary:", error);
      res.status(500).json({ error: error.message });
    }
  },
  
getByUser: async function (req, res, next) {
  const { id } = req.params;
  const {  page, limit, order_by, order_in } = req.query;

  const _page = page ? parseInt(page) : 1;
  const _limit = limit ? parseInt(limit) : 20;
  const _skip = (_page - 1) * _limit;

  console.log("Request Parameters:", req.params, req.query); // Log request parameters

  try {
      // Define sorting logic
      let sorting = {};
      if (order_by) {
          sorting[order_by] = order_in === "desc" ? -1 : 1;
      } else {
          sorting["_id"] = -1; // Default sorting by _id (descending)
      }

      // Build the query
      const query = { createdBy: mongoose.Types.ObjectId(id),
        disabled: false
       };
      // if (firm_company) {
      //     query.firm_company = new RegExp(firm_company, "i"); // Filter by firm_company (case-insensitive)
      // }
      // if (crop) {
      //     query.crop = mongoose.Types.ObjectId(crop); // Filter by crop
      // }
      query.disabled = { $ne: true }; 
      query.is_inactive = { $ne: true }; 

      console.log("Final Query Object:", query); // Log the final query

      let result = await Model.aggregate([
          { $match: query },
          { $sort: sorting },
          { $skip: _skip },
          { $limit: _limit },
          {
              $lookup: {
                  from: "crops",
                  localField: "crop",
                  foreignField: "_id",
                  as: "cropDetails",
              },
          },
          {
              $lookup: {
                  from: "users",
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "userDetails",
              },
          },
          {
            $lookup: {
              from: "farmers",
              localField: "farmer",
              foreignField: "_id",
              as: "farmerDetails",
            },
          },
          {
            $lookup: {
              from: "villages",
              localField: "village",
              foreignField: "_id",
              as: "villageDetails",
            },
          },
          {
            $lookup: {
              from: "hammals",
              localField: "hammal",
              foreignField: "_id",
              as: "hammalDetails",
            },
          },
          {
            $unwind: "$cropDetails",
          },
          { $unwind: "$userDetails" },
          // { $unwind: "$hammalDetails" },
          { $unwind: { path: "$hammalDetails", preserveNullAndEmptyArrays: true } },
          { $unwind: "$farmerDetails" },
      ]);

      console.log("Result:", result);

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
      next(error); // Handle errors
  }
},

  
};
