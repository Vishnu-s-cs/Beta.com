var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helper');
const controller = require('../controllers/adminController')
/* GET users listing. */
router.get('/products', controller.products);

router.get('/add-products',(req,res)=>{
    res.render('admin/add-products',{admin:true,Admin:req.session.admin})
  })
  router.post('/add-products',(req,res)=>{
    productHelpers.addproducts(req.body,(id)=>{
      let image=req.files.image
      image.mv('./public/product-images/'+id+'.jpg',(err,data)=>{
        if(!err){
          res.render("admin/add-products",{admin:true,Admin:req.session.admin})
          console.log("DATA ADDED")
        }
        else{
          console.log(err)
        
        }
      })
      
    })
    
  })  
  router.get('/delete-product',(req,res)=>{
    let proid=req.query.id
    productHelpers.deleteProduct(proid).then((response)=>{
      res.redirect("/admin")
    })
  })

  router.get('/block-user',controller.blockUser);
  router.get('/unblock-user',controller.unblock)

  router.post('/Signup',(req,res)=>{
    adminHelpers.doSignUp(req.body).then((responce)=>{
      
      res.redirect('/admin')
    })
   
    
  })
  router.get('/signup',(req,res)=>{
    res.render('admin/admin-signup',{admin:true,Admin:req.session.admin})
  })
  router.post('/Login',(req,res)=>{
    adminHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        productHelpers.getAllProducts().then((products)=>{

        req.session.adminLoggedIn=true
        req.session.admin=response.admin
        res.redirect('/admin')
      })

      }else{
        req.session.adminLoginErr="invalid user name or password"
      res.redirect('/admin')
      

      }
    })

  })
  router.get('/products',(req,res)=>{
    if(req.session.adminLoggedIn){
      let Admin=req.session.admin
      productHelpers.getAllProducts().then((products)=>{
      res.render('admin/admin-products',{admin:true,products,Admin})
    })

    }else{
      res.render('admin/admin-login',{loginPage:true,loginErr:req.session.adminLoginErr})
      req.session.adminLoginErr=false
    }
    
  })
  router.get('/logout',(req,res)=>{
    req.session.admin=null;
    req.session.adminLoggedIn=false;
    res.redirect('/admin')
  })
  router.get('/edit-product',async (req,res)=>{
    let proId=req.query.id
    
    let product=await productHelpers.productsDetails(proId)
    res.render('admin/edit-products',{admin:true,product,Admin:req.session.admin})
    })
   router.post('/edit-products',(req,res)=>{
     let proId=req.query.id
     productHelpers.updateProducts(proId,req.body).then(()=>{
       res.redirect('/admin')
       if(req.files.image){
        let image=req.files.image
        image.mv('./public/product-images/'+proId+'.jpg')

       }
     })
   })
   router.get('/all-users',controller.getAllUsers)
   router.get('/all-orders',(req,res)=>{
     adminHelpers.getAllOrders().then((orders)=>{
      
       res.render('admin/orders',{admin:true,Admin:req.session.admin,orders})

     })
   })
   router.get('/ordered-products',(req,res)=>{
     
      adminHelpers.getOrderProducts(req.query.id).then((products)=>{

res.render('admin/ordered-products',{admin:true,Admin:req.session.admin,products})
      })

   })
   router.get('/user-details',async(req,res)=>{
     
    let userDetails=await adminHelpers.userDetails(req.query.id)

    res.json(userDetails);
   
    })
    router.post('/set-status',(req,res)=>{
     adminHelpers.setStatus(req.body).then(()=>{
     res.json({status:true})   
      })
    })
    router.get('/',controller.dashboard)
module.exports = router;
