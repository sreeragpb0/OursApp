var db = require('../config/connection');
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

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
                    console.log("collection ind tta ivanivade ..........................................................")
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(user_Id) },
                            {

                                $push: { products: proObj }

                            }).then((response) => {
                                resolve(response)
                            })
                }
            }else {
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
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
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
    }
}