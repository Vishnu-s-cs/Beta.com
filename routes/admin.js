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
  if (!req.session.admin) {
    res.status(403).redirect("/admin/login");
  } else {
    next();
  }
}
/* GET users listing. */

router.get("/products", verifyAdmin, controller.products);
router.get("/manage-categories", verifyAdmin, controller.viewManageCategory);
router.get("/add-products", (req, res) => {
  let categories = "";
  adminHelpers.getCategories().then((response) => {
    categories = response;
    res.render("admin/add-products", {
      admin: req.session.admin,
      Admin: req.session.admin,
      categories,
    });
  });
});
router.post("/add-products",controller.addproduct)
// router.post("/add-products", verifyAdmin, (req, res) => {
//   productHelpers.addproducts(req.body, (id) => {
//     try {
//       let image = req.files.image;
//       image.mv("./public/product-images/" + id + ".jpg", (err, data) => {
//         if (!err) {
//           res.render("admin/admin-products", {
//             admin: true,
//             Admin: req.session.admin,
//           });
//           console.log("DATA ADDED");
//         } else {
//           console.log(err);
//         }
//       });
//     } catch (error) {
//       res.redirect('/admin/products')
//     }
   
//   });
// });
router.get("/delete-product", verifyAdmin, (req, res) => {
  let proid = req.query.id;
  productHelpers.deleteProduct(proid).then((response) => {
    res.redirect("/admin/products");
  });
});

router.get("/block-user", controller.blockUser);
router.get("/unblock-user", controller.unblock);

router.post("/Signup", (req, res) => {
  adminHelpers.doSignUp(req.body).then((response) => {
    res.redirect("/admin");
  });
});
router.get("/signup", (req, res) => {
  res.render("admin/admin-signup", { admin: true, Admin: req.session.admin });
});
router.post("/Login", (req, res) => {
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
  });
});

router.get("/login", controller.viewLogin);

router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
});
router.get("/edit-product", async (req, res) => {
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
});
router.get("/edit-category", controller.viewEditCategory);

router.post("/editCategory", controller.editCategory);
router.get("/delete-category", controller.deleteCategory);
router.post("/edit-products", async(req, res) => {
  let proId = req.query.id;
  productHelpers.updateProducts(proId, req.body).then(async() => {
    try {
      let image = req.files.image;
      let subImages = []
      if(req.files?.image2){ subImages.push(req.files?.image2)}
      if(req.files?.image3){ subImages.push(req.files?.image3)}
      for (let index = 0; index < 2; index++) {
       await subImages[index].mv("./public/product-images/" + proId + index +".jpg", (err, data) => {
          if (!err) {
          console.log("sub images added",index);
         
          } else {
            console.log(err);
          }
        })
        
      }
      await image.mv("./public/product-images/" + proId + ".jpg", (err, data) => {
        if (!err) {
          res.redirect("/admin/products");
          
        } else {
          console.log(err);
        }
      });
    } catch (error) {
      console.log(error);
      res.redirect('/admin/products')
    }
  });
});

//  add-category
router.post("/add-category", controller.addCategory);

router.get("/all-users", controller.getAllUsers);
router.get("/all-orders", (req, res) => {
  adminHelpers.getAllOrders().then((orders) => {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
});
router.get("/ordered-products", (req, res) => {
  userHelper.orderedProducts(req.query.id).then((products) => {
   
    res.render("admin/ordered-products", {
      admin: true,
      Admin: req.session.admin,
      products
    });
  });
});
router.get("/user-details", async (req, res) => {
  let userDetails = await adminHelpers.userDetails(req.query.id);

  res.json(userDetails);
});
router.post("/set-status", (req, res) => {
  adminHelpers.setStatus(req.body).then(() => {
    res.json({ status: true });
  });
});
router.get("/", verifyAdmin, controller.dashboard);

router.get("/remove-order", controller.removeOrder);

router.get('/sales-report',controller.viewSalesReport)

router.get('/get-order-details',controller.orderDetails)

router.get("/stats", async (req, res) => {
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
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/stats2", async (req, res) => {
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
    res.status(500).json(err);
    console.log(err);
  }
});
router.get("/stats3", async (req, res) => {
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
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/stats4", async (req, res) => {
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
    res.status(500).json(err);
    console.log(err);
  }
});
//
router.get('/getMostStats',async (req,res)=>{
 

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
 router.post('/add-offer',async(req,res)=>{
  try {
    let catId = req.query.id
    let off = req.body.off
    adminHelpers.addCategoryOff(catId,off)
 }
 catch(err){
  console.log(err);
 } 
}
 )
module.exports = router;
