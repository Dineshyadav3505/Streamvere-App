import mongoose, {Schema} from "mongoose";

const shortSchema = new Schema(
    {
        shortFile:{
            type: String, // cloudinary url
            required: true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        title:{
            type: String,  
            required: true
        },
        description:{
            type: String,
            required: true
        },
        isPublished:{
            type: Boolean,
            default: true,
        }
    },
    {timestamps:true}
)

export const Short = mongoose.model('Short', shortSchema);