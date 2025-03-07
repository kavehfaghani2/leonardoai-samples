const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_KEY = "<YOUR_API_KEY>";
const AUTHORIZATION = `Bearer ${API_KEY}`;

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: AUTHORIZATION,
};

const IMAGE_FILE_PATH = "image.jpeg";

async function uploadAndGenerateMotionVideo() {
  try {
    // Step 1: Get a presigned URL for uploading an image
    let url = "https://cloud.leonardo.ai/api/rest/v1/init-image";
    let payload = { extension: "jpg" };

    let response = await axios.post(url, payload, { headers: HEADERS });

    console.log("Presigned URL Response:", response.data);

    if (response.status !== 200) {
      throw new Error("Failed to get presigned URL");
    }

    let fields = JSON.parse(response.data.uploadInitImage.fields);
    let presignedUrl = response.data.uploadInitImage.url;
    let imageId = response.data.uploadInitImage.id;

    console.log("Presigned URL:", presignedUrl);
    console.log("Image ID:", imageId);

    // Step 2: Upload image via presigned URL
    let formData = new FormData();
    Object.keys(fields).forEach((key) => formData.append(key, fields[key]));
    formData.append("file", fs.createReadStream(IMAGE_FILE_PATH));

    response = await axios.post(presignedUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    console.log("Upload image via presigned URL:", response.status);

    if (response.status !== 204) {
      throw new Error("Failed to upload image");
    }

    // Step 3: Generate Motion Video with the Uploaded Image
    url = "https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd";

    payload = {
      imageId: imageId,
      isInitImage: true,
      motionStrength: 5, // Strength of motion effect
    };

    response = await axios.post(url, payload, { headers: HEADERS });
    console.log("Generate Video using Image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to create motion video request");
    }

    let generationId = response.data.motionSvdGenerationJob.generationId;
    console.log("Generation ID:", generationId);

    // Step 4: Wait and Get the Generated Video
    url = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;

    console.log("Waiting for video generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Generated Video Response:", response.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

// Run the function
uploadAndGenerateMotionVideo();