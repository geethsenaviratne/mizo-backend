import Product from "../models/product.js";
import { isAdmin } from "./userController.js";
import mongoose from "mongoose";

export function createProduct (req, res) {

    //!isAdmin - check if the logged-in user is an admin (check not an admin)
    if (!isAdmin(req)) {
        res.json({ message: 'Access denied. Please login as administrator to add a product.' });
        return;
    }
    
    
    const newProductData = req.body;

    const product = new Product(newProductData); //create new product document from request body (product information)
    product.save()
    .then(() => {
        res.json({ message: 'Product added successfully!' });
    })
    .catch((error) => {
        res.status(403).json({ 
            message: error
        });
    });
}

export function getProducts (req, res) {

    Product.find()  
    .then((productList) => {
        res.json(productList); 
    })
    .catch((error) => {
        res.json({ message: 'Error fetching products' });
    }); 
}

export function deleteProduct (req, res) {

    //!isAdmin - check if the logged-in user is an admin (check not an admin)
    if (!isAdmin(req)) {
        res.status(403).json({ message: 'Access denied. Please login as administrator to delete a product.' });
        return;
    }

    // Accept productId from URL param or request body (fallback)
    const productId = req.params.productId || req.body?.productId;
    if (!productId) {
        res.status(400).json({ message: 'productId is required' });
        return;
    }

    Product.deleteOne({ productId: productId })
    .then((result) => {
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully!' });
    })
    .catch((error) => {
        res.status(500).json({ 
            message: error
        });
    });
}

export function updateProduct (req, res) {

    //!isAdmin - check if the logged-in user is an admin (check not an admin)
    if (!isAdmin(req)) {
        res.status(403).json({ message: 'Access denied. Please login as administrator to update a product.' });
        return;
    }

    const productId = req.params.productId;
    const updatedData = req.body;

    // FIX: Changed from 'product' (lowercase) to 'Product' (uppercase)
    Product.updateOne({ productId: productId }, updatedData)
    .then(() => {
      res.json({ message: 'Product updated successfully!' });
    })
    .catch((error) => {
        res.status(403).json({ 
            message: error.message || error
        });
    });
}