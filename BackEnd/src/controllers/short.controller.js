import {Short} from '../models/short.model.js'
import mongoose, {isValidObjectId, set} from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllShort = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query
  const pipeline = [];

  if (userId) {
      pipeline.push({
          $match: {
              owner: mongoose.Types.ObjectId(userId)
          }
      });
  }

  
  if (query) {
      pipeline.push({
          $match: {
              $or: [
                  { title: { $regex: query, $options: 'i' } },
                  { description: { $regex: query, $options: 'i' } }
              ]
          }
      });
  }

  // Sort stage
  const sortField = sortBy || 'createdAt';
  const sortOrder = sortType === 'desc' ? -1 : 1;
  pipeline.push({
      $sort: {
          [sortField]: sortOrder
      }
  });


  // Apply aggregation pipeline and pagination
  const result = await Short.aggregate(pipeline);

  return res.status(200).json(new ApiResponse(200,result,"all find successfully"));
})

const PublicAShort = asyncHandler(async (req, res) => {
  const { description, title } = req.body;

  if (!description || !title) {
    throw new ApiError(400, "All fields are required");
  }

  const cloudinaryResponse = await uploadOnCloudinary(req.files?.shortFile[0]?.path);

  if (!cloudinaryResponse) {
    throw new ApiError(500, "Error while uploading short file");
  }

  const shortFileUrl = cloudinaryResponse.secure_url; // Extract the secure URL from the Cloudinary response

  const short = await Short.create({
    shortFile: shortFileUrl, // Save the URL instead of the entire Cloudinary response object
    owner: req.user?._id,
    title: title,
    description: description,
    isPublished: true,
  });

  const uploadedVideo = await Short.findById(short._id);

  if (!uploadedVideo) {
    throw new ApiError(500, "Something went wrong while uploading the short file");
  }

  return res.status(200).json(new ApiResponse(200, uploadedVideo, "Short file uploaded successfully"));
});

const getShortById = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video Id")
  }

  const video = await Short.aggregate([
      {
          $match: {
              _id: new mongoose.Types.ObjectId(videoId)
          }
      },
      {
          $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes"
          }
      },
      {
          $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
              pipeline: [
                  {
                      $project: {
                          content: 1,
                          owner: 1,
                          createdAt: 1
                      }
                  }
              ]
          }
      },
      {
          $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                  {
                      $project: {
                          username: 1,
                          avatar: 1,
                      }
                  }
              ]
          }
      },
      {
          $addFields: {
              likesCount: {
                  $size: "$likes"
              },
              commentsCount: {
                  $size: "$comments"
              }
          }
      },
      {
          $project: {
              videoFile: 1,
              title: 1,
              description: 1,
              views: 1,
              createdAt: 1,
              isPublished: 1,
              duration: 1,
              owner: 1,
              owner: 1,
              likesCount: 1,
              commentsCount: 1,
              comments: 1
          }
      }
  ])

  if (!video) {
      throw new ApiError(404, "video not found")
  }

  await Short.findByIdAndUpdate(
      videoId,
      {
          $inc: { views: 1 }
      }, { new: true }
  )
  // console.log(video);

  return res
      .status(200)
      .json(new ApiResponse(200, video, "Video find by Id is successfully"))
})

const updateShort = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  console.log(videoId)
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body
  // console.log(title,description)


  if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video Id");
  }

  const currentVideo = await Short.findById(videoId)

  if (currentVideo?.owner.toString() != req.user?._id) {
      throw new ApiError(401, "Only admin can update video details")
  }

  if (!title && !description ) {
      throw new ApiError(400, "Atleat one field pass to the update!..")
  }

  const updatedVideo = await Short.findByIdAndUpdate(videoId,
      {
          $set: {
              title,
              description,
          }
      }, { new: true }
  )

  if (!updatedVideo) {
      throw new ApiError(500, "Failed to update short, Please try later")
  }

  return res.status(200).json(
      new ApiResponse(200, { updatedVideo }, "Short update successfully")
  )
})

const deleteShort = asyncHandler(async (req, res) => {
  const { videoId } = req.params
    // console.log(videoId)
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const currentVideo = await Short.findById(videoId)

    if(currentVideo?.owner.toString()!=req.user?._id){
        throw new ApiError(401,"Only admin can delete video")
    }

    const deletedVideo=await Short.findByIdAndDelete(videoId)

   if(!deletedVideo){
    throw new ApiError(400, "Failed to delete the video please try again");
   }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedVideo,
            "Video deleted successfully"
        )
    )

})


export { 
  PublicAShort,
  getShortById,
  updateShort,
  deleteShort,
  getAllShort
}
