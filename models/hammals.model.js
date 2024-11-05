const mongoose = require("mongoose");

const HammalSchema = new mongoose.Schema({
    name: {  // Replacing 'title' with 'hammalName'
        type: String,
        required: true,  // Assuming this field is required, modify if needed
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

// Middleware to update 'updated_at' before saving if the document is modified
HammalSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

const Hammal = mongoose.model("Hammal", HammalSchema);

module.exports = Hammal;
