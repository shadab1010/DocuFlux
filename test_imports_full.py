try:
    print("Importing flask...")
    from flask import Flask
    print("Importing pypdf...")
    from pypdf import PdfReader
    print("Importing fitz (PyMuPDF)...")
    import fitz
    print("Importing pdf2docx...")
    from pdf2docx import Converter
    print("ALL IMPORTS SUCCESSFUL")
except Exception as e:
    print(f"FAIL: {e}")
    import traceback
    traceback.print_exc()
