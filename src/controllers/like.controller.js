import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id")
    }

    const likedVideo=await Like.findOne({
        video:videoId,
        likedBy:req.user?._id
    })

    if(likedVideo){
        await Like.findByIdAndDelete(likedVideo?._id)

        return res.status(200)
        .json(new ApiResponse(200,{},"Video unliked successfully"))
    }

    const videoLiked=await Like.create({
        video:videoId,
        likedBy:req.user?._id
    })

    return res.status(200)
    .json(new ApiResponse(200,videoLiked,"Video liked successfully"));
    //TODO: toggle like on video
})

const toggleShortLike = asyncHandler(async (req, res) => {
    const { shortId } = req.params;
  
    if (!isValidObjectId(shortId)) {
      throw new ApiError(400, "Invalid short Id");
    }
  
    const like = await Like.findOne({
      short: shortId,
      likedBy: req.user?._id,
    });
  
    if (like) {
      await like.deleteOne();
      return res.status(200).json(new ApiResponse(200, null, "Short unliked successfully"));
    }
  
    const newLike = await Like.create({
      short: shortId,
      likedBy: req.user?._id,
    });
  
    return res.status(200).json(new ApiResponse(200, newLike, "Short liked successfully"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    // if(!isValidObjectId(commentId)){
    //     throw new ApiError(400, "Invalid Comment Id")
    // }

    const likedComment=await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })

    if(likedComment){
        await Like.findByIdAndDelete(likedComment._id)

        return res.status(200)
        .json(new ApiResponse(200,{},"Comment unliked successfully"))
    }

    const commentLiked=await Like.create({
        comment:commentId,
        likedBy:req.user?._id
    })

    return res.status(200)
    .json(new ApiResponse(200,commentLiked,"Comment liked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid video Id")
    }

    const likedVideo=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    if(likedVideo){
        await Like.findByIdAndDelete(likedVideo?._id)

        return res.status(200)
        .json(new ApiResponse(200,{},"Video unliked successfully"))
    }

    const tweetLiked=await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    return res.status(200)
    .json(new ApiResponse(200,tweetLiked,"Video liked successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner"
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                videoCount:{
                    $size:"$videos"
                }
            }
        }
    ])

    console.log(likedVideos)
    
    return res.status(200).json(new ApiResponse(200,likedVideos,"All liked video here!"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleShortLike,
    toggleVideoLike,
    getLikedVideos
}