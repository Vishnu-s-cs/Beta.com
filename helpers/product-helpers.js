var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
    addproducts:(product,callback)=>{
        product.prize=parseInt(product.prize)
        
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        }).catch((err)=>{
            console.log(err)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).removeOne({_id:objectId(proid)}).then((response)=>{
                   console.log(response);
                resolve(response)
            })
        })
    },
    productsDetails:(proId)=>{
        
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((products)=>{
                resolve(products)
        })
        })

    },
    updateProducts:(ProId,productDetails)=>{
        return new Promise((resolve,reject)=>{
            productDetails.prize=parseInt(productDetails.prize)
            db.get().collection(collections.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(ProId)},{
                $set:{
                    productname:productDetails.productname,
                    catogery:productDetails.catogery,
                    discription:productDetails.discription,
                    prize:productDetails.prize
                }
            }).then((responce)=>{
                resolve()
            })
        })

    }

}