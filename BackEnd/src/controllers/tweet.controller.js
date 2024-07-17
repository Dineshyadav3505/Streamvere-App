// import mongoose, { isValidObjectId } from "mongoose"
// import {Tweet} from "../models/tweet.model.js"
// import {ApiError} from "../utils/ApiError.js"
// import {ApiResponse} from "../utils/ApiResponse.js"
// import {asyncHandler} from "../utils/asyncHandler.js"

// const createTweet = asyncHandler(async (req, res) => {
//     //TODO: create tweet
//     const{ content} = req.body;
  
//     if (!content) {
//       throw new ApiError(400, "Content is required");
//     }
  
//     try {
//       const tweet = await Tweet.create({
//         content: content,
//         owner: req.user._id,
//       });

  
//       if (!tweet) {
//         throw new ApiError(500, "Failed to create tweet, Please try later");
//       }
  
//       return res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             tweet,
//             "Tweet created successfully"
//           )
//         );
//     } catch (error) {
//       throw new ApiError(500, error.message);
//     }
//   });

// const getUserTweets = asyncHandler(async (req, res) => {
//     // TODO: get user tweets
//     const tweet = await Tweet.aggregate([
//         {
//             $match:{
//                 _id: new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $lookup:{
//                 from: "users",
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "owner"
//             }

//         }

//     ])
//     if (!tweet?.length) {
//         throw new ApiError(404, "tweet  does not exist");
//       }
    
//       return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           user[0].tweet,
//           "User found successfully"
//         )
//       )
// })

// const updateTweet = asyncHandler(async (req, res) => {
//     //TODO: update tweet
//     const { tweetId } = req.params;
  
//     const content = req.body.content;
  
//     if (!isValidObjectId(tweetId)) {
//       throw new ApiError(400, "Invalid video Id")
//   }

  
//     const currentTweet = await Tweet.findById(id);
  
//     if (!currentTweet) {
//       throw new ApiError(404, "Tweet not found");
//     }
  
//     if (currentTweet.owner.toString() !== req.user._id.toString()) {
//       throw new ApiError(401, "Only the owner can update tweet");
//     }
  
//     if (!content) {
//       throw new ApiError(400, "Content is required");
//     }
  
//     const updatedTweet = await Tweet.findByIdAndUpdate(
//       tweetId,
//       {
//         $set: {
//           content,
//         },
//       },
//       { new: true }
//     );
  
//     if (!updatedTweet) {
//       throw new ApiError(500, "Failed to update tweet, Please try later");
//     }
  
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           updatedTweet,
//           "Tweet updated successfully"
//         )
//       );
//   });

// const deleteTweet = asyncHandler(async (req, res) => {
//     //TODO: delete tweet
//     const {tweetId} = req.params

//     if(!isValidObjectId(tweetId)){
//         throw new ApiError(400, "Invalid tweet Id")
//     }

//     const currentTweet = await Tweet.findById(tweetId)

//     if(currentTweet?.owner.toString()!=req.user?._id){
//         throw new ApiError(401,"Only admin can delete tweet")
//     }
//     const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
//     if(!deletedTweet){
//         throw new ApiError(400, "Failed to delete the tweet please try again");
//     }
//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             deletedTweet,
//             "Tweet deleted successfully"
//         )
//     )

// })

// export {
//     createTweet,
//     getUserTweets,
//     updateTweet,
//     deleteTweet
// }


import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  try {
    const tweet = await Tweet.create({
      content,
      owner: req.user._id,
    });

    if (!tweet) {
      throw new ApiError(500, "Failed to create tweet, Please try later");
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        tweet,
        "Tweet created successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
  ]);

  if (tweets.length === 0) {
    throw new ApiError(404, "No tweets found for the user");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      tweets,
      "User tweets retrieved successfully"
    )
  );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  const content = req.body.content;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id");
  }

  const currentTweet = await Tweet.findById(tweetId);

  if (!currentTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (currentTweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Failed to update tweet, Please try later");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedTweet,
      "Tweet updated successfully"
    )
  );
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id");
  }

  const currentTweet = await Tweet.findById(tweetId);

  if (!currentTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (currentTweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "Failed to delete the tweet, please try again");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      deletedTweet,
      "Tweet deleted successfully"
    )
  );
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};