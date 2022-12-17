import express from "express";
import AuthController from "../controllers/AuthController";
const { protect } = require("../middleware/AuthMiddleware");
const asyncHandler = require('express-async-handler')

const router = express.Router();

router.post('/register', AuthController.register);


router.post('/login', AuthController.login);

router.get('/confirmation/:token', AuthController.confirmEmail);

router.post('/change-password', protect, AuthController.changePassword);

module.exports = router;