var db=require('../config/connection')
var collections=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
module.exports={
    doLogin:async (adminData)=>{
        try {
            return await new Promise(async (resolve, reject) => {
             
                let response = {}
                let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: adminData.email })
                if (admin) {

                    bcrypt.compare(adminData.password, admin.password).then((status) => {
                        if (status) {
                            console.log("logged in")
                            response.admin = admin
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("password err")
                            resolve({ status: false })

                        }
                    })
                }
                else {
                    console.log("user not found")
                    resolve({ status: "falseUser" })
                }
            })
        } catch(error) {
            console.log(error);
        }

    },
   
    getUsers:async ()=>{
        try {
            return await new Promise(async (resolve, reject) => {
               await db.get().collection(collections.USER_COLLECTION).find().toArray()
                .then((users)=>{
                    resolve(users);
                 }).catch((err)=>{reject();})

            })
        } catch (err) {
            console.log(err);
        }
    },
    getAllOrders:async ()=>{
        try {
            return await new Promise(async (resolve, reject) => {
               await db.get().collection(collections.ORDER_COLLECTION).find().sort({ "deliveryDetails.Date": -1 }).toArray()
                .then((orders)=>{
                    resolve(orders);
                 }).catch((err)=>{reject();})
            })
        } catch(err) {
            console.log(err);
        }
    },
 
   
    userDetails:async (userId)=>{
        
        try {
            return await new Promise(async (resolve, reject) => {
                await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user)=>{
                    resolve(user);
                 }).catch((err)=>{reject();})

            })
        } catch(err) {
            console.log(err);
        }
    },
    setStatus:async (details)=>{
        
        try {
            return await new Promise((resolve, reject) => {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(details.orderId) },
                    {
                        $set: { status: details.status }
                    }
                ).then(()=>{
                    resolve();
                 }).catch((err)=>{reject();})
            })
        }catch(err) {
            console.log(err);
        }
    },
    blockUser:(userId)=>{
        try {
            return new Promise((resolve,reject)=>{
            
                let query={ _id: objectId(userId) };
                db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:true}}).then((response)=>{
                    resolve(response)
                }).catch((err)=>{
                    console.log(err)
                    reject()
                })
                
             
              
            })
        } catch (error) {
            console.log(error);
        }
       
    }  ,
    unblockUser:(userId)=>{
        try {
            return new Promise((resolve,reject)=>{
      
                let query={ _id: objectId(userId) };
                db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:false}}).then((response)=>{
                    resolve(response)
                }).catch((err)=>{
                    console.log(err)
                    reject()
                })
            })  
        } catch (error) {
            console.log(error);
        }
      
    },
   
    getCategories:async ()=>{
        try {
            getOffers()
            return await new Promise(async (resolve, reject) => {
               await db.get().collection(collections.CATEGORY_COLLECTION).find()
                console.log(categories);

                resolve(categories)
            })
      
    }catch(err){
        console.log(err);
    }}
    ,
   
    addCategories:(data)=>{
        try {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(data)
        } catch (error) {
            console.log(error);
        }
       

         
         
  
    },
    //
    getMostStats:()=>{
        return new Promise(async (resolve, reject) => {
            let data = await db
              .get()
              .collection(collections.ORDER_COLLECTION)
              .aggregate([
                {
                  $unwind: "$products.products",
                },
                {
                  $project: {
                    item: "$products.products.item",
                  },
                },
                {
                  $lookup: {
                    from: collections.PRODUCT_COLLECTION,
                    localField: "item",
                    foreignField: "_id",
                    as: "products",
                  },
                }, 
               
                {
                  $project: {
                    product:"$item",
                    total: { $sum: 1 },
                  },
                },
                {
                    $group:{
                        _id:"$product",
                        count:{$sum:1}
                    }
                }
                
               
              ])
              .toArray();
            resolve(data);
          });
   },
   addCategoryOff:(catId,offer,validTill)=>{
    try {
        return new Promise(async(resolve,reject)=>{
            let offerPrice = []
            let off=Number(offer)
            let offTill = validTill
            let ppa = {category:catId} 
            await db.get().collection(collections.PRODUCT_COLLECTION).find(ppa).toArray().then((res)=>{
                res.forEach(data=>{
                    let price = Number(data.price)
                    offerPrice.push({offerPrice:parseInt(price-(price*(off/100))),proId:data._id})
                })
               offerPrice.forEach(data=>{
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:data.proId},{$set:{offerPrice:data.offerPrice}})
               })
               db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{$set:{offer:off,validTill:offTill}}).then((res)=>{
                
               })
            })
          resolve()
            
    
        })
        
    } catch (error) {
        console.log(error);
    }
    
        
    
   },
   
   getCoupons:()=>{
       return new Promise(async(resolve,reject)=>{
        let coupons= await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
        
        resolve(coupons)
       })
   }, addCoupon:(data)=>{
        
    db.get().collection(collections.COUPON_COLLECTION).insertOne(data)
     
     

}
    //
    
}
function getOffers(){
    return new Promise((resolve, reject) => {
        let date = new Date()
        let currentDate = moment(date).format('YYYY-MM-DD')
        db.get().collection(collections.CATEGORY_COLLECTION).find().toArray().then(async(categories) => {
        
            for (let i in categories) {
                let catId = categories[i]._id.toString()
                let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({category:catId}).toArray()
                console.log(products);
                if (categories[i].offer) {
                    if (categories[i].validTill < currentDate) {
                        db.get().collection(collections.CATEGORY_COLLECTION).findOneAndUpdate({ _id: objectId(categories[i]._id) },
                            {
                                $unset: {
                                    "offer": categories[i].offer,
                                    
                                }
                            })
                            products.forEach(data=>{
                                db.get().collection(collections.PRODUCT_COLLECTION).updateMany({category:catId},
                                    {
                                        $unset: {
                                            "offerPrice" :data.offerPrice,
                                        }
                                    })
                            })
                           
                    }
                }
            }
        })
        // db.get().collection(collections.CATEGORY_COLLECTION).find().toArray().then((category) => {
        //     resolve(category)
        // })
    })

}