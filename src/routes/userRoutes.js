const express = require("express")
const router = express.Router();
const userController = require("../controllers/user.controller")

router.get("/create-profile", userController.createProfileView)
router.post('/profile/store', userController.createProfile)
router.get("/my-profile", userController.myProfile)
router.get("/my-profile/edit", userController.editProfile)
router.post("/my-profile/update", userController.updateProfile)
router.get("/chat-room", userController.chatRoom)
router.get("/private/chat/:id", userController.privateChat)

module.exports = router;