import sys
import os
import fitz
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Create a sample PDF first
def create_sample_pdf(pdf_path):
    c = canvas.Canvas(pdf_path, pagesize=letter)
    
    # Heading
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, 750, "1. Aim/Overview of the practical")
    
    # Bullet list
    c.setFont("Helvetica", 12)
    c.drawString(60, 720, "• First bullet point")
    c.drawString(60, 700, "- Second bullet point")
    
    # Code block
    c.setFont("Courier", 10)
    c.drawString(50, 650, "def hello_world():")
    c.drawString(50, 635, "    print('Hello World')")
    c.drawString(50, 620, "    return True")
    
    # Multi-columns
    c.setFont("Helvetica", 12)
    c.drawString(50, 550, "Student Name: John Doe")
    c.drawString(300, 550, "UID: 12345678")
    
    c.drawString(50, 520, "Major: Computer Science")
    c.drawString(300, 520, "Year: Senior")
    
    c.save()

def main():
    test_pdf = "test_reconstruction_sample.pdf"
    output_docx = "test_reconstruction_output.docx"
    
    print(f"Generating test PDF: {test_pdf}")
    create_sample_pdf(test_pdf)
    
    print("Testing extraction...")
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from document_reconstruction import DocumentReconstructionEngine
    
    engine = DocumentReconstructionEngine(test_pdf)
    success, result = engine.convert(output_docx)
    
    if success:
        print(f"Success! Saved to {result}")
    else:
        print(f"Failed: {result}")

if __name__ == "__main__":
    main()
