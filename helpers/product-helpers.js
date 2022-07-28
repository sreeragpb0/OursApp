const { PRODUCT_COLLECTION } = require('../config/collections');
var db = require('../config/connection');
var objectId=require('mongodb').ObjectId
var collection = require('../config/collections')

module.exports = {
    addProduct: (product, callback) => {

        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            console.log(data)
            //console.log(data.insertedId)
            //    s=data.insertedId
            //    console.log(valueOf(s))   
            callback(data.insertedId)
        })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        //console.log(prodId)
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((resp)=>{
                resolve(resp)
             })
        })
        
    },
    viewProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    updateProduct:(productData)=>{

        console.log(productData)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productData.id)},{
                $set:{
                    productName:productData.productName,
                    Description:productData.Description,
                    Price:productData.Price,
                    Category:productData.Category
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}