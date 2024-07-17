import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video Id");
    }
  
    const comments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
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
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likedBy",
        },
      },
      {
        $addFields: {
          likesCount: {
            $size: "$likedBy",
          },
          owner: {
            $first: "$owner",
          },
          isLiked: {
            $cond: {
              if: {
                $in: [new mongoose.Types.ObjectId(req.user?._id), "$likedBy.likedBy"],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          owner: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
          likesCount: 1,
          isLiked: 1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);
  
    return res.status(200).json(
      new ApiResponse(200, comments, "Comments retrieved successfully")
    );
  });

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video Id");
    }
  
    const { content } = req.body;
  
    if (!content) {
      throw new ApiError(400, "Comment content is required");
    }
  
    const newComment = await Comment.create({
      video: videoId,
      owner: req.user?._id,
      content: content, // Add the content property to the newComment object
    });
  
    if (!newComment) {
      throw new ApiError(500, "Failed to add comment, Please try later");
    }
  
    return res.status(200).json(
      new ApiResponse(200, newComment, "Comment added successfully")
    );
});

const addCommentOnShort = asyncHandler(async (req, res) => {
  const { shortId } = req.params;

  if (!isValidObjectId(shortId)) {
    throw new ApiError(400, "Invalid short Id");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  const newComment = await Comment.create({
    short: shortId,
    owner: req.user?._id,
    content,
  });

  return res.status(200).json(new ApiResponse(200, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
  
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment Id");
    }
  
    const currentComment = await Comment.findById(commentId);
  
    if (!currentComment) {
      throw new ApiError(404, "Comment not found");
    }
  
    if (currentComment.owner !== req.user?._id()) {
      throw new ApiError(401, "You are not authorized to update this comment");
    }
  
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      {
        new: true,
      }
    );
  
    if (!updatedComment) {
      throw new ApiError(500, "Failed to update comment, Please try later");
    }
  
    return res.status(200).json(
      new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }
    const currentComment = await Comment.findById(commentId)

    if (!currentComment) {
        throw new ApiError(404, "Comment not found")
    }

    if (currentComment.owner!== req.user?._id()) {
        throw new ApiError(401, "You are not authorized to delete this comment")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(400, "Failed to delete the comment please try again")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    addCommentOnShort,
    updateComment,
    deleteComment
}