const axios = require("axios");

const API_KEY = "<YOUR_API_KEY>";
const AUTHORIZATION = `Bearer ${API_KEY}`;

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: AUTHORIZATION,
};

async function generateImage() {
  try {
    // Step 1: Send a request to generate an image
    let url = "https://cloud.leonardo.ai/api/rest/v1/generations";
    let payload = {
      height: 512,
      modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Model ID for the chosen model
      prompt: "An oil painting of a cat",
      width: 512,
    };

    let response = await axios.post(url, payload, { headers: HEADERS });

    console.log("Generate an image request:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to create image generation request");
    }

    let generationId = response.data.sdGenerationJob.generationId;
    console.log("Generation ID:", generationId);

    // Step 2: Wait before fetching the generated image
    url = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;

    console.log("Waiting for image generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Get generated image response:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to fetch generated image details");
    }

    console.log("Generated Image Details:", response.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

// Run the function
generateImage();