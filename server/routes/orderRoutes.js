const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads/prescriptions directory exists
const uploadDir = path.join(__dirname, '../uploads/prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prescription-${uniqueSuffix}${ext}`);
  }
});

// Multer File Filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

// Apply auth protection middleware to all order routes
router.use(protect);

// @route   POST /api/orders/upload-prescription
// @desc    Upload a prescription file (JPG, PNG, PDF <= 5MB)
// @access  Private (Authenticated User)
router.post('/upload-prescription', (req, res) => {
  upload.single('prescription')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit. Please upload a smaller file.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error.'
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid upload request.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No prescription file provided.'
      });
    }

    const { processPrescriptionOcr } = require('../utils/ocrExtractor');

    processPrescriptionOcr(req.file.path, req.file.mimetype)
      .then((ocrData) => {
        const validation = ocrData?.validation;

        // SERVER-SIDE STRICT PRESCRIPTION VALIDATION ENFORCEMENT
        if (!validation || !validation.isValidPrescription) {
          // Delete rejected non-prescription file from disk
          try {
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
          } catch (unlinkErr) {
            console.warn('Failed to clean up rejected file:', unlinkErr.message);
          }

          return res.status(400).json({
            success: false,
            message: validation?.userMessage || '❌ This file does not appear to be a medical prescription. Please upload a valid prescription issued by a qualified doctor.',
            validation
          });
        }

        // VALID PRESCRIPTION -> Status: Pending Review
        return res.status(200).json({
          success: true,
          message: validation.userMessage || '✓ Prescription document detected. Your prescription will be reviewed by our pharmacist/admin before the order is processed.',
          data: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date(),
            ocr: ocrData,
            validation,
            prescriptionStatus: 'Pending Review'
          }
        });
      })
      .catch((ocrErr) => {
        console.error('Prescription Processing Error:', ocrErr);

        // Clean up file on error
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (e) {}

        return res.status(400).json({
          success: false,
          message: '❌ Technical error processing prescription document. Please ensure the file is a clear medical prescription.'
        });
      });
  });
});

// @route   GET /api/orders/prescription-file/:filename
// @desc    Securely view/download prescription file (Owner or Admin only)
// @access  Private (Authenticated Owner or Admin)
router.get('/prescription-file/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);

    // Find order associated with this prescription filename
    const order = await Order.findOne({ 'prescriptionFile.filename': safeFilename });

    // Authorization Check: Customer owner OR Admin
    if (order) {
      const isOwner = order.user.toString() === req.user.userId.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Security Alert: Access denied to private medical prescription.'
        });
      }
    } else {
      // If order not yet finalized (e.g., during active upload), require authenticated user
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view prescription.'
        });
      }
    }

    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Prescription file not found on disk.'
      });
    }

    return res.sendFile(filePath);

  } catch (error) {
    console.error('Prescription File View Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving prescription document.'
    });
  }
});

// @route   POST /api/orders
// @desc    Create a new real order
// @access  Private (Authenticated User)
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, prescriptionFile } = req.body;

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

    // 3. Process items and verify pricing / stock / prescription requirements from MongoDB
    const orderItems = [];
    let hasPrescriptionRequiredItem = false;

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

      const rxRequired = !!medicineDoc.prescriptionRequired;
      if (rxRequired) {
        hasPrescriptionRequiredItem = true;
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
        dosageForm: medicineDoc.dosageForm || medicineDoc.packSize || '',
        prescriptionRequired: rxRequired
      });
    }

    // Check prescription requirement
    if (hasPrescriptionRequiredItem) {
      if (!prescriptionFile || !prescriptionFile.filename) {
        return res.status(400).json({
          success: false,
          message: 'One or more items in your cart require a prescription. Please upload a valid prescription before placing order.'
        });
      }
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
      paymentStatus: 'Pending',
      prescriptionRequired: hasPrescriptionRequiredItem,
      prescriptionFile: hasPrescriptionRequiredItem ? {
        originalName: prescriptionFile.originalName || prescriptionFile.originalname || '',
        filename: prescriptionFile.filename,
        path: prescriptionFile.path || '',
        mimetype: prescriptionFile.mimetype || '',
        size: prescriptionFile.size || 0,
        uploadedAt: prescriptionFile.uploadedAt || new Date()
      } : null,
      prescriptionOcr: hasPrescriptionRequiredItem ? (prescriptionFile.ocr || (req.body.prescriptionOcr) || {
        hospitalName: 'Not detected',
        doctorName: 'Not detected',
        doctorRegistrationNumber: 'Not detected',
        patientName: 'Not detected',
        prescriptionDate: 'Not detected',
        medicines: [],
        rawText: 'Unable to extract text automatically',
        confidence: 'Not available',
        extractedAt: new Date()
      }) : null,
      prescriptionStatus: hasPrescriptionRequiredItem ? 'Pending Review' : 'Not Required',
      prescriptionUploadedAt: hasPrescriptionRequiredItem ? (prescriptionFile.uploadedAt || new Date()) : null
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
