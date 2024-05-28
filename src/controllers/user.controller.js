import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
  path: "./.env"
});


///// generateAccessAndRefreshToken
const generateAccessAndRefreshToken = async (userId) => {
  try {

      const user = await User.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const refreshToken = await user.generateRefreshToken();
      const  accessToken = await user.generateAccessToken();

      user.refreshToken = refreshToken;

      try {
        await user.save({ validateBeforeSave: false });
      } catch (error) {
        console.error("Error while saving user:", error);
        throw new ApiError(500, "Something went wrong while saving the refresh token.");
      }

      // console.log("Tokens generated successfully");
      return { accessToken, refreshToken };
  } catch (error) {
      console.error("Error in generateAccessAndRefreshToken:", error);
      throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

/// Registeration 
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file path is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);


  const user = await User.create({
    fullName,
    avatar: avatar?.url ||  "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

/// loginUser 
const loginUser = asyncHandler(async (req , res)=>{
  const { email, username, password } = req.body;
  
  if(!(username || email)){
    throw new ApiError(400,"enter email id and username")
  }
  
  const user = await User.findOne({
    $or: [ {username} , {email} ]
  })

  if(!user){
    throw new ApiError(404, " user does not exist")
  }

  const passwordcheck = await user.matchPassword(password)

  if(!passwordcheck){
    throw new ApiError(401,"Invalid user credentials")
  }


  const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
  // console.log(accessToken);

  const LoggedInUser = await User.findById(user._id).select("-password -refreshToken" )

  const option = {
    httpOnly: true,
    secure:true
  }
  console.log("logged in user successfully")

  
  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(
    new ApiResponse(
      200,
      {
        user : LoggedInUser, accessToken, refreshToken
      },
      "User logged In Successfully"
    )
  )


})

/// logoutUser 
const logoutUser = asyncHandler (async(req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
      
    },
    {
      new: true
    }
  )

  const option= {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken", option )
  .clearCookie("refreshToken", option)
  .json(
    new ApiResponse(
      200,
      {},
      "User logOut Successfully"
    )
  )
})  

// refreshAccessToken 
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//changeCurrentPassword
const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const { currentPassword, newPassword, confirmpassword } = req.body;

  if (!currentPassword ||!newPassword ||!confirmpassword) {
    throw new ApiError(400, "All fields are required");
  }

  if(!(newPassword === confirmpassword)){
    throw new ApiError(400, "New password and confirm password does not match")
  }

  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordCheck = await user.matchPassword(currentPassword);

  if (!passwordCheck) {
    throw new ApiError(401, "Invalid current password");
  }

  user.password =  newPassword;

  await user.save({ validateBeforeSave: false});

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Password changed successfully"
    )
  );
})

// getCurrenUser
const getCurrentUser = asyncHandler(async (req, res, _) => {
  
  return res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "Current user found successfully"
    )
  );
})

//UpdateAccountDetails 
const updateAccountDetais = asyncHandler(async (req, res,) =>{
  const {email, fullName} = req.body

  if(!email || !fullName) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set:{
        email: email, 
        fullName: fullName
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json( new ApiResponse(200, user, "Account updated successfully"))


})

//updateAvatarImage
const updateAvatarImage = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { avatar: avatar.url } },
    { new: true, select: "-password" }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

//update Cover Image 
const updateCoverImage = asyncHandler(async (req, res) =>{
  const coverImageLocalPath = req.file?.coverImage[0]?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(500, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id, 
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json( new ApiResponse(200, user, "Cover Image updated successfully"))
})

//get user channel Profile
const getUserChannelProfile = asyncHandler(async (req, res)=>{
  const {username} = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match:{
        username: username.toLowerCase()
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber"
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
           $size:"$subscriber"
        },
        channelsSubscribedTo:{
          $size:"$subscribedTo"
        },
        isSubscriber: {
          if:{$in: [req.user?.id, "$subscriber.subscriber"]},
            then: true,
            else: false
        }
      }
    },
    {
      $project:{
        fullName: 1,
        username: 1,
        coverImage: 1,
        avatar: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscriber: 1
      }

    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      channel[0],
      "Channel profile found successfully"
    )
  )

})

//get watcher history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id) 
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",pipeline:[
                {
                  $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
    
  ])
  
  if (!user?.length) {
    throw new ApiError(404, "User does not exist");
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history found successfully"
    )
  )
})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetais,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
 
