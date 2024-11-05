const Model = require("../models/permission.model");
const createError = require("http-errors");
const mongoose = require("mongoose");

const {
  uploadImage,
} = require("../Helpers/helper_functions");


module.exports = {

create:async (req, res) => {
    try {
      const { name, description } = req.body;
      const newPermission = new Model({ name, description });
      await newPermission.save();
      res.status(201).json(newPermission);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  list: async (req, res) => {
    try {
      const permissions = await Model.find();  // Fetch all permissions
      res.status(200).json(permissions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params; // Get the ID from the request parameters
      const { name, description } = req.body; // Get the updated data from the request body
  
      const updatedPermission = await Model.findByIdAndUpdate(
        id,
        { name, description },
        { new: true } // Return the updated document
      );
  
      if (!updatedPermission) {
        return res.status(404).json({ message: "Permission not found" });
      }
  
      res.status(200).json(updatedPermission); // Return the updated permission
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params; // Get the ID from the request parameters
  
      // Find the permission by ID and delete it
      const deletedPermission = await Model.findByIdAndDelete(id);
  
      if (!deletedPermission) {
        return res.status(404).json({ message: "Permission not found" });
      }
  
      res.status(200).json({ message: "Permission deleted successfully" }); // Confirmation message
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params; // Get the ID from the request parameters
  
      // Find the permission by ID
      const permission = await Model.findById(id);
  
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
  
      res.status(200).json(permission); // Return the found permission
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
  
  
}

