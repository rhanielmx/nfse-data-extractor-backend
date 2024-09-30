import sys

def main(file_path):
    try:
        # Open and read the uploaded file
        with open(file_path, 'rb') as f:
            content = f.read()
            print(f"Read {len(content)} bytes from {file_path}")
            # Add your processing logic here

    except FileNotFoundError:
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python your_script.py <file_path>")
        sys.exit(1)

    main(sys.argv[1])