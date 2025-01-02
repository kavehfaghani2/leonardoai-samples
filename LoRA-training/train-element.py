import requests

url = "https://cloud.leonardo.ai/api/rest/v1/elements"

payload = {
    "name": "dog-stock-photos",
    "instance_prompt": "a dog",
    "lora_focus": "General",
    "train_text_encoder": True,
    "resolution": 1024,
    "sd_version": "SDXL_1_0",
    "num_train_epochs": 100,
    "learning_rate": 0.000001,
    "description": "Stock photos of a small dog against pastel backgrounds",
    "datasetId": "YOU_DATASET_ID"
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": "Bearer YOU_API_KEY"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)