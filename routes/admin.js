var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helper");
let userHelpers = require("../helpers/user-helper")
const controller = require("../controllers/adminController");
const { response } = require("express");
var db=require('../config/connection')
var collections=require('../config/collections');
const userHelper = require("../helpers/user-helper");
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
router.get("/add-products", (req, res) => {
  try {
    
    let categories = "";
    adminHelpers.getCategories().then((response) => {
      categories = response;
      res.render("admin/add-products", {
        admin: req.session.admin,
        Admin: req.session.admin,
        categories,
      });
    });
  } catch (error) {
    res.redirect('/error')
  }
});
router.post("/add-products", verifyAdmin,controller.addproduct)

router.get("/delete-product", verifyAdmin, (req, res) => {
  try {
    

  let proid = req.query.id;
  productHelpers.deleteProduct(proid).then((response) => {
    res.redirect("/admin/products");
  });  
} catch (error) {
    res.redirect('/error')
  }
});

router.get("/block-user", verifyAdmin, controller.blockUser);
router.get("/unblock-user", verifyAdmin, controller.unblock);


router.post("/Login", (req, res) => {
  try {
 
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status != "falseUser") {
      productHelpers.getAllProducts().then((products) => {
        req.session.adminLoggedIn = true;
        console.log(response);
        req.session.admin = response.admin;
        res.redirect("/admin");
      });
    } else {
      req.session.adminLoginErr = "invalid user name or password";
      res.redirect("/admin/login");
    }
  }).catch((er)=>{res.redirect('/error')})
     
} catch (error) {
  res.redirect('/error')
}
});

router.get("/login", controller.viewLogin);

router.get("/logout", (req, res) => {
  try {
    req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
  } catch (error) {
    res.redirect('/error')
  }
  
});
router.get("/edit-product", verifyAdmin, async (req, res) => {
  try {
    
    let proId = req.query.id;
    let categories = "";
    adminHelpers.getCategories().then(async (response) => {
      categories = response;
    
      let product = await productHelpers.productsDetails(proId);
      res.render("admin/edit-products", {
        admin: true,
        product,
        Admin: req.session.admin,
        categories,
      });
    });
  } catch (error) {
    res.redirect('/error')
  }
});
router.get("/edit-category", verifyAdmin, controller.viewEditCategory);

router.post("/editCategory", verifyAdmin, controller.editCategory);
router.get("/delete-category",  verifyAdmin,controller.deleteCategory);
router.post("/edit-products",  verifyAdmin,async(req, res) => {
  try {
    
    let proId = req.query.id;
    productHelpers.updateProducts(proId, req.body).then(async() => {
      try {
        let image = req.files.image;
        let banner = req.files.image4;
        let subImages = []
        if(req.files?.image2){subImages.push(req.files?.image2)}
        if(req.files?.image3){subImages.push(req.files?.image3)}
     
        for (let index = 0; index < subImages.length; index++) {
         await subImages[index].mv("./public/product-images/" + proId + index +".jpg", (err, data) => {
            if (!err) {
            console.log("sub images added",index);
           
            } else {
              console.log(err);
            }
          })
          
        }
        if (image) {
          await image.mv("./public/product-images/" + proId + ".jpg", (err, data) => {
            if (!err) {
              res.redirect("/admin/products");
              
            } else {
              console.log(err);
            }
          });
        }
        if (banner) {
          await banner.mv("./public/banners/" + proId + ".jpg", (err, data) => {
            if (!err) {
              res.redirect("/admin/products");
              
            } else {
              console.log(err);
            }
          });
        }
        
      } catch (error) {
        console.log(error);
        res.redirect('/admin/products')
      }
    });
  } catch (error) {
    res.redirect('/error')
  }
});

//  add-category
router.post("/add-category", verifyAdmin, controller.addCategory);

router.get("/all-users",  verifyAdmin,controller.getAllUsers);
router.get("/all-orders",  verifyAdmin,(req, res) => {
  try {
    
    adminHelpers.getAllOrders().then((orders) => {
      let options = {year: 'numeric', month: 'short', day: 'numeric' };
      orders.forEach(data => {
        // console.log(data.deliveryDetails.Date);
        data.date=(data.deliveryDetails.Date.toLocaleDateString("en-US", options))
        
        });
      res.render("admin/orders", {
        admin: true,
        Admin: req.session.admin,
        orders
      });
      // res.send(orders)
    });
  } catch (error) {
    res.redirect('/error')
  }
});
router.get("/ordered-products", verifyAdmin, (req, res) => {
  try {
    
    userHelper.orderedProducts(req.query.id).then((products) => {
      res.render("admin/ordered-products", {
        admin: true,
        Admin: req.session.admin,
        products
      });
    });
  } catch (error) {
    res.redirect('/error')
  }
});
router.get("/user-details",  verifyAdmin,async (req, res) => {
  try {
    
    let userDetails = await adminHelpers.userDetails(req.query.id);
  
    res.json(userDetails);
  } catch (error) {
    res.redirect('/error')
  }
});
router.post("/set-status", verifyAdmin, (req, res) => {
  try {
    
    adminHelpers.setStatus(req.body).then(() => {
      res.json({ status: true });
    });
  } catch (error) {
    res.redirect('/error')
  }
});
router.get("/", verifyAdmin, controller.dashboard);

router.get("/remove-order",  verifyAdmin,controller.removeOrder);

router.get('/sales-report', verifyAdmin,controller.viewSalesReport)

router.get('/get-order-details', verifyAdmin,controller.orderDetails)

router.get("/stats", verifyAdmin, async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await  db.get().collection('order').aggregate([
      {
        $match:{
            status:"Delivered"
        },
      },
      {
        $project: {
          month: { $month: "$deliveryDetails.Date" },
          total:"$totalAmount"
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$total" },
        },
      },
    ]).sort({ _id: -1 }).toArray();
    res.status(200).json(data)
    console.log(data);
  } catch (err) {
    res.status(500).json(err).redirect('/error');
    console.log(err);
  }
});

router.get("/stats2", verifyAdmin, async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await  db.get().collection('order').aggregate([
      {
        $match:{
            status:"Delivered"
        },
      },
      {
      
        $project: {
          week: { $week: "$deliveryDetails.Date" },
          total:"$totalAmount"
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "$total" },
        },
      },
    ]).sort({ _id: -1 }).toArray();
    res.status(200).json(data)
    console.log(data);
  } catch (err) {
    res.status(500).json(err).redirect('/error');
    console.log(err);
  }
});
router.get("/stats3", verifyAdmin, async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await  db.get().collection('order').aggregate([
      {
        $match:{
            status:"Delivered"
        },
      },
      {
      
        $project: {
          dayOfMonth: { $dayOfMonth: "$deliveryDetails.Date" },
          total:"$totalAmount"
        },
      },
      {
        $group: {
          _id: "$dayOfMonth",
          total: { $sum: "$total" },
        },
      },
    ]).sort({ _id: -1 }).toArray();
    res.status(200).json(data)
    console.log(data);
  } catch (err) {
    res.status(500).json(err).redirect('/error');
    console.log(err);
  }
});

router.get("/stats4", verifyAdmin, async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await  db.get().collection('order').aggregate([
      {
        $match:{
            status:"Delivered"
        },
      },
      {
        $project: {
          year: { $year: "$deliveryDetails.Date" },
          total:"$totalAmount"
        },
      },
      {
        $group: {
          _id: "$year",
          total: { $sum: "$total" },
        },
      },
    ]).sort({ _id: -1 }).toArray();
    res.status(200).json(data)
    console.log(data);
  } catch (err) {
    res.status(500).json(err).redirect('/error');
    console.log(err);
  }
});
//
router.get('/getMostStats', verifyAdmin,async (req,res)=>{
 

 await adminHelpers.getMostStats().then(async(response)=>{
    let top = 0
    for (let i= 0; i < response.length-1; i++) {
      if (response[i].count<response[i+1].count) {
        top  = response[i+1]
      }
      
    }
  productHelpers.productsDetails(top._id).then(async(product)=>{
     try {
       product.count = top.count
      
    } catch (error) {
      console.log("wait for top");
    }
   
    res.json(product)
  })
   
  })
})
 router.post('/add-offer', verifyAdmin,async(req,res)=>{
  try {
    let catId = req.query.id
    let off = req.body.off
    let validTill = req.body.offTill
    adminHelpers.addCategoryOff(catId,off,validTill).then(()=>{
      res.redirect("/admin/manage-categories")
    })
 }
 catch(err){
  res.redirect('/error')
  console.log(err);
 } 
}
 )

router.get('/coupons',verifyAdmin,controller.viewCoupons)
router.post('/coupons',verifyAdmin,controller.addCoupon)
router.get('/delete-coupon',verifyAdmin,controller.deleteCoupon)
router.get('/add-offer',verifyAdmin,controller.addCatOffer)
module.exports = router;
