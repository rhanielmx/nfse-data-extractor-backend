import sys
import boto3
import base64

script_name = __file__.split('/')[-1]

def upload_file_to_s3_bucket(base64_image, output_name, bucket_name='malibru'):
  image_data = base64.b64decode(base64_image)

  s3_client = boto3.client('s3')
  s3_client.put_object(Bucket=bucket_name, Key=output_name, Body=image_data, ContentType='image/png')
  image_url = f"https://${bucket_name}.s3.us-east-2.amazonaws.com/${output_name}"

  return image_url

def main(*args):  
  base64, *rest = args
  output_name = rest[0] if rest else "now.png"

  image_url = upload_file_to_s3_bucket(base64, output_name)
  print(image_url)


if __name__ == "__main__":
  if len(sys.argv) < 2:
    print(f"Usage: python {script_name} <file_path>")
    sys.exit(1)
  main(*sys.argv[1:])