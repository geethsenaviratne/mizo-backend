import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function createUser (req, res){

   const newUserData = req.body

   //only an admin can create another admin user
   if (newUserData.type == "admin") {

    if(req.user == null || req.user.type != "admin") {
        res.json({ message: 'Please login as administrator to create an admin account' })
        return
    }
    }


   newUserData.password = bcrypt.hashSync(newUserData.password, 10); //hash the password before saving (10 - salt rounds for hashing)

    const user = new User(newUserData); //create new user document from request body (user information)

    user.save()  //save user document to database
    .then(() => {
        res.json({ message: 'User added successfully!' });
    })
    .catch((error) => {
        res.json({ message: 'Error adding user' });
    });
}


export function loginUser (req, res) {

    User.find({email : req.body.email})  //find user document matching the email in request body
    .then((userList) => {
        if (userList.length === 0) {
            res.json({ message: 'User not found' });
        }
        else {
            const user = userList[0];
            const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
            
            if (isPasswordValid) {

                //generate JWT token
                const token = jwt.sign({
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isBlocked: user.isBlocked,
                    type: user.type,
                    profilePicture: user.profilePicture
                 }, process.env.SECRET_KEY)
                
                 //send token as response to user
                res.json({ message: 'Login successful', token: token });
            } 
            
            else {
                res.json({ message: 'Invalid password' });
            }
        }
    })
    .catch((error) => {
        res.json({ message: 'Error logging in' });
    });

}


export function isAdmin (req) {

    //check if the logged-in user is an admin
    if(req.user==null) {
        return false
    }
    //check user type
    if(req.user.type != "admin") {
        return false
    }
    return true
}

export function isCustomer (req) {
    if(req.user==null) {
        return false
    }
    if(req.user.type != "customer") {
        return false
    }
    return true
}

    