import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
      
    //   console.log(token);
      if (!token) {
          throw new ApiError(401, "Unauthorized request")
      }
  
      const decodedToken = jwt.verify(token, "OTUlsdf_GvbjbdfbHYgz_knfgk6fhHkjns244dHgdfkjhHsl23jfGl2sdfujnJ12ghdfJH0")
      // console.log(decodedToken);

  
      const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
  
      if (!user) {
          
          throw new ApiError(401, "Invalid Access Token")
      }

      req.user = user;
      next()
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token")
  }
  
})