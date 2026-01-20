import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
import nodemailer from 'nodemailer';
import OTP from '../models/otpModel.js';
import getDesignedEmail from '../lib/emailTemplates.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
});

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
            if (user.isBlocked) {
    res.json({ message: 'Your account is blocked. Please contact support.' });
    return;
}
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
    const token = req.body.token;

    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const email = response.data.email;
        // Check if user with this email already exists
        const usersList = await User.find({ email: email });

        if (usersList.length > 0) {
            const user = usersList[0];
            if (user.isBlocked) {
                res.json({ message: 'Your account is blocked. Please contact support.' });
                return;
            }
            const jwtToken = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isBlocked: user.isBlocked,
                type: user.type,
                profilePicture: user.profilePicture
            }, process.env.SECRET_KEY);

            res.json({
                message: 'Login successful',
                token: jwtToken,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    type: user.type,
                    profilePicture: user.profilePicture
                }
            });
        } else {
            // Create new user
            const newUserData = {
                email: email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                type: "customer",
                password: "ffffff", // You may want to generate a random password
                profilePicture: response.data.picture
            };

            const user = new User(newUserData);

            await user.save();

            // Generate JWT for new user
            const jwtToken = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isBlocked: user.isBlocked,
                type: user.type,
                profilePicture: user.profilePicture
            }, process.env.SECRET_KEY);

            res.json({
                message: "User created successfully",
                token: jwtToken,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    type: user.type,
                    profilePicture: user.profilePicture
                }
            });
        }
    } catch (error) {
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

    export async function getAllUsers(req,res) {
        if(!isAdmin(req)) {
            res.status(403).json({ message: 'Access denied. Please login as administrator to view all users.' });
            return;
        }

        try {
            const userList = await User.find();
            res.json(userList);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving users' });
        }
    }

    export async function blockUser(req,res) {
        if(!isAdmin(req)) {
            res.status(403).json({ message: 'Access denied. Please login as administrator to block a user.' });
            return;
        }
        if(req.user.email === req.params.email) {
            res.status(400).json({ message: 'You cannot block your own account.' });
            return;
        }

        try{
            await User.updateOne({ email: req.params.email }, { isBlocked: req.body.isBlocked });
            res.json({ message: 'User blocked successfully.' });
        }
        catch(error) {
            res.status(500).json({ message: 'Error blocking user.' });
        }
    }

    export async function sendOTP(req, res) {
        const email = req.params.email;
        if(email == null) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000); //generate 6-digit OTP

        try {
            //send OTP to user's email
            await OTP.deleteMany({ email: email }); //delete any existing OTPs for this email
            const newOTP = new OTP({ email: email, otp: otpCode });
            await newOTP.save();

            await transporter.sendMail({
        from: `"MIZO BEAUTY" <${process.env.EMAIL}>`,
        to: email,
        subject: "Your One-Time Password (OTP)",
        html: getDesignedEmail({
        otp: otpCode,
        purpose: "Secure Login Verification",
        validityMinutes: 10
    })
});

            res.json({ message: 'OTP sent successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
            return;
        }
    }        

export async function changePasswordViaOTP(req, res) {
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const otp = req.body.otp;
    try {
    const otpRecord = await OTP.findOne({ email: email, otp: otp });

    if(otpRecord == null) {
        res.status(400).json({ message: 'Invalid OTP' });
        return;
    }

    await OTP.deleteMany({ email: email }); //delete OTPs after successful verification

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    
        await User.updateOne({ email: email }, { password: hashedPassword });
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password' });
    }
}