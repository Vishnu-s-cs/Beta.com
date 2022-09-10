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
      let newDate = []
      no= 0
      let u_no =0
      await adminHelpers.getAllOrders().then((orders)=>{
        
 
         orders.forEach(data => {
       
     
          if (data.status == "Delivered") {
            no++
            total=total+data.totalAmount
          }
         });
        
       })
     await  adminHelpers.getUsers().then((users)=>{
      users.reverse()
      let newUsers = []
      let newTrans = []
      for (let index = 0; index < 5; index++) {
        newUsers.push(users[index])
        
      }
      users = newUsers
        adminHelpers.getAllOrders().then((orders) => {
          for (let index = 0; index < 3; index++) {
            newTrans.push(orders[index])
            
          }
          orders = newTrans
          orders.forEach(data => {
       
            data.date=((data.deliveryDetails.Date).toLocaleDateString("en-US"))
           
       
            });
            users.forEach(data => {
       
              u_no++
             
         
              });
        res.render('admin/dashboard',{admin:true,total,users,orders,no,u_no});
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
      let no = 0
     await adminHelpers.getAllOrders().then((orders)=>{
       

        orders.forEach(data => {
          if (data.status == "Delivered") {
            no++
            total=total+data.totalAmount
          }
        
        });
       
      })
    
      
      res.render('admin/salesReport',{admin:req.session.admin,total,no})
    } catch (err) {
      console.log(err);
    }
  };
exports.orderDetails = async (req, res) => {
    try {
      adminHelpers.getAllOrders().then((orders) => {
        // orders.deliveryDetails.Date =  (orders.deliveryDetails.Date).toLocaleDateString('en-US')
        // console.log(orders,orders.deliveryDetails.Date);
        res.json(orders);
        // res.send(orders)
      });
    } catch (err) {
      console.log(err);
    }
  };
  exports.addproduct=async(req,res,next)=>{
    try{
   
      productHelpers.addproducts(req.body, async(id) => {
            try {
              let image = req.files.image;
              let subImages = []
              if(req.files?.image2){ subImages.push(req.files?.image2)}
              if(req.files?.image3){ subImages.push(req.files?.image3)}
              for (let index = 0; index < 2; index++) {
               await subImages[index].mv("./public/product-images/" + id + index +".jpg", (err, data) => {
                  if (!err) {
                
                 
                  } else {
                    console.log(err);
                  }
                })
                
              }
              await image.mv("./public/product-images/" + id + ".jpg", (err, data) => {
                if (!err) {
                  res.redirect("/admin/products");
                  
                } else {
                  console.log(err);
                }
              });
            } catch (error) {
              res.redirect('/admin/products')
            }
           
          });
    }catch(err){
      console.log(err+"error in add product")
    }
  }
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
//   };