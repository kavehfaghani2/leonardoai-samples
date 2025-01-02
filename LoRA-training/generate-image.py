import requests

url = "https://cloud.leonardo.ai/api/rest/v1/generations"

payload = {
    "alchemy": True,
    "height": 768,
    "modelId": "b24e16ff-06e3-43eb-8d33-4416c2d75876",
    "num_images": 4,
    "presetStyle": "DYNAMIC",
    "prompt": "A dogstockphoto looking happily at the camera",
    "width": 1024,
    "userElements": [
        {
            "userLoraId": 1234,
            "weight": 2
        }
    ]
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": "Bearer YOU_API_KEY"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)