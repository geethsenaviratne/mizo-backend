import Order from "../models/order.js";
import { isCustomer } from "./userController.js";
import Product from "../models/product.js";


export async function createOrder (req, res) {

    if(!isCustomer) {
        res.json({ message: 'Access denied. Please login as customer to add an order.' });
        return;
    }

    try {
        // date: -1 means sort in descending order (latest first)
        //limit(1) means take only one document
        const latestOrder = await Order.find().sort({ 
            date: -1 }).limit(1);

        let orderId

        if(latestOrder.length == 0) {
            orderId = "CBC0001"
        }
        else {
            const currentOrderId = latestOrder[0].orderId; //get the latest order id
            const numberString = currentOrderId.replace('CBC', ''); //remove the 'CBC' prefix   
            
            //convert the remaining string to number
            const number = parseInt(numberString); 
            
            //increment the number by 1 and pad with leading zeros to make it 4 digits
            const newNumber = (number + 1).toString().padStart(4, '0'); 

           //create the new order id by adding the 'CBC' prefix
            orderId = "CBC" + newNumber
            
        }

        
        const newOrderData = req.body

        const newProductArray = []

        for (let i=0; i < newOrderData.orderdItems.length; i++) {

           const product = await Product.findOne({
                productId : newOrderData.orderdItems[i].productId
            })

        if(product == null) {
            res.json({ message: `Product with ID ${newOrderData.orderdItems[i].productId} not found` })
            return;
        }

        newProductArray[i] = {
            productId : product.productId,
            name : product.productName,
            price : product.price,
            quantity : newOrderData.orderdItems[i].quantity,
            image : product.images[0]
        }

    }

    console.log(newProductArray)

    newOrderData.orderdItems = newProductArray


        //set the new order id and user email
    newOrderData.orderId = orderId 
    newOrderData.email = req.user.email

        //create new order document from request body (order information)
    const order = new Order(newOrderData); 
    await order.save();

    res.json ({message: "Order Created"})
        

    }
    catch (error) {
        res.status(500).json({ 
            message: error.message });
    }

}


export async function getOrders (req, res) {

    try {
        const orderList = await Order.find({ email: req.user.email });  
        res.json(orderList); 
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}