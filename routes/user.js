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
  console.log('Teesst oneeeeeeeeeeeeeeeeeeeeeeeeeee..............')
  console.log(user)
  console.log('Teesst oneeeeeeeeeeeeeeeeeeeeeeeeeee..............')
  let products=await userHelpers.getCartProducts(user._id)
  i=0 
  prod=Object.keys(products)
  console.log(products)
  p=parseInt(prod[prod.length-1])
    x={};
  while(i<=p){
    total=parseInt(products[String(i)].quantity)*parseInt(products[String(i)].product.Price)
    x['total'+i]=total
     i++
  }
    console.log(Object.values(x)) 
    console.log(typeof(x))
    console.log(x)
  res.render('user/cart',{admin:false,user,products,x})
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
  console.log(req.session.user._id)
  res.render('user/place-order',{admin:false,total})
})

module.exports = router;