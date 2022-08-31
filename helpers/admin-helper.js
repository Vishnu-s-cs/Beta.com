var db=require('../config/connection')
var collections=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
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
        })

    },
   
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
         let users= await db.get().collection(collections.USER_COLLECTION).find().toArray()
         
         resolve(users)
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).find().sort({ "deliveryDetails.Date": -1 }).toArray()
            
            resolve(orders)
        })
    },
 
   
    userDetails:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
         let user=await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)})
                
                resolve(user)
            
        })
    },
    setStatus:(details)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(details.orderId)},
            {
                $set:{status:details.status}
            }
            )
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
           
            let query={ _id: objectId(userId) };
            db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:true}}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                console.log(err)
            })
        })
    }  ,
    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
      
            let query={ _id: objectId(userId) };
            db.get().collection(collections.USER_COLLECTION).findOneAndUpdate(query,{$set:{blocked:false}}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                console.log(err)
            })
        })
    },
   
    getCategories:()=>{
        return new Promise(async(resolve,reject)=>{
         let categories= await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
         
         resolve(categories)
        })
    }
    ,
   
    addCategories:(data)=>{
        
        db.get().collection(collections.CATEGORY_COLLECTION).insertOne(data)
         
         
  
    },
//     getOrderStats:()=>{
//         db.get().collection(collections.ORDER_COLLECTION)
// 1    }
    
    
}