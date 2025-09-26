const express = require("express")
const router = express.Router();
const userController = require("../controllers/user.controller")
const UserProfile = require("../models/UserProfile")

router.get("/create-profile", userController.createProfileView)
router.post('/profile/store', userController.createProfile)
router.get("/my-profile", userController.myProfile)

module.exports = router;