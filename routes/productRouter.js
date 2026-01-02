import express from 'express';
import { createProduct, getProducts, deleteProduct } from '../controllers/productController.js';


const productRouter = express.Router();


productRouter.post("/", createProduct)
productRouter.get("/", getProducts)
// allow optional productId in URL so clients can also send productId in body as a fallback
productRouter.delete("/:productId?", deleteProduct)

export default productRouter;
