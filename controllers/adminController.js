var productHelpers=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helper');
let msg = ""
exports.products = async (req, res) => {
    try {
        productHelpers.getAllProducts().then((products)=>{
            res.render('admin/admin-products',{admin:true,products});
        })
    } catch (err) {
      console.log(err);
    }
  };
  exports.dashboard= async (req, res) => {
    try {
      res.render('admin/dashboard',{admin:true});
      
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