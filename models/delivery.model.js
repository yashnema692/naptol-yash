const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Title or name of the delivery is required
    },
    created_at: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
    created_by: {
        type: mongoose.Types.ObjectId, // Reference to the user who created the delivery
    },
    updated_at: {
        type: Date,
    },
    deleted_at: {
        type: Date,
    },
    disabled: {
        type: Boolean,
        default: false, // Flag for disabling or soft-deleting the delivery
    },
    is_inactive: {
        type: Boolean,
        default: false,
      },
});

// Middleware to auto-update `updated_at` field when a document is modified
DeliverySchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

const Delivery = mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;
