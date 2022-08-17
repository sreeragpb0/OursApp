var express = require('express');
const { ObjectId, Db } = require('mongodb');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()

  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  //console.log(user)
  let cartCount=null
  if(user){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  productHelpers.getAllProduct().then((product) => {
    //console.log(product)
    //console.log(typeof(product))

    res.render('user/view-products', { admin: false, product, user,cartCount });

  })

});
router.get('/login', (req, res) => {
  if(req.session.loggedIn){
    res.redirect('/')
  }else{

    res.render('user/login', { admin: false,"loginErr":req.session.err })
    req.session.err=false
  }
  

  //console.log(er)
});
router.post('/login', (req, res) => {
  // console.log(req.body)
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
      //console.log(response.status)
      //console.log("tes")
      
      // console.log("testingsssssssssssssss")
      // console.log(response.user.fname)
    } else {
      req.session.err="invalid username or password."
      res.redirect('/login')
    }
  })
});

router.get('/signup', (req, res) => {
  res.render('user/signup', { admin: false })
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log("testing on signup")
    id=response.insertedId
    console.log(req.session)
    req.session.loggedIn=true
    req.session.user=response
    console.log("testing on signup2222")
    console.log(response.insertedId)
    let image=req.files.Image
    image.mv('./public/user-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('user/login', { admin: false })
        console.log('no error signup and img upload')


      }
      else {
        console.log('error:               ' + err)
      }
    })

  });
 

});

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin,async(req, res)=>{
  //console.log(req.session.user._id)
  user=req.session.user
  // console.log('Teesst oneeeeeeeeeeeeeeeeeeeeeeeeeee..............')
  // console.log(user)
  // console.log('Teesst oneeeeeeeeeeeeeeeeeeeeeeeeeee..............')
  let products=await userHelpers.getCartProducts(user._id) 
  if(products.length!=0){
// let pq=parseInt(products[0].quantity)
   // console.log('if part is working...........')
  let total=await userHelpers.getTotalAmt(req.session.user._id)
  // console.log(total.total)
  res.render('user/cart',{admin:false,user,products,total:total.total})
  }else{
    // console.log('else part is working...........')
    res.render('user/cart',{admin:false,user})
  }
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userId=req.session.user._id
  userHelpers.add_to_cart(req.params.id,userId).then(()=>{
  res.json({status:true})
  })
})
router.post('/increment-proQty',verifyLogin,(req,res,next)=>{
  userHelpers.iProQty(req.body).then((response)=>{
    res.json(response)

  })

})
router.post('/decrement-proQty',verifyLogin,(req,res,next)=>{
  userHelpers.dProQty(req.body).then((response)=>{
    res.json(response)

  })
})
router.post('/remove-product',verifyLogin,(req,res,next)=>{
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response)
    
  })
})
router.get('/place-order',verifyLogin,async(req,res,next)=>{
  let total=await userHelpers.getTotalAmt(req.session.user._id)
  // console.log(req.session.user._id)
   console.log(total)
  res.render('user/place-order',{admin:false,total:total.total,user:req.session.user})
  // console.log("user filled...")
  // req.session.user.total=total
  
})
router.post('/place-order',verifyLogin,async (req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmt(req.body.userId)
  if(totalPrice.total.length!=0){ 
    totalPrice=totalPrice.total 
    products=products.cartProd.products
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json(response)
  })
}else{
  res.json({status:false})

}

  
})
router.get('/myOrders',verifyLogin,async(req,res,next)=>{
  let userId=req.session.user._id
  let myOrders=await userHelpers.getMyOrders(userId)
  console.log(myOrders)
  if(myOrders!=null){
  console.log('my Orders at user.js.....................')
  console.log(Object.keys(myOrders))
  console.log('If part is working successfully......')
  console.log(myOrders)
  let myOrderProd=myOrders.products
  let total=myOrders.total
  let status=myOrders.status
  let username=myOrders.deliveryDetails.user
  let prodName=[];
   prod=await productHelpers.viewProducts(myOrderProd)
   prodName.push(prod)
    res.render('user/shipmentDetails',{admin:false,user:req.session.user,myOrders:myOrderProd,total,status,username})
  }else{
    console.log('Else part is working..............')
    res.redirect('/')
  }
  

})

module.exports = router;