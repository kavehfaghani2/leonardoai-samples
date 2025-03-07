const axios = require("axios");

const API_KEY = "<YOUR_API_KEY>";
const AUTHORIZATION = `Bearer ${API_KEY}`;

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: AUTHORIZATION,
};

async function generateAndGuideImage() {
  try {
    // Step 1: Generate an Initial Image
    let url = "https://cloud.leonardo.ai/api/rest/v1/generations";
    let payload = {
      height: 512,
      modelId: "1e60896f-3c26-4296-8ecc-53e2afecc132", // Leonardo Diffusion XL
      prompt: "An oil painting of a cat",
      width: 512,
    };

    let response = await axios.post(url, payload, { headers: HEADERS });

    console.log("Generate initial image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to create initial image generation request");
    }

    let generationId = response.data.sdGenerationJob.generationId;
    console.log("Initial Generation ID:", generationId);

    // Step 2: Wait before fetching the generated image
    url = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;

    console.log("Waiting for initial image generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Retrieve initial generated image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to fetch initial generated image details");
    }

    let generatedImageId = response.data.generations_by_pk.generated_images[0].id;
    console.log("Selected Image ID for guidance:", generatedImageId);

    // Step 3: Generate a New Image Using the First Generated Image as a Guide
    url = "https://cloud.leonardo.ai/api/rest/v1/generations";
    payload = {
      height: 512,
      modelId: "1e60896f-3c26-4296-8ecc-53e2afecc132",
      prompt: "An oil painting of an orange cat",
      width: 512,
      init_generation_image_id: generatedImageId, // Use previously generated image
      init_strength: 0.5, // Must be between 0.1 and 0.9
    };

    response = await axios.post(url, payload, { headers: HEADERS });

    console.log("Generate guided image using previous image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to create guided image generation request");
    }

    let guidedGenerationId = response.data.sdGenerationJob.generationId;
    console.log("Guided Image Generation ID:", guidedGenerationId);

    // Step 4: Wait and Fetch the Guided Generated Image
    url = `https://cloud.leonardo.ai/api/rest/v1/generations/${guidedGenerationId}`;

    console.log("Waiting for guided image generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds

    response = await axios.get(url, { headers: HEADERS });

    console.log("Retrieve guided generated image:", response.status);

    if (response.status !== 200) {
      throw new Error("Failed to fetch guided generated image details");
    }

    console.log("Guided Image Details:", response.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

// Run the function
generateAndGuideImage();