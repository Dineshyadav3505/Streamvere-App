import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
  
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }
  
    const subscription = await Subscription.findOne({
      subscriber: req.user?._id,
      channel: channelId,
    });
  
    if (subscription) {
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(200).json(
        new ApiResponse(200, { subscribed: false }, "Channel unsubscribed successfully")
      );
    }
  
    await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
  
    return res.status(200).json(
      new ApiResponse(200, { subscribed: true }, "Channel subscribed successfully")
    );
  });
  

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
  
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }
  
    const subscribers = await Subscription.find({ channel: channelId }).populate(
      "subscriber",
      "username fullName avatar "
    );
  
    return res.status(200).json(
      new ApiResponse(200, subscribers, "Channel subscribers retrieved successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user?._id;
  
    const subscribedChannelsCount = await Subscription.countDocuments({ subscriber: subscriberId });
  
    return res.status(200).json(
      new ApiResponse(200, { count: subscribedChannelsCount }, "Subscribed channels count retrieved successfully")
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,

}