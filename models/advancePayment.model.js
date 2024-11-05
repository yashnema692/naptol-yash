const mongoose = require("mongoose");

const AdvanceSchema = new mongoose.Schema({
  Type: {
    type: String,
  },
  receiver: {
    type: String,
  },
  details:{
    type: mongoose.Types.ObjectId
  },
  amount: {
    type: Number,
  },
  remark: {
    type: String,
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

AdvanceSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  next();
});

const Advance = mongoose.model("Advance", AdvanceSchema);

module.exports = Advance;
