var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


/* GET users listing. */

router.get('/admin', (req, res, next) => {
  let user = req.session
  if (user === 'admin') {
    console.log(user)
  } else {
    console.log("error")
  }

  //userHelpers.doLogin()
})
router.get('/', function (req, res, next) {

  productHelpers.getAllProduct().then((product) => {
    //console.log(product)
    res.render('admin/view-products', { admin: true, product })
  })

});
router.get('/add-products', function (req, res) {
  res.render('admin/add-products', { admin: true })
})
router.post('/add-products', (req, res) => {
  // console.log(req.body)
  //console.log(req.files.Image)
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product_images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-products', { admin: true })


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
    console.log(resp)
  })
  //console.log(prodId)
})
module.exports = router;
