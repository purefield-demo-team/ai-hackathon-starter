from huggingface_hub import hf_hub_url, HfApi
import requests
import boto3
import os
from urllib.parse import urlparse

# Fetch S3 client parameters from environment variables
endpoint_url = os.environ.get('ENDPOINT_URL')
aws_access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
signature_version = os.environ.get('SIGNATURE_VERSION', 's3v4')
verify_ssl = os.environ.get('VERIFY_SSL', 'False').lower() in ('true', '1', 't')

# Initialize S3 client
s3 = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    config=boto3.session.Config(signature_version=signature_version),
    verify=verify_ssl
)

# Model and S3 details
model_id = 'defog/llama-3-sqlcoder-8b'
bucket_name = os.environ.get('BUCKET_NAME', 'my-storage')
s3_prefix = os.environ.get('S3_PREFIX', 'models/llama-3-sqlcoder-8b/')

# Parse bucket_url from endpoint_url
parsed_url = urlparse(endpoint_url)
bucket_url = parsed_url.netloc

api = HfApi()
model_info = api.model_info(model_id)
file_names = [f.rfilename for f in model_info.siblings]

# Stream each file directly to S3
for file_name in file_names:
    file_url = hf_hub_url(repo_id=model_id, filename=file_name)
    response = requests.get(file_url, stream=True)
    response.raise_for_status()
    
    s3_key = os.path.join(s3_prefix, file_name)
    s3.upload_fileobj(response.raw, bucket_name, s3_key)
    print(f"Uploaded {file_name} to s3://{bucket_url}/{bucket_name}/{s3_key}")
