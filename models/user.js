
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    
    email: {
        type : String,
        required : true, //not can be empty
        unique : true 
    },

    firstName : {
        type : String,
        required : true
    },

    lastName: {
        type : String,
        required : true
    },

    password: {
        type : String,
        required : true
    },

    isBlocked: {   
        type : Boolean,
        default : false
    },

    type: {
        type : String,
        default : 'customer',
    },

    profilePicture: {
        type : String,
        default : 'https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg'
    }
});

const User = mongoose.model('Users', userSchema);

export default User;