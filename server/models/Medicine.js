const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    manufacturer: {
      type: String,
      default: '',
      trim: true
    },
    dosageForm: {
      type: String,
      default: '',
      trim: true
    },
    packSize: {
      type: String,
      default: '',
      trim: true
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
