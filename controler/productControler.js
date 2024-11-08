const Product=require("../modules/Products")
const Firm=require("../modules/firm_modules")
const multer=require("multer")
const path=require("path")


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/")
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage });

const addProduct=async(req,res)=>{
    try{
        const {productName,price,category,bestSeller,description}=req.body
        const image=req.file?req.file.filename:undefined
        const firmid=req.params.firmid
        const firm=await Firm.findById(firmid)
        if(!firm){
            return res.status(404).json({error:"No firm found"})
        }
        const product=new Product({
            productName,price,category,bestSeller,description,image,firm:firm._id
        })
        const savedProduct=await product.save()
        firm.products.push(savedProduct)
        await firm.save()
        res.status(200).json({savedProduct})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:"error in productscontroler"})
    }
}
const getProductByFirm=async (req,res)=>{
    try{
        const firmId=req.params.firmId
        const firm=await Firm.findById(firmId)
        if(!firm){
            return res.status(404).json({errorr:"No firm found"})
        }
        const restaurentName=firm.firmName
        const products=await Product.find({firm:firmId})
        res.status(200).json({restaurentName,products})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:"error in product to firm"})
    }
}
const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "No product found to delete" });
        }

        // Send success response
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProductById:", error);
        res.status(500).json({ error: "Error in deleteProductById" });
    }
};

module.exports={addProduct:[upload.single("image"),addProduct],getProductByFirm,deleteProductById}