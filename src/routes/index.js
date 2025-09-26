const express = require("express")
const router = express.Router()

router.use('/', require('./authRoutes'));
router.use('/user/', require('./userRoutes'));

module.exports = router