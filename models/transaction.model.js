const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  // farmer: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'farmers',
  // },
  // village: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'villages',
  // },
  transactionDetails: [{
    farmerName: String,
    firmName: String,
    rate: Number,
    netWeight: Number,
  }],
  firm_company: {
    type: String,
  },
  rate: {
    type: Number,
  },
  // hammal: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'hammals',
  // },
  boraQuantity: {
    type: Number,
  },
  unitBora: {
    type: Number,
  },
  bharti: {
    type: Number,
  },
  netWeight: {
    type: Number,
  },
  // crop: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'crop',
  
  // },
  transactionStatus:{
    type: String,
    enum: ['active', 'inactive'],
  },
  transactionType: {
    type: String,
    enum: ['taulParchi', 'truckLoading'],  
    
  },
  transactionMode: {
    type: String,
    enum: ['cash', 'cheque', 'online', 'bank transfer', 'UPI'], 
    required: true,
  },
  discount: {
    type: Number, 
  },
  paidAmount: {
    type: Number, 
  },
  remainingAmount: {
    type: Number, 
  },
  totalAmount: {
    type: Number, 
  },
  PaymentStatus:{
    type:String,
    enum: ['incoming', 'outgoing'],  
    default: 'incoming',
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

// Middleware to calculate remaining amount before saving
TransactionSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  
  // Calculate remainingAmount: totalAmount - paidAmount - discount
  if (this.totalAmount && this.paidAmount !== undefined) {
    this.remainingAmount = this.totalAmount - this.paidAmount - this.discount;
  }

  next();
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
