import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userScheema = new Schema ({

    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, // cloudinary url 
        require:true 
    },
    coverImage:{
        type: String, // cloudinary url  
        require:true
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        maxlength: [20,"Password must be at  most 20 characters"]
    },
    refreshToken : {
        type: String,
    }

}, {timestamps: true});



                  /// bcrypt ///
////////////////////////////////////////////////////////
userScheema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
})

userScheema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}


                  /// JSONTOKEN ///
////////////////////////////////////////////////////////
userScheema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        }, process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        }
    )
}

userScheema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
    {
        id: this._id,

    }, process.env.REFRESH_TOKEN_SECRET, 
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
    }
    )
}

  
export const user = mongoose.model("User" , userScheema)