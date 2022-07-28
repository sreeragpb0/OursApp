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
        if (data){

       
        return new Promise(async (resolve,reject)=>{
            let users= await db.get().collection(collection.USER_COLLECTION).find().toArray()
            if (users){
                // console.log('testing adddddd startedddddddddddddddddddddddddd')
                // console.log(users)
                // console.log('test ends hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                resolve(users)
            }else{
                console.log("failed to fetch the details")
            }
        })
    }else{
        console.log('failed to fetch those details...')
    }
},
deleteUser  :(id) =>{
    if (id){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).deleteOne({_id:ObjectId(id)}).then((data)=>{
                resolve(data)
            })
        })
    }
},
viewuser:(id)=>{
    if(id){
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(id)}).then((data)=>{
                resolve(data)
            })
        })
    }
},
editUser:(data)=>{
    if(data){
        console.log("edit user area....")
        console.log(data)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(data.id)},{
                $set:{
                    fname:data.fname,
                    lname:data.lname,
                    email:data.email

                }
            }).then((res)=>{
                resolve(res)
            })  
        })
    }
},
}