try:
    from pdf2docx import Converter
    print("pdf2docx imported successfully")
except Exception as e:
    print(f"Error importing pdf2docx: {e}")
    import traceback
    traceback.print_exc()
