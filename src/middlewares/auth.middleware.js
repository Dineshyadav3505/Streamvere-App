import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Convert the token to a string if it's not already
    if (typeof token !== "string") {
      token = token.toString();
    }

    const decodedToken = jwt.verify(token, "nahibGkbjS7dhgd4f3nvsd341na5hib6hdsfg78TXCFG9J9_sdfD074jgsd11fvGa2dklhbc");

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    throw new ApiError(401, error.message || "Invalid access token");
  }
});