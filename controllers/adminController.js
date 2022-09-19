let productHelpers=require('../helpers/product-helpers')
let adminHelpers=require('../helpers/admin-helper');
let db=require('../config/connection')
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
        
       }).catch((err)=>{res.redirect('/error')})
     await  adminHelpers.getUsers().then((users)=>{
      users.reverse()
      let newUsers = []
      let newTrans = []
      for (let index = 0; index < 5; index++) {
        newUsers.push(users[index])
        
      }
      users = newUsers
        adminHelpers.getAllOrders().then(async(orders) => {
          for (let index = 0; index < 3; index++) {
            newTrans.push(orders[index])
            
          }
          orders = newTrans
          try {
            console.log(orders,"oooooordders");
            orders.forEach(data => {
              
              data.date=((data.deliveryDetails.Date).toLocaleDateString("en-US"))
             
         
              });
          } catch (err) {
            console.log("errrrrrrrrrrrrrrrrrrrrr",err)
            res.redirect('/error')
          }
          await adminHelpers.getUsers().then((users)=>{users.forEach(data => {
       
            u_no++
           
       
            });})
            
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
    }).catch((err)=>{console.log(err,"0000000000000"); res.redirect('/error')})
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
       
        res.json(orders);
        // res.send(orders)
      }).catch(()=>{res.redirect('/error')});
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  };
  exports.addProduct=async(req,res,next)=>{
    try{
   
      await productHelpers.addproducts(req.body, async(id) => {
        try {
          let image = req.files.image;
          let banner = req.files.image4;
          let subImages = []
          if(req.files?.image2){subImages.push(req.files?.image2)}
          if(req.files?.image3){subImages.push(req.files?.image3)}
          try {
            
         
          for (let index = 0; index < subImages.length; index++) {
           await subImages[index].mv("./public/product-images/" + id + index +".jpg", (err, data) => {
              if (!err) {
              
              console.log("sub images added",index);
              
              } else {
                console.log(err);
              }
            })
            
          }
        } catch (error) {
          
            res.redirect('/error')
        }
          if (image) {
            await image.mv("./public/product-images/" + id + ".jpg", (err, data) => {
              if (!err) {
                // res.redirect("/admin/products");
               console.log("image added");
              } else {
                console.log(err);
              }
            });
          }
          if (banner) {
            await banner.mv("./public/banners/" + id + ".jpg", (err, data) => {
              if (!err) {
              
                console.log("banner");
              } else {
                console.log(err);
              }
            });
          }
          
        } catch (error) {
          console.log(error);
          res.redirect('/admin/products')
        }
          finally{
            res.redirect("/admin/products")
          }
          }).then(()=>{console.log("added succesfully")}).catch((err)=>{console.log(err);});
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
exports.viewAddProduct = (req, res) => {
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
}

exports.deleteProduct =  (req, res) => {
  try {
    

  let proid = req.query.id;
  productHelpers.deleteProduct(proid).then((response) => {
    res.redirect("/admin/products");
  });  
} catch (error) {
    res.redirect('/error')
  }
}
exports.login = (req, res) => {
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
}
exports.logout = (req, res) => {
  try {
    req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
  } catch (error) {
    res.redirect('/error')
  }
  
}
exports.viewEditProduct = async (req, res) => {
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
}
exports.editProduct = async(req, res,next) => {
  try {
    
    let proId = req.query.id;
    productHelpers.updateProducts(proId, req.body).then(async() => {
      try {
        let image = req.files.image;
        let banner = req.files.image4;
        let subImages = []
        if(req.files?.image2){subImages.push(req.files?.image2)}
        if(req.files?.image3){subImages.push(req.files?.image3)}
        try {
        for (let index = 0; index < subImages.length; index++) {
         await subImages[index].mv("./public/product-images/" + proId + index +".jpg", (err, data) => {
            if (!err) {        
            console.log("sub images added",index);
            } else {
              console.log(err);
            }
          })
        }
      } catch (error) {
          res.redirect('/error')
      }
        if (image) {
          await image.mv("./public/product-images/" + proId + ".jpg", (err, data) => {
            if (!err) {
              // res.redirect("/admin/products");
            
              
            } else {
              console.log(err);
            }
          });
        }
        if (banner) {
          await banner.mv("./public/banners/" + proId + ".jpg", (err, data) => {
            if (!err) {
              
            
            } else {
              console.log(err);
            }
          });
        }
        
      } catch (error) {
        console.log(error);
        res.redirect('/admin/products')
      }
      finally{
        res.redirect("/admin/products")
      }
    }).then(()=>{console.log("edit successfull");}).catch((err)=>{console.log("error");});
  } catch (error) {
    res.redirect('/error')
  }
}


exports.getAllOrders = (req, res) => {
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
};
exports.stats = async (req, res) => {
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
};


exports.stats2 = async (req, res) => {

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
}
  exports.stats3 =  async (req, res) => {
   
  
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
  }
  exports.stats4 = async (req, res) => {
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
  }
  exports.getMostStats = async (req,res)=>{
 

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
   }

   
  exports.orderSuccess = async (req, res) => {
      try {
        res.render("user/orderSuccess");
      } catch (err) {
        console.log(err);
      }
    };

  exports.addOffer = async(req,res)=>{
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
  exports.getOrderedProducts = (req, res) => {
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
  }

  exports.getUserDetails = async (req, res) => {
    try {
      
      let userDetails = await adminHelpers.userDetails(req.query.id);
    
      res.json(userDetails);
    } catch (error) {
      res.redirect('/error')
    }
  }
 
  exports.setStatus = (req, res) => {
    try {
      
      adminHelpers.setStatus(req.body).then(() => {
        res.json({ status: true });
      });
    } catch (error) {
      res.redirect('/error')
    }
  }
