const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection middleware to all order routes
router.use(protect);

// @route   POST /api/orders
// @desc    Create a new real order
// @access  Private (Authenticated User)
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    // 1. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // 2. Validate shipping address fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address details'
      });
    }

    const { fullName, phone, email, addressLine1, city, state, pincode } = shippingAddress;
    if (!fullName || !phone || !email || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required shipping address fields'
      });
    }

    // 3. Process items and verify pricing / stock from MongoDB
    const orderItems = [];

    for (const item of items) {
      if (!item.medicine || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item parameters provided'
        });
      }

      // Check Mongoose ObjectId format
      if (!mongoose.Types.ObjectId.isValid(item.medicine)) {
        return res.status(400).json({
          success: false,
          message: `Invalid medicine ID format: ${item.medicine}`
        });
      }

      // Fetch authoritative medicine document from MongoDB
      const medicineDoc = await Medicine.findById(item.medicine);

      if (!medicineDoc) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found with ID: ${item.medicine}`
        });
      }

      // Stock Validation
      if (item.quantity > medicineDoc.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicineDoc.name}. Available: ${medicineDoc.stock}, Requested: ${item.quantity}`
        });
      }

      // Calculate server-side item total using database price
      const itemTotal = medicineDoc.price * item.quantity;

      orderItems.push({
        medicine: medicineDoc._id,
        name: medicineDoc.name,
        quantity: item.quantity,
        price: medicineDoc.price,
        itemTotal,
        image: medicineDoc.image || '',
        dosageForm: medicineDoc.dosageForm || medicineDoc.packSize || ''
      });
    }

    // 4. Calculate subtotal & grand total on server
    const subtotal = orderItems.reduce((sum, i) => sum + i.itemTotal, 0);
    const deliveryCharge = 0; // FREE Delivery
    const total = subtotal + deliveryCharge;

    // 5. Create order document in MongoDB
    const newOrder = await Order.create({
      user: req.user.userId,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        addressLine1: addressLine1.trim(),
        addressLine2: (shippingAddress.addressLine2 || '').trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      pricing: {
        subtotal,
        deliveryCharge,
        total
      },
      status: 'Placed',
      paymentStatus: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: newOrder
      }
    });

  } catch (error) {
    console.error('Create Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    });
  }
});

// @route   GET /api/orders
// @desc    Get logged-in user's order history
// @access  Private (Authenticated User)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order history'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details by ID
// @access  Private (Authenticated User - Owner Only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ownership Authorization Check
    if (order.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get Order Details Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order details'
    });
  }
});

module.exports = router;
