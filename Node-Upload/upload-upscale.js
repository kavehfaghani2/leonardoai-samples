const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_KEY = Your API-Key;
const AUTHORIZATION = `Bearer ${API_KEY}`;

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: AUTHORIZATION,
};

const IMAGE_FILE_PATH = "image.jpeg";

async function uploadImageAndUpscale() {
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

    // Step 3: Create upscale with Universal Upscaler
    url = "https://cloud.leonardo.ai/api/rest/v1/variations/universal-upscaler";

    payload = {
      ultraUpscaleStyle: "REALISTIC",
      creativityStrength: 5,
      detailContrast: 5,
      similarity: 5,
      upscaleMultiplier: 1.5,
      initImageId: imageId,
    };

    response = await axios.post(url, payload, { headers: HEADERS });

    console.log("Universal Upscaler Response:", response.data);

    if (response.status !== 200) {
      throw new Error("Failed to create upscale request");
    }

    let variationId = response.data.universalUpscaler.id;
    console.log("Variation ID:", variationId);

    // Step 4: Wait and get upscaled image via variation ID
    url = `https://cloud.leonardo.ai/api/rest/v1/variations/${variationId}`;

    console.log("Waiting for upscale to complete...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Upscaled Image Response:", response.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

uploadImageAndUpscale();