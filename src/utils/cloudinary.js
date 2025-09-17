import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // file system helps handle file read, write etc
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// getImagePublicId function right now only works if image on cloudinary are store in default root folder (uploads) and not in any nested folder
const getImagePublicId = (imageUrl) => {
  const UrlArray = imageUrl.split("/");
  const image = UrlArray[UrlArray.length - 1];
  const publicId = image.split(".")[0];
  return publicId;
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally save temporary file as the upload operation got fail
    return null;
  }
};

const deleteFromCloudinary = async (uploadedUrl, resource_type = "image") => {
  try {
    // finding public id of the image to be deleted
    const public_id = getImagePublicId(uploadedUrl);

    const options = { resource_type, invalidate: true };

    // deleting the image from cloudinary
    const result = await cloudinary.uploader.destroy(public_id, options);

    if (result.result !== "ok") {
      throw new ApiError(400, "Failed to delete image from Cloudinary");
    }
    return result;
  } catch (error) {
    throw new ApiError(
      400,
      "Something went weong while deleting from cloudinary"
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
