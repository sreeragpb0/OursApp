const { PRODUCT_COLLECTION } = require('../config/collections');
var db=require('../config/connection');
var collection=require('../config/collections')

    module.exports={
    addProduct:(product,callback)=>{
        
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
           //console.log(data)
           //console.log(data.insertedId)
        //    s=data.insertedId
        //    console.log(valueOf(s))   
            callback(data.insertedId)
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await   db.get().collection(PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}