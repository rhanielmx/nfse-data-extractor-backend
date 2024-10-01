import io
import sys
import base64
from pdf2image import convert_from_path
from PIL import Image

script_name = __file__.split('/')[-1]

def convert_pdf_to_base64_image(pdf_path):
  images = convert_from_path(pdf_path)
  image = images[0]
  buffered = io.BytesIO()
  image.save(buffered, format="JPEG")
  image_bytes = buffered.getvalue()
  base64_image = base64.b64encode(image_bytes).decode('utf-8')
 
  return base64_image

def main(file_path):
  try:
    base64_image = convert_pdf_to_base64_image(file_path)
    print(base64_image)
  except Exception as e:
    print(f'Error while converting pdf to image: {e}')

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print(f"Usage: python ${script_name} <file_path>")
    sys.exit(1)
  main(sys.argv[1])