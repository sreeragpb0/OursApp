var db = require('../config/connection');
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('../app');

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            userData.r_password = await bcrypt.hash(userData.r_password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data)
                // console.log(userData)
            })


        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            // console.log(userData)
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("successfully Logged in.");
                        response.user = user
                        response.status = true
                        resolve(response)
                        // console.log(user.fname)
                        //console.log(user.lname)

                    } else {
                        console.log("Login failed..");
                        resolve({ status: false })
                    }
                });
            } else {
                console.log("Login failed..");
                resolve({ status: false })
            }


        })

    },
    viewallusers: (data) => {
        if (data) {


            return new Promise(async (resolve, reject) => {
                let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                if (users) {
                    // console.log('testing adddddd startedddddddddddddddddddddddddd')
                    // console.log(users)
                    // console.log('test ends hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                    resolve(users)
                } else {
                    console.log("failed to fetch the details")
                }
            })
        } else {
            console.log('failed to fetch those details...')
        }
    },
    deleteUser: (id) => {
        if (id) {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: ObjectId(id) }).then((data) => {
                    resolve(data)
                })
            })
        }
    },
    viewuser: (id) => {
        if (id) {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(id) }).then((data) => {
                    resolve(data)
                })
            })
        }
    },
    editUser: (data) => {
        if (data) {
            console.log("edit user area....")
            console.log(data)
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(data.id) }, {
                    $set: {
                        fname: data.fname,
                        lname: data.lname,
                        email: data.email

                    }
                }).then((res) => {
                    resolve(res)
                })
            })
        }
    },
    add_to_cart: (prod_Id, user_Id) => {
        let proObj = {
            item: ObjectId(prod_Id),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(user_Id) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prod_Id)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ 'products.item': ObjectId(prod_Id) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    // console.log("collection ind tta ivanivade ..........................................................")
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(user_Id) },
                            {

                                $push: { products: proObj }

                            }).then((response) => {
                                resolve(response)
                            })
                }
            } else {
                let cartObj = {
                    user: ObjectId(user_Id),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })

    },
    getCartProducts: (user_Id) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(user_Id) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (user_id) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(user_id) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    dProQty: (details) => {
        console.log(details)
        quantity = parseInt(details.quantity)
        count = parseInt(details.count)
        return new Promise(async (resolve, reject) => {
            if (count == -1 && quantity == 1) {
                console.log(details)
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })

            } else {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({
                        _id: ObjectId(details.cart), 'products.item': ObjectId(details.product)
                    },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then((response) => {
                            resolve(true)
                        })

            }
        })

    },
    iProQty: (details) => {
        return new Promise((resolve, reject) => {
            // console.log(details)
            count = parseInt(details.count)
            // let ogcount=await db.get().collection(collection.CART_COLLECTION)
            // .findOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)})
            // console.log('ogcount:'+ogcount.products[0].quantity)
            // console.log(ogcount)
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({
                    _id: ObjectId(details.cart), 'products.item': ObjectId(details.product)
                },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        resolve(true)
                    })
        })
    },
    removeProduct: (details) => {
        // console.log('details')
        // console.log(details)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({
                    _id: ObjectId(details.cart), 'products.item': ObjectId(details.product)
                },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }).then((response) => {
                        resolve({ prodrm: true })
                    })
        })
    },
    getTotalAmt: (user_Id) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(user_Id) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        _id: null,
                        quantity: '$quantity',
                        Price: { $toInt: '$product.Price' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$Price'] } }
                    }
                }

            ]).toArray()
            //  console.log('totalllllllllllllllllllllll')
            //  total=total[0].total
              let totAmt=parseInt(total[0].total)
            resolve({status:false,total:totAmt})
        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise(async (resolve,reject)=>{
            // console.log(order)
            let status=order.payMethod==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{

                    address:order.HouseName,
                    Pincode:order.Zip,
                    Mobile:order.Mobile,
                    user:order.fname
                },
                userId:ObjectId(order.userId),
                payMethod:order.payMethod,
                products:products,
                status:status,
                total:total,
                date:new Date()
                // ship:5,
                // dateshiping:{ $sum: ['$day','$ship']}
            }
            console.log('orderObj')
            console.log(orderObj)
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
                resolve({status:true})
            })

            
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log('typeof the cart') 
            console.log(typeof(cart)) 
            console.log('resolving') 

            resolve({status:false,cartProd:cart})

        })

    },
    getMyOrders:(userId) =>{
        console.log(userId)
        return new Promise(async(resolve,reject)=>{
            let myOrders=await db.get().collection(collection.ORDER_COLLECTION).findOne({userId:ObjectId(userId)})
            // console.log('user-helpers get myorders')
            let status=true
            // console.log(myOrders)
            resolve(myOrders,status)
        })
    }


}