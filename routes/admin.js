var express = require('express');
const { response } = require('../app');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


/* GET users listing. */

// router.get('/admin', (req, res) => {
//   console.log("adming get teasts...")
//   console.log(req.body)
//   // let user = req.session
//   console.log(user)
//   console.log(req.session)
//   if (user === 'admin') {
//     console.log(user)
//   } else {
//     console.log("error")
//   }

//   //userHelpers.doLogin()

//   //To view the product for admin user and It is the Home of admin user.
// })
router.get('/', function (req, res, next) {
  res.cookie('test-cookie','forfunandtesting',{maxAge:1000*60})

  //console.log(aduser)

  if(aduser.login){
    //console.log('testing time for fun')
    //console.log()
  

  productHelpers.getAllProduct().then((product) => {
    //console.log(product)
    // console.log("another test for admin use")
    // console.log(req.session.user)
    res.render('admin/view-products', { admin: true, product, user:req.session.user})
  })
}else{
  res.redirect('admin/adminlogin')
}
});
router.get('/add-products', function (req, res) {
  // console.log(aduser.login)
  if(aduser.login){
  res.render('admin/add-products', { admin: true })
  }else{
    res.redirect('adminlogin')
  }
})
router.post('/add-products', (req, res) => {
  // console.log(req.body)
  //console.log(req.files.Image)
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    // console.log(id)
    image.mv('./public/product_images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-products', { admin: true })
        console.log('no error on add-product page')


      }
      else {
        console.log(err)
      }
    })



  })



})
router.get('/delete/:id',(req,res)=>{
  let prodId=req.params.id
  productHelpers.deleteProduct(prodId).then((resp)=>{
    res.redirect('/admin/')
   //console.log(resp)
  })
  //console.log(prodId)
})
router.get('/edit-products/:id',(req,res)=>{
   prodI = req.params.id
  productHelpers.viewProduct(prodI).then((product)=>{
    //console.log(product)
    // console.log(prodId)
    res.render('admin/edit-products',{product,admin:true})
  })
})
router.post('/edit-products/',(req,res)=>{
  id=req.body.id
 
  // console.log('this is my id of the ower : ' + id)
  
   productHelpers.updateProduct(req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product_images/' + id + '.jpg')

    }
    
  })
})
router.get('/adminlogin',function (req, res){
  
  res.render('admin/logins',{admin:true})
})
router.post('/logins',(req, res)=>{
  
  userHelpers.doLogin(req.body).then((response)=>{
    //console.log(response)
    if(response.user.fname==='admin'){
      response.user.login=true;
       aduser=response.user
      res.redirect('/admin')
    
    }else{
     response.user.login=false;
     aduser=response.user
      console.log("else case logins")
      
      //console.log(response.user)
      res.redirect('adminlogin')
    }
    
  })
})
router.get('/viewusers',(req, res)=>{
 
  if(aduser.login){
    userHelpers.viewallusers(aduser.login).then((data)=>{
      // console.log('This is another tests for the day..')
      // console.log(data)
      // console.log("another pretty testing method..")
      res.render('admin/view-users',{admin:true,data})
      

    })
  
  }else{
    res.redirect('/admin')
  }
})
router.get('/edit-user/:id',(req,res)=>{
  
  prodId=req.params.id
  userHelpers.viewuser(prodId).then((user)=>{ 
    res.render('admin/edit-user',{admin:true,user})
  })
  
})
router.post('/edit-user',(req,res)=>{
  id=req.body.id
  //console.log(id)
  userHelpers.editUser(req.body).then(()=>{
    res.redirect('/admin/viewusers')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/user-images/' + id + '.jpg')
    }else{console.log('error')}
  })
})
router.get('/delete-user/:id',(req,res)=>{

  id=req.params.id
  //console.log(id)
  userHelpers.deleteUser(id).then(()=>{
    res.redirect('/admin/viewusers')
  })
})
aduser={login:false}
module.exports = router;
