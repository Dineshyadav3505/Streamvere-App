import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv"

dotenv.config({
  path: "./.env"
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    
    if (!localFilePath) return null;
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });
    
    // File has been uploaded successfully
    console.log('File uploaded to Cloudinary:', response.url);
    
    // Remove the local file
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.error('Error uploading file:', error);
    // Remove the local file
    fs.unlinkSync(localFilePath);
    
    return null;
  }
};

export { uploadOnCloudinary };