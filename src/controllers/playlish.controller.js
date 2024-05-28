import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body
    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError (400, "user not found")
    }

    if (!name ||!description) {
        throw new ApiError(400, "Name and description are required")
    }


    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
        videos: []
    })

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist, Please try later")
    }

    const createdPlaylist = await Playlist.findById(playlist._id)

    if (!createdPlaylist) {
        throw new ApiError(500, "Failed to create playlist, Please try later")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            createdPlaylist,
            "Playlist created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const userPlaylists = await Playlist.find({
        owner: userId
    })

    if (!userPlaylists) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            userPlaylists,
            "Playlist found successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    const currentPlaylist = await Playlist.findById(playlistId)

    if (!currentPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            currentPlaylist,
            "Playlist found successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Check if the playlistId is a valid ObjectId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id");
    }

    // Find the playlist by playlistId
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the videoId is a valid ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id");
    }

    // Check if the video is already in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist");
    }

    // Add the videoId to the playlist
    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video added to playlist successfully"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
  
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid playlist or video Id");
    }
  
    const playlist = await Playlist.findById(playlistId);
  
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
  
    if (!playlist.videos.includes(videoId)) {
      throw new ApiError(404, "Video not found in the playlist");
    }
  
    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
  
    await playlist.save();
  
    return res.status(200).json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
  });


const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    const currentPlaylist = await Playlist.findById(playlistId)

    if (!currentPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (currentPlaylist?.owner.toString()!= req.user?._id) {
        throw new ApiError(401, "Only admin can delete playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(400, "Failed to delete the playlist please try again");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted successfully"
        )
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }
    const currentPlaylist = await Playlist.findById(playlistId)
    if (!currentPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (currentPlaylist?.owner.toString()!= req.user?._id) {
        throw new ApiError(401, "Only admin can update playlist details")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist, Please try later")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}