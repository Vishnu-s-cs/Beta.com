var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helper");
const controller = require("../controllers/adminController");
var db=require('../config/connection')
const userHelper = require("../helpers/user-helper");
const { verify } = require("crypto");
//auth middleware
function verifyAdmin(req, res, next) {
  try {
    

  if (!req.session.admin) {
    res.status(403).redirect("/admin/login");
  } else {
    next();
  }
} catch (error) {
    console.log("verification failed/page not found");
    res.redirect('/error')
}
}
/* GET users listing. */

router.get("/products", verifyAdmin, controller.products);

router.get("/manage-categories", verifyAdmin, controller.viewManageCategory);

router.get("/add-products",verifyAdmin,controller.viewAddProduct); 

router.post("/add-products", verifyAdmin,controller.addProduct)

router.get("/delete-product", verifyAdmin,controller.deleteProduct);

router.get("/block-user", verifyAdmin, controller.blockUser);

router.get("/unblock-user", verifyAdmin, controller.unblock);


router.post("/Login",controller.login);

router.get("/login", controller.viewLogin);

router.get("/logout", controller.logout );

router.get("/edit-product", verifyAdmin, controller.viewEditProduct);

router.get("/edit-category", verifyAdmin, controller.viewEditCategory);

router.post("/editCategory", verifyAdmin, controller.editCategory);

router.get("/delete-category",  verifyAdmin,controller.deleteCategory);

router.post("/edit-products",  verifyAdmin,controller.editProduct);

//  add-category
router.post("/add-category", verifyAdmin, controller.addCategory);

router.get("/all-users",  verifyAdmin,controller.getAllUsers);

router.get("/all-orders",  verifyAdmin,controller.getAllOrders);

router.get("/ordered-products", verifyAdmin, controller.getOrderedProducts);

router.get("/user-details",  verifyAdmin,controller.getUserDetails);

router.post("/set-status", verifyAdmin, controller.setStatus);

router.get("/", verifyAdmin, controller.dashboard);

router.get("/remove-order",  verifyAdmin,controller.removeOrder);

router.get('/sales-report', verifyAdmin,controller.viewSalesReport)

router.get('/get-order-details', verifyAdmin,controller.orderDetails)

router.get("/stats", verifyAdmin, controller.stats);

router.get("/stats2", verifyAdmin, controller.stats2);

router.get("/stats3", verifyAdmin,controller.stats3);

router.get("/stats4", verifyAdmin, controller.stats4);
//
router.get('/getMostStats', verifyAdmin,controller.getMostStats)

 router.post('/add-offer', verifyAdmin,controller.addOffer)

router.get('/coupons',verifyAdmin,controller.viewCoupons)

router.post('/coupons',verifyAdmin,controller.addCoupon)

router.get('/delete-coupon',verifyAdmin,controller.deleteCoupon)

router.get('/add-offer',verifyAdmin,controller.addCatOffer)

module.exports = router;
