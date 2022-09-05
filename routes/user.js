const express = require("express");

const router = express.Router();
const controller = require("../controllers/userController");
require("dotenv").config();

const jwt = require("jsonwebtoken");
var db = require("../config/connection");
var collections = require("../config/collections");
let phoneNo = 0;
const paypal = require('../paypal')





router.post("/api/orders", async (req, res) => {
  const order = await paypal.createOrder();
  res.json(order);
});

router.post("/api/orders/:orderId/capture", async (req, res) => {
  const {
    orderId
  } = req.params;
  const captureData = await paypal.capturePayment(orderId);
  res.json(captureData);
});


//auth middleware
async function verify(req, res, next) {


  if (req.session.user == undefined) {

  
    res.redirect('/Login')
  } 
  else 
  {
    const accessToken = req.cookies.accessToken;


    jwt.verify(
      accessToken,
      process.env.JWT_AUTH_TOKEN,
      async (err, phone) => {
        if (phone) {
          req.phone = phone;
          phoneNo = phone;
          next();
        } else if (err.message === "TokenExpiredError") {
        
          return res.status(403).redirect("/Login");
        } else {

          res.status(403).redirect("/Login");

        }
      }
    );
    let user = db
      .get()
      .collection(collections.USER_COLLECTION)
      .findOne({
        phone: phoneNo
      });
    if (user.blocked) {
      res.status(403).redirect("/Login");
    }

  }

}
function loginCheck(req,res) {
  if (req.session.user == undefined) {
   
     res.redirect('/Login')
    } 
}
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

router.post("/add-to-cart", verify, controller.addToCart);

router.post("/cart-change-quantity", controller.changeCartQuantity);

router.post("/delete-product", controller.deleteProduct);

router.get("/place-order", controller.viewPlaceOrder);

router.post("/place-order", controller.placeOrder);

router.get("/orderPlaced", controller.orderSuccess);

router.get("/orders", controller.viewOrders);

router.get("/orderProducts", verify, controller.viewOrderProducts);

router.post("/verify-payment", controller.verifyPayment);

router.post("/wish-list", controller.wishList);

router.get("/wish-list", controller.viewwishList);

router.get("/remove-wish", controller.removeWishList);

router.get("/search", controller.search);

router.get("/sendOTP", controller.viewSendOTP);

router.post("/sendOTP", controller.sendOTP);

router.post("/verifyOTP", controller.verifyOTP);

router.get('/product-details', controller.productsDetails)

router.get('/profile', verify, controller.profile)

router.post('/update-profile', controller.updateProfile)

router.post('/add-address', controller.addAddress)

router.post('/add-address2', controller.addAddress2)

router.post('/change-password', controller.changePassword)

module.exports = router;