const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAllTanks, getTankCurrent, getTankHistory } = require('../controllers/tankController');

router.get('/',              auth, getAllTanks);
router.get('/:id/current',  auth, getTankCurrent);
router.get('/:id/history',  auth, getTankHistory);

module.exports = router;
