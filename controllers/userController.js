import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
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
                res.json({ message: 'Login successful', 
                    token: token,
                    user: {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        type: user.type,
                        profilePicture: user.profilePicture
                    }
                });
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

    export async function googleLogin(req, res) {
        const token = req.body.token

        //https://www.google.com/oauth2/v3/userinfo

        try {
            const response = await axios.get ('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const email = response.data.email
            //check if user with this email already exists
            const usersList= await User.find({ email: email })

            if(usersList.length > 0) {
                const userList= usersList[0]
                const token = jwt.sign({
                    email: userList.email,
                    firstName: userList.firstName,
                    lastName: userList.lastName,
                    isBlocked: userList.isBlocked,
                    type: userList.type,
                    profilePicture: userList.profilePicture
                 }, process.env.SECRET_KEY)
                
                 res.json({ message: 'Login successful', 
                    token: token,
                    user: {
                        email: userList.email,
                        firstName: userList.firstName,
                        lastName: userList.lastName,
                        type: userList.type,
                        profilePicture: userList.profilePicture
                    }
                });
            }

            else {
               const newUserData = {
        email: email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        type: "customer",
        password: "ffffff",
        profilePicture: response.data.picture
    };

    const user = new User(newUserData);

    user.save()
        .then(() => {
            res.json({
                message: "User created"
            });
        })
        .catch((error) => {
            res.json({
                message: "User not created"
            });
        });
            }
        }catch (error) {
            res.json({ message: "Google login failed" });
        }
    }

    export async function getUser(req,res) {
        if(req.user == null) {
            res.status(404).json({ message: 'Access denied. Please login to view user details.' });
            toast.error('Access denied. Please login to view user details.');
            return;
        }
        res.json(req.user);
        
    }