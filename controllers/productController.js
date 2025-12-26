import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

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
        res.json({ 
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


