import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js';
import orderRouter from './routes/orderRouter.js';


const app = express();
const mongoUrl = process.env.MONGO_DB_URL;
//enable CORS for all routes
app.use(cors()); 

mongoose.connect(mongoUrl,{})

const connection = mongoose.connection;

connection.once("open", () => {
    console.log('MongoDB database connection established successfully');
})

app.use(bodyParser.json()); //middleware to parse json body

//middleware to verify JWT token for protected routes
app.use((req, res, next) => {     
 
    const token = req.header('Authorization')?.replace('Bearer ', ''); //optional chaining operator (?.) - to avoid error if header is undefined
    console.log(token);

        
    if (token != null) {

        //decrypt the token (decode the payload) - decrypt means converting the encrypted data back to its original form
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

            if (!err) {

                //attach the decoded payload to the request object
                req.user = decoded; 
            }
        })
    }
    //next() - to pass the request to the next middleware/route handler
    next();
});

app.use('/api/products', productRouter); //use productRouter for /products route
app.use('/api/users', userRouter); //use userRouter for /users route
app.use('/api/orders', orderRouter); //use orderRouter for /orders route


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
