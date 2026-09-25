const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply auth + admin protection to all routes in this router
router.use(protect);
router.use(adminMiddleware);

// Allowed order status values
const ALLOWED_STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics + recent orders for admin
// @access  Private (Admin Only)
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({}, 'status pricing.total');

    const ordersByStatus = {
      Placed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    let totalRevenue = 0;

    orders.forEach((order) => {
      const statusKey = order.status || 'Placed';
      if (ordersByStatus[statusKey] !== undefined) {
        ordersByStatus[statusKey] += 1;
      } else {
        ordersByStatus[statusKey] = 1;
      }

      if (statusKey !== 'Cancelled') {
        totalRevenue += order.pricing?.total || 0;
      }
    });

    // Fetch latest 5 recent orders populated with customer name and email
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMedicines,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Admin Dashboard API Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin dashboard statistics'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private (Admin Only)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Admin Get Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders list'
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get single order details for admin
// @access  Private (Admin Only)
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Admin Get Order Details Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order details'
    });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status by admin
// @access  Private (Admin Only)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(id).populate('user', 'name email');

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Admin Update Order Status Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

module.exports = router;
