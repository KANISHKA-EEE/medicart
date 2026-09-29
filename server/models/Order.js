const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  dosageForm: {
    type: String,
    default: ''
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true }
});

const pricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const prescriptionFileSchema = new mongoose.Schema({
  originalName: { type: String, default: '' },
  filename: { type: String, default: '' },
  path: { type: String, default: '' },
  mimetype: { type: String, default: '' },
  size: { type: Number, default: 0 },
  uploadedAt: { type: Date }
});

const prescriptionOcrItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  strength: { type: String, default: '' },
  dosage: { type: String, default: '' },
  quantity: { type: String, default: '' }
});

const prescriptionOcrSchema = new mongoose.Schema({
  hospitalName: { type: String, default: 'Not detected' },
  doctorName: { type: String, default: 'Not detected' },
  doctorRegistrationNumber: { type: String, default: 'Not detected' },
  patientName: { type: String, default: 'Not detected' },
  prescriptionDate: { type: String, default: 'Not detected' },
  medicines: [prescriptionOcrItemSchema],
  rawText: { type: String, default: '' },
  confidence: { type: String, default: 'Not available' },
  extractedAt: { type: Date }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    pricing: {
      type: pricingSchema,
      required: true
    },
    status: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed'
    },
    paymentStatus: {
      type: String,
      default: 'Pending'
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    prescriptionFile: {
      type: prescriptionFileSchema,
      default: null
    },
    prescriptionOcr: {
      type: prescriptionOcrSchema,
      default: null
    },
    prescriptionStatus: {
      type: String,
      enum: ['Not Required', 'Uploaded', 'Pending Review', 'Approved', 'Rejected'],
      default: 'Not Required'
    },
    prescriptionUploadedAt: {
      type: Date
    },
    prescriptionReviewedAt: {
      type: Date
    },
    prescriptionReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prescriptionRejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
