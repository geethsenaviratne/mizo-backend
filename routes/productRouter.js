import express from 'express';
import { createProduct, getProducts, deleteProduct, updateProduct } from '../controllers/productController.js';


const productRouter = express.Router();


productRouter.post("/", createProduct)
productRouter.get("/", getProducts)
// allow optional productId in URL so clients can also send productId in body as a fallback
productRouter.delete("/", deleteProduct)
productRouter.delete("/:productId", deleteProduct)
productRouter.put("/:productId", updateProduct)

export default productRouter;
