import os
import json
import requests
import io
from PIL import Image

# Leonardo AI API Configuration
API_KEY = 'Your API_KEY'
DATASET_ID = 'Your DATASET_ID'
BASE_URL = "https://cloud.leonardo.ai/api/rest/v1"

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Bearer {API_KEY}"
}

def init_dataset_image_upload(dataset_id):
    """Initialize dataset image upload and get presigned URL"""
    init_url = f"{BASE_URL}/datasets/{dataset_id}/upload"
    
    payload = {"extension": "jpg"}
    
    response = requests.post(init_url, json=payload, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Init dataset image upload failed: {response.text}")
    
    upload_data = response.json()['uploadDatasetImage']
    
    return {
        'url': upload_data['url'],
        'fields': json.loads(upload_data['fields']),
        'image_id': upload_data['id']
    }

def upload_image_to_s3(presigned_url, fields, image_path):
    """Upload image to S3 using presigned URL"""
    with open(image_path, 'rb') as image_file:
        files = {'file': ('image.jpg', image_file, 'image/jpg')}
        
        upload_data = fields.copy()
        
        response = requests.post(presigned_url, data=upload_data, files=files)
        
        if response.status_code not in [200, 204]:
            raise Exception(f"S3 upload failed for {image_path}: {response.text}")
    
    return True

def upload_local_images(dataset_id, folder_path):
    """
    Upload all JPG images from a specified folder to Leonardo AI dataset
    
    :param dataset_id: Leonardo AI dataset ID
    :param folder_path: Path to folder containing images to upload
    :return: List of successfully uploaded image paths
    """
    # Find all JPG files in the specified folder
    image_files = [
        os.path.join(folder_path, f) 
        for f in os.listdir(folder_path) 
        if f.lower().endswith('.jpg')
    ]
    
    # Track successfully uploaded images
    uploaded_images = []
    
    # Upload each image
    for image_path in image_files:
        try:
            # Get a new presigned URL for each image
            upload_details = init_dataset_image_upload(dataset_id)
            
            # Upload the image
            upload_success = upload_image_to_s3(
                upload_details['url'], 
                upload_details['fields'], 
                image_path
            )
            
            if upload_success:
                print(f"Successfully uploaded: {image_path}")
                uploaded_images.append(image_path)
        
        except Exception as e:
            print(f"Failed to upload {image_path}: {e}")
    
    return uploaded_images

def main():
    # Specify the folder containing images to upload
    folder_path = '.'  # Current directory, change as needed
    
    try:
        # Perform bulk upload
        successful_uploads = upload_local_images(DATASET_ID, folder_path)
        
        print(f"\nUpload Summary:")
        print(f"Total images uploaded: {len(successful_uploads)}")
        print("Uploaded images:", successful_uploads)
    
    except Exception as e:
        print(f"An error occurred during bulk upload: {e}")

if __name__ == "__main__":
    main()