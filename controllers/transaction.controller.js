const Model = require("../models/transaction.model");
const createError = require("http-errors");
const mongoose = require("mongoose");


    
module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      console.log("Transaction Data:", data);

      // Validate required fields
      // if (!data.farmer) {
      //   return res.status(400).json({ error: "Farmer is required." });
      // }
      // if (!data.village) {
      //   return res.status(400).json({ error: "Village is required." });
      // }
      // if (!data.firm_company) {
      //   return res.status(400).json({ error: "Firm/Company is required." });
      // }
      // if (!data.boraQuantity) {
      //   return res.status(400).json({ error: "Bora Quantity is required." });
      // }
      // if (!data.unitBora) {
      //   return res.status(400).json({ error: "Unit Bora is required." });
      // }
      // if (!data.crop) {
      //   return res.status(400).json({ error: "Crop is required." });
      // }
      if (!data.transactionMode) {
        return res.status(400).json({ error: "Transaction Mode is required." });
      }
      if (!data.totalAmount) {
        return res.status(400).json({ error: "Total Amount is required." });
      }
      if (!data.paidAmount) {
        return res.status(400).json({ error: "Paid Amount is required." });
      }

      data.netWeight = data.boraQuantity * data.unitBora;

      data.discount = data.discount || 0;
      data.remainingAmount = data.totalAmount - data.paidAmount - data.discount;

     
      const newTransaction = new Model(data);

      const result = await newTransaction.save();

      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving Transaction:", error);
      next(createError(500, "Failed to save Transaction.")); // Handle errors and send a 500 response
    }
  },
  // list: async (req, res, next) => {

  //   try {
  //     const {
  //       firm_company,
  //       page, 
  //       limit, 
  //       order_by, 
  //       order_in 
  //     } = req.query;
  
  //     const _page = page ? parseInt(page) : 1;
  //     const _limit = limit ? parseInt(limit) : 20;
  //     const _skip = (_page - 1) * _limit;
  
  //     let sorting = {};
  //     if (order_by) {
  //       sorting[order_by] = order_in === "desc" ? -1 : 1;
  //     } else {
  //       sorting["_id"] = -1; // Default sorting by _id (descending)
  //     }
  
  //     const query = {};
  // console.log("bbs",query)
     
   
  //     query.disabled = { $ne: true };
  //     query.is_inactive = { $ne: true };
  
  //     console.log(query);
  
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
  //         $unwind: "$farmerDetails",
  //       },
  //       {
  //         $unwind: "$villageDetails",
  //       },
  //       {
  //         $unwind: "$hammalDetails",
  //       },
  //       {
  //         $unwind: "$cropDetails",
  //       },
  //     ]);
  
  //     // Count total number of results for pagination metadata
  //     const resultCount = await Model.countDocuments(query);
  // console.log("bbsjbjbj",resultCount)
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
  //     console.log("ysbb",result)
  //   } catch (error) {
  //     console.error("Error fetching transaction list:", error);
  //     next(error); // Handle errors
  //   }
  // },

   list : async (req, res, next) => {
    try {
      const filter = req.query 
      const transactions = await Model.find(filter).exec(); // Simply retrieves the transactions without populating related data
  
      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ message: "No transactions found." });
      }
  console.log("vgvhac",filter)
      res.status(200).json(transactions); // Send back the raw transaction data
    } catch (error) {
      console.error("Error retrieving transactions:", error);
      next(createError(500, "Failed to retrieve transactions."));
    }
  },
  update: async (req, res, next) => {
    try {
      const transactionId = req.params.id;
      const data = req.body;
      console.log("Updating Transaction Data:", data);
  
      // Validate required fields (if necessary, otherwise rely on Mongoose validation)
      if (!data.farmer) {
        return res.status(400).json({ error: "Farmer is required." });
      }
      if (!data.village) {
        return res.status(400).json({ error: "Village is required." });
      }
      if (!data.firm_company) {
        return res.status(400).json({ error: "Firm/Company is required." });
      }
      if (!data.boraQuantity) {
        return res.status(400).json({ error: "Bora Quantity is required." });
      }
      if (!data.unitBora) {
        return res.status(400).json({ error: "Unit Bora is required." });
      }
      if (!data.crop) {
        return res.status(400).json({ error: "Crop is required." });
      }
      if (!data.transactionMode) {
        return res.status(400).json({ error: "Transaction Mode is required." });
      }
      if (!data.totalAmount) {
        return res.status(400).json({ error: "Total Amount is required." });
      }
      if (!data.paidAmount) {
        return res.status(400).json({ error: "Paid Amount is required." });
      }
  
      // Calculate netWeight using the formula: netWeight = boraQuantity * unitBora
      data.netWeight = data.boraQuantity * data.unitBora;
  
      // Calculate remainingAmount: totalAmount - paidAmount - discount (default discount to 0 if not provided)
      data.discount = data.discount || 0;
      data.remainingAmount = data.totalAmount - data.paidAmount - data.discount;
  
      // Find the existing transaction by ID and update with the new data
      const updatedTransaction = await Model.findByIdAndUpdate(
        transactionId,
        { $set: data },
        { new: true, runValidators: true }
      );
  
      if (!updatedTransaction) {
        return res.status(404).json({ error: "Transaction not found." });
      }
  
      // Respond with the updated transaction
      res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error("Error updating Transaction:", error);
      next(createError(500, "Failed to update Transaction.")); // Handle errors and send a 500 response
    }
  },
   delete : async (req, res, next) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        throw createError.BadRequest("Invalid Parameters: Missing ID");
      }
  
      const deleted_at = Date.now();
  
      // Performing a soft delete by marking the Transaction as inactive and setting the deleted_at timestamp
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { disabled: true, deleted_at } }
      );
  
      if (result.nModified === 0) {
        throw createError.NotFound("Transaction not found or already deleted");
      }
  
      res.json({ message: "Transaction deleted successfully", result });
    } catch (error) {
      next(error);
    }
  },
   get : async (req, res, next) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        throw createError.BadRequest("Invalid Parameters: Missing ID");
      }
  
      // Finding the Transaction document by its ID
      const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
  
      if (!result) {
        throw createError.NotFound("No Transaction Found");
      }
  
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
}
