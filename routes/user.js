const express = require("express");
let verify = require("../verify");
const router = express.Router();
const controller = require("../controllers/userController");
require("dotenv").config();
verify = verify.verify;

/* GET home page. */
router.get("/", controller.home);

// login page
router.get("/Login", controller.viewLogin);

// signUp page
router.get("/signup", controller.viewSignUp);

router.post("/Signup", controller.SignUp);

router.post("/Login", controller.login);

router.get("/Logout", controller.logout);

router.get("/cart", verify, controller.viewCart);

router.get("/add-to-cart", verify, controller.addToCart);

router.post("/cart-change-quantity", verify, controller.changeCartQuantity);

router.post("/delete-product", verify, controller.deleteProduct);

router.get("/place-order", verify, controller.viewPlaceOrder);

router.post("/place-order", verify, controller.placeOrder);

router.get("/orderPlaced", verify, controller.orderSuccess);

router.get("/orders", verify, controller.viewOrders);

router.get("/orderProducts", controller.viewOrderProducts);

router.post("/verify-payment", controller.verifyPayment);

router.post("/wish-list", controller.wishList);

router.get("/wish-list", controller.viewwishList);

router.get("/remove-wish", controller.removeWishList);

router.get("/search", controller.search);

router.get("/sendOTP", controller.viewSendOTP);

router.post("/sendOTP", controller.sendOTP);

router.post("/verifyOTP", controller.verifyOTP);

module.exports = router;
