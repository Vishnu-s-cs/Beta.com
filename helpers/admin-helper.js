var db=require('../config/connection')
var collections=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
let moment = require('moment')
module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
        
            let response={}
            let admin=await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        console.log("logged in");
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("password err")
                        resolve({status:false})

                    }
                })
            }else
            {
                console.log("user not found")
                resolve({status:"falseUser"})
            }
                
        } catch (error) {
                reject()
        }
        })

    },
   
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let users= await db.get().collection(collections.USER_COLLECTION).find().toArray()
         
                resolve(users)
            } catch (error) {
                reject()
            }
        
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let orders=await db.get().collection(collections.ORDER_COLLECTION).find().sort({"deliveryDetais.date":-1}).toArray()
            
            resolve(orders) 
            } catch (error) {
                reject(error)
            }
           
        })
    },
 
   
    userDetails:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try {
                let user=await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)})
                
                resolve(user)
            } catch (error) {
                reject()
            }
      
            
        })
    },
    setStatus:(details)=>{
        
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(details.orderId)},
                {
                    $set:{status:details.status}
                }
                )
            } catch (error) {
                reject()
            }
          
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
           try {
              let query={ _id: objectId(userId) };
            db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:true}}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                console.log(err,"llllllllllll")
                reject(err)
            })
            
           } catch (error) {
            reject(error)
           }
          
        })
    }  ,
    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
      try {
        let query={ _id: objectId(userId) };
        db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:false}}).then((response)=>{
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
      } catch (error) {
        reject()
      }
         
        })
    },
   
    getCategories:()=>{
        getOffers()
        return new Promise(async(resolve,reject)=>{
            try {
                let categories= await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
         
         resolve(categories)
            } catch (error) {
                reject(error)
            }
         
        })
    }
    ,
   
    addCategories:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try {
        db.get().collection(collections.CATEGORY_COLLECTION).insertOne(data)
                
            } catch (error) {
                reject()
            }
    })
         
  
    },
    //
    getMostStats:()=>{
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (error) {
                reject()
            }
            
          });
   },
   addCategoryOff:(catId,offer,validTill)=>{
 
        return new Promise(async(resolve,reject)=>{
            try {
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
            } catch (error) {
                reject()
            }
            
            
    
        })
        
   
        
    
   },
   
   getCoupons:()=>{
       return new Promise(async(resolve,reject)=>{
        try {
            let coupons= await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
        
        resolve(coupons)
        } catch (error) {
            reject()
        }
        
       })
   }, addCoupon:(data)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            db.get().collection(collections.COUPON_COLLECTION).insertOne(data)
        } catch (error) {
            reject()
        }
    
    })
     

}
    //
    
}
function getOffers(){
    return new Promise((resolve, reject) => {
        try {
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
        } catch (error) {
            reject()
        }
       
        // db.get().collection(collections.CATEGORY_COLLECTION).find().toArray().then((category) => {
        //     resolve(category)
        // })
    })

}