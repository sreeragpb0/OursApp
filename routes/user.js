var express = require('express');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user
  console.log(user)
  productHelpers.getAllProduct().then((product) => {
    //console.log(product)

    res.render('user/view-products', { admin: false, product, user });

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

router.get('/signup', (req, res) => {
  res.render('user/signup', { admin: false })
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response.insertedId)

  });
  res.render('user/login', { admin: false })

});
router.post('/login', (req, res) => {
  console.log(req.body)
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {

      req.session.loggedIn = true
      //console.log(response.status)
      //console.log("tes")
      req.session.user = response.user
      console.log("testingsssssssssssssss")
      console.log(response.user.fname)
      
      res.redirect('/')

    } else {
      req.session.err="invalid username or password."
      res.redirect('/login')

    }
  })
});
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')




})
router.get('/cart', (req, res)=>{
  if(req.session.user){
    // console.log("cart area..................................................")
    //console.log(req.session.user.fname)
  res.render('user/cart',{admin:false,user:req.session.user})
  }else{
    res.redirect('/login')
  }
})

module.exports = router;