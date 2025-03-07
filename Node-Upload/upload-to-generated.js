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

async function uploadAndGenerate() {
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

    // Step 3: Generate Image to Image
    url = "https://cloud.leonardo.ai/api/rest/v1/generations";
    payload = {
      height: 512,
      modelId: "1e60896f-3c26-4296-8ecc-53e2afecc132", // Leonardo Diffusion XL
      prompt: "An oil painting of a cat",
      width: 512,
      init_image_id: imageId, // Use uploaded image ID
      init_strength: 0.5, // Must be between 0.1 and 0.9
    };

    response = await axios.post(url, payload, { headers: HEADERS });
    console.log("Generation of Images using Image to Image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to create generation request");
    }

    let generationId = response.data.sdGenerationJob.generationId;
    console.log("Generation ID:", generationId);

    // Step 4: Wait and get the generated images
    url = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;

    console.log("Waiting for image generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Generated Image Response:", response.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

uploadAndGenerate();