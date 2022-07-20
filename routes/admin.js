var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');


/* GET users listing. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProduct().then((product)=>{
    //console.log(product)
    res.render('admin/view-products',{admin:true,product})
  })
  
});
router.get('/add-products',function(req,res){
  res.render('admin/add-products',{admin:true})
})
router.post('/add-products',(req,res)=>{
 // console.log(req.body)
  //console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product_images/'+id+'.jpg',(err,done)=>{
      if(!err) {
        res.render('admin/add-products',{admin:true})
        

      }
      else{
        console.log(err)
      }
    })
    
  
 
  })
 
  

})
module.exports = router;
