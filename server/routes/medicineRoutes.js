const express = require('express');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message
    });
  }
});

// @route   GET /api/medicines/:id
// @desc    Get single medicine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine',
      error: error.message
    });
  }
});

// @route   POST /api/medicines
// @desc    Create a new medicine
// @access  Private (Admin Only)
router.post('/', protect, adminMiddleware, async (req, res) => {
  try {
    const { name, category, price, mrp } = req.body;

    if (!name || !category || price === undefined || mrp === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: name, category, price, mrp'
      });
    }

    const medicine = await Medicine.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: medicine
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create medicine',
      error: error.message
    });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update a medicine
// @access  Private (Admin Only)
router.put('/:id', protect, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update medicine',
      error: error.message
    });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
// @access  Private (Admin Only)
router.delete('/:id', protect, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }

    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete medicine',
      error: error.message
    });
  }
});

module.exports = router;
