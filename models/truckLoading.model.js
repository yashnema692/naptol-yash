const { ref } = require("@hapi/joi/lib/compile");
const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");

const TruckLoadingSchema = new mongoose.Schema({
    partyName: {
        type: mongoose.Types.ObjectId,
        ref: 'Party',
        },
    vehicleNumber: {
        type: String,
    },
    deliveryLocation:{
        type: mongoose.Types.ObjectId,
        ref: 'Delivery',
},
    assignedHammal: {
        type: mongoose.Types.ObjectId,
        ref: 'Hammal',
       
    },
    boraQuantity: {
        type: Number,   
    },
    unitBora: {
        type: Number,   
    },
    netWeight:{
        type: Number,
    },
    rate:{
type:Number
    },
    crop: {
        type: mongoose.Types.ObjectId,
        ref: 'Crop',

    },
    other: {
        type: String,
        default: '', 
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user', 
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

TruckLoadingSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

const TruckLoading = mongoose.model("TruckLoading", TruckLoadingSchema);

module.exports = TruckLoading;
