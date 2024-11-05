const mongoose = require("mongoose");

const TruckSchema = new mongoose.Schema({
  truckNumber: {
    type: String,
  },
  truckType:{
    type: String,
    enum: ["regular", "premium"],
  },
  driverName: {
    type: String,
  },
  driverMobile: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Types.ObjectId,
  },
  updated_at: {
    type: Date,
  },
  deleted_at: {
    type: Date,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  is_inactive: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to update 'updated_at' field if the document is modified
TruckSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  next();
});

const Truck = mongoose.model("Truck", TruckSchema);

module.exports = Truck;
