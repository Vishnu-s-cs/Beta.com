var productHelpers=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helper');
let msg = ""
exports.products = async (req, res) => {
    try {
     
       await productHelpers.getAllProducts().then((products)=>{
        adminHelpers.getCategories().then((categories)=>{
        
          res.render('admin/admin-products',{admin:true,products,categories});
        })
        
        })
    } catch (err) {
      console.log(err);
    }
  };
  exports.dashboard= async (req, res) => {
    try {
      let total = 0
      await adminHelpers.getAllOrders().then((orders)=>{
        
 
         orders.forEach(data => {
          
          total=total+data.totalAmount
         });
        
       })
       adminHelpers.getUsers().then((users)=>{
        adminHelpers.getAllOrders().then((orders) => {
        res.render('admin/dashboard',{admin:true,total,users,orders});
      });
   
        
      })
     
   

     
      
    } catch (err) {
      console.log(err);
    }
  };

exports.blockUser = async (req, res,next) => {
  
    try {
      let userId=req.query.id
    adminHelpers.blockUser(userId).then((response)=>{
      msg = "user blocked sucessfully"
      res.redirect("/admin/all-users");
    })
    } catch (err) {
      console.log(err);
    }
  };

exports.getAllUsers = async (req, res,next) => {
    try {
      adminHelpers.getUsers().then((users)=>{
        let blockedUsers = req.session.blocked
          res.render('admin/users',{users,admin:true,Admin:req.session.admin,msg,blockedUsers})
    
        msg=""
        
      })
    } catch (err) {
      console.log(err);
    }
  };
exports.unblock = async (req, res) => {
    try {
        let userId=req.query.id
    adminHelpers.unblockUser(userId).then((response)=>{
      msg = "user unblocked sucessfully"
      res.redirect("/admin/all-users");
    })
    } catch (err) {
      console.log(err);
    }
  };
exports.viewManageCategory = async (req, res) => {
    try {
      adminHelpers.getCategories().then((response)=>{
        
        let category=  response
        console.log(req.session.admin);
        res.render("admin/manageCategory",{category,admin:req.session.admin});
    })
   } catch (err) {
      console.log(err);
    }
  };
exports.viewLogin = async (req, res) => {
    try {
      res.render("admin/admin-login");
    } catch (err) {
      console.log(err);
    }
  };

exports.addCategory = async (req, res) => {
    try {
      adminHelpers.addCategories(req.body)
        res.redirect("/admin/manage-categories");

      // redirect to /admin/manage-categories
    } catch (err) {
      console.log(err);
    }
  };
exports.viewEditCategory = async (req, res) => {
    try {
      let catId=req.query.id
      
      let category=await productHelpers.categoryDetails(catId)
      
      res.render('admin/editCategory',{admin:true,category,Admin:req.session.admin})
    } catch (err) {
      console.log(err);
    }
  };
  exports.editCategory = (req, res) => {
    try {
      let catId=req.query.id
     let data = req.body.category
    productHelpers.editCategory(catId,data)
      
      res.redirect('/admin/manage-categories')
    } catch (err) {
      console.log(err);
    }
  };
exports.deleteCategory = async (req, res) => {
    try {
      let proid=req.query.id
    productHelpers.deleteCategory(proid)
      res.redirect("/admin/manage-categories")
    } catch (err) {
      console.log(err);
    }
  };

  exports.removeOrder = async (req, res) => {
    try {
      let proid=req.query.id
    productHelpers.removeOrder(proid)
      res.redirect("/admin/all-orders")
    } catch (err) {
      console.log(err);
    }
  };

  exports.viewSalesReport = async (req, res) => {
    try {
      let total = 0
     await adminHelpers.getAllOrders().then((orders)=>{
       

        orders.forEach(data => {
         
         total=total+data.totalAmount
        });
       
      })
    
      
      res.render('admin/salesReport',{admin:req.session.admin,total})
    } catch (err) {
      console.log(err);
    }
  };
exports.orderDetails = async (req, res) => {
    try {
      adminHelpers.getAllOrders().then((orders) => {
        res.json(orders);
        // res.send(orders)
      });
    } catch (err) {
      console.log(err);
    }
  };
// exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };exports.orderSuccess = async (req, res) => {
//     try {
//       res.render("user/orderSuccess");
//     } catch (err) {
//       console.log(err);
//     }
//   };