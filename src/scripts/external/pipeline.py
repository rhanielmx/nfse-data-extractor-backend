import sys

from convert_pdf_to_base64_image import convert_pdf_to_base64_image
from upload_file_to_s3_bucket import upload_file_to_s3_bucket

script_name = __file__.split('/')[-1]

def main(file_path):
  output_name = file_path.split('/')[-1].replace('pdf', 'png')
  try:
    base64_image = convert_pdf_to_base64_image(file_path)
    image_url = upload_file_to_s3_bucket(base64_image, output_name)
    print(image_url)
  except Exception as e:
    print(f'Error while converting pdf to image: {e}')

if __name__ == "__main__":
  if len(sys.argv) < 2:
    print(f"Usage: python {script_name} <file_path>")
    sys.exit(1)
  main(sys.argv[1])