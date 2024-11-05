const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Title or name of the party is required
    },
    created_at: {
        type: Date,
        default: Date.now, // Automatically set tahe creation date
    },
    created_by: {
        type: mongoose.Types.ObjectId, // Reference to the user who created the party
    },
    updated_at: {
        type: Date,
    },
    deleted_at: {
        type: Date,
    },
    disabled: {
        type: Boolean,
        default: false, // Flag for disabling or soft-deleting the party
    },
    is_inactive: {
        type: Boolean,
        default: false,
      },
});

PartySchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

const Party = mongoose.model("Party", PartySchema);

module.exports = Party;
