var productHelpers=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helper');
let msg = ""
exports.products = async (req, res) => {
    try {
     
       await productHelpers.getAllProducts().then((products)=>{
        adminHelpers.getCategories().then((categories)=>{
        
          res.render('admin/admin-products',{admin:true,products,categories});
        })
        
        }).catch(()=>{res.redirect('/error')})
    } catch (err) {
      res.redirect('/error')
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
        
       }).catch(()=>{res.redirect('/error')})
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
   
        
      }).catch(()=>{res.redirect('/error')})
     
   

     
      
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };

exports.blockUser = async (req, res,next) => {
  
    try {
      let userId=req.query.id
    adminHelpers.blockUser(userId).then((response)=>{
      msg = "user blocked sucessfully"
      res.redirect("/admin/all-users");
    }).catch(()=>{res.redirect('/error')})
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };

exports.getAllUsers = async (req, res,next) => {
    try {
      adminHelpers.getUsers().then((users)=>{
        let blockedUsers = req.session.blocked
          res.render('admin/users',{users,admin:true,Admin:req.session.admin,msg,blockedUsers})
    
        msg=""
        
      }).catch(()=>{res.redirect('/error')})
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.unblock = async (req, res) => {
    try {
        let userId=req.query.id
    adminHelpers.unblockUser(userId).then((response)=>{
      msg = "user unblocked sucessfully"
      res.redirect("/admin/all-users");
    }).catch(()=>{res.redirect('/error')})
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.viewManageCategory = async (req, res) => {
    try {
      adminHelpers.getCategories().then((response)=>{
        
        let category=  response
        console.log(req.session.admin);
        res.render("admin/manageCategory",{category,admin:req.session.admin});
    }).catch(()=>{res.redirect('/error')})
   } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.viewLogin = async (req, res) => {
    try {
      res.render("admin/admin-login");
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };

exports.addCategory = async (req, res) => {
    try {
      adminHelpers.addCategories(req.body).catch(()=>{res.redirect('/error')})
        res.redirect("/admin/manage-categories");

      // redirect to /admin/manage-categories
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.viewEditCategory = async (req, res) => {
    try {
      let catId=req.query.id
      
      let category=await productHelpers.categoryDetails(catId).catch(()=>{res.redirect('/error')})
      
      res.render('admin/editCategory',{admin:true,category,Admin:req.session.admin})
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
  exports.editCategory = (req, res) => {
    try {
      let catId=req.query.id
     let data = req.body.category
    productHelpers.editCategory(catId,data).catch(()=>{res.redirect('/error')})
      
      res.redirect('/admin/manage-categories')
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.deleteCategory = async (req, res) => {
    try {
      let proid=req.query.id
    productHelpers.deleteCategory(proid).catch(()=>{res.redirect('/error')})
      res.redirect("/admin/manage-categories")
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };

  exports.removeOrder = async (req, res) => {
    try {
      let proid=req.query.id
    productHelpers.removeOrder(proid).catch(()=>{res.redirect('/error')})
      res.redirect("/admin/all-orders")
    } catch (err) {
      console.log(err);
      res.redirect('/error')
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
        let options = {year: 'numeric', month: 'short', day: 'numeric' };
        orders.forEach(data => {
          // console.log(data.deliveryDetails.Date);
          data.date=(data.deliveryDetails.Date.toLocaleDateString("en-US", options))
          
          });
        res.render('admin/salesReport',{admin:req.session.admin,total,no,orders})
      }).catch(()=>{res.redirect('/error')})
    
      
      
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
exports.orderDetails = async (req, res) => {
    try {
      adminHelpers.getAllOrders().then((orders) => {
        // orders.deliveryDetails.Date =  (orders.deliveryDetails.Date).toLocaleDateString('en-US')
        // console.log(orders,orders.deliveryDetails.Date);
        res.json(orders);
        // res.send(orders)
      }).catch(()=>{res.redirect('/error')});
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
  exports.addproduct=async(req,res,next)=>{
    try{
   
      productHelpers.addproducts(req.body, async(id) => {
            try {
              let image = req.files.image;
              let banner = req.files.image4
              let subImages = []
              if(req.files?.image2){ subImages.push(req.files?.image2)}
              if(req.files?.image3){ subImages.push(req.files?.image3)}
           
              for (let index = 0; index < subImages.length; index++) {
               await subImages[index].mv("./public/product-images/" + id + index +".jpg", (err, data) => {
                  if (!err) {
                
                 
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
              res.redirect('/admin/products')
            }
            await banner.mv("./public/banners/" + proId + ".jpg", (err, data) => {
              if (!err) {
                res.redirect("/admin/products");
                
              } else {
                console.log(err);
                
              }
            });
           
          }).catch(()=>{res.redirect('/error')});
    }catch(err){
      console.log(err+"error in add product")
      res.redirect('/error')
    }
  }
  exports.viewCoupons = async (req, res) => {
    try {
      adminHelpers.getCoupons().then((response)=>{
        
        let coupons=  response

        res.render("admin/coupons",{coupons,admin:req.session.admin});
    }).catch(()=>{res.redirect('/error')})
   } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
  exports.addCoupon = async (req, res) => {
    try {
      adminHelpers.addCoupon(req.body).catch(()=>{res.redirect('/error')})
        res.redirect("/admin/coupons");

      // redirect to /admin/manage-categories
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };

  exports.deleteCoupon = async (req, res) => {
    try {
      let proid=req.query.id
    productHelpers.deleteCoupon(proid).catch(()=>{res.redirect('/error')})
      res.redirect("/admin/coupons")
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
  exports.addCatOffer = async (req, res) => {
    try {
      let catId = req.query.id
      res.render("admin/addCategoryOffers",{catId,admin:true});
    } catch (err) {
     
      res.redirect('/error')
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
//   };