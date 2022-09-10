var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
    addproducts:(product,callback)=>{
        product.price=parseInt(product.price)
        product.createdAt = new Date().toISOString() 
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
        productDetails.price=parseInt(productDetails.price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(ProId)},{
                $set:{
                    productname:productDetails.productname,
                    category:productDetails.category,
                    description:productDetails.description,
                    price:productDetails.price,
                    updatedAt: new Date().toISOString()
                }
            }).then((response)=>{
                resolve()
            })
        })

    },
    categoryDetails:(catId)=>{
        
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category)
        })
        })

    },
    editCategory:(catId,data)=>{
        console.log(catId);
       db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{$set:{category:data}})
             
        

    },
    deleteCategory:(proid)=>{
     
            db.get().collection(collections.CATEGORY_COLLECTION).removeOne({_id:objectId(proid)})
    },
    removeOrder:(proid)=>{
     
        db.get().collection(collections.ORDER_COLLECTION).removeOne({_id:objectId(proid)})
}

}