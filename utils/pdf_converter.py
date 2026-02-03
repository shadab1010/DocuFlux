"""
PDF conversion utilities
"""
import os
import uuid
from zipfile import ZipFile
import fitz
from pypdf import PdfReader, PdfWriter
from pdf2docx.converter import Converter
from openpyxl import Workbook
import pdfplumber
import io
from docx import Document
from docx.shared import Inches


def merge_pdfs(pdf_files, output_path):
    """Merge multiple PDF files into one"""
    try:
        writer = PdfWriter()
        
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                # Verify we can read the pages
                if len(reader.pages) == 0:
                     return False, f"File appears empty (0 pages): {os.path.basename(pdf_file)}"
                
                for page in reader.pages:
                    writer.add_page(page)
            except Exception as e:
                return False, f"Error processing {os.path.basename(pdf_file)}: {str(e)}"
        
        with open(output_path, "wb") as f:
            writer.write(f)
        
        return True, output_path
    except Exception as e:
        return False, f"Merge failed: {str(e)}"


def split_pdf(pdf_path, page_ranges, output_folder):
    """Split PDF by page ranges"""
    try:
        reader = PdfReader(pdf_path)
        output_files = []
        
        for idx, page_range in enumerate(page_ranges):
            writer = PdfWriter()
            start, end = page_range
            
            for page_num in range(start - 1, end):
                if page_num < len(reader.pages):
                    writer.add_page(reader.pages[page_num])
            
            output_file = os.path.join(output_folder, f"split_{idx + 1}.pdf")
            with open(output_file, "wb") as f:
                writer.write(f)
            output_files.append(output_file)
        
        return True, output_files
    except Exception as e:
        return False, str(e)


def compress_pdf(pdf_path, output_path):
    """Compress PDF by reducing page quality"""
    try:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
        
        with open(output_path, "wb") as f:
            writer.write(f)
        
        return True, output_path
    except Exception as e:
        return False, str(e)



def pdf_to_word_as_images(pdf_path, output_path):
    """Fallback: Convert PDF pages to images and insert into Word"""
    try:
        doc = Document()
        pdf_doc = fitz.open(pdf_path)
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better quality
            img_data = pix.tobytes("png")
            
            # Add image to Word doc
            img_stream = io.BytesIO(img_data)
            doc.add_picture(img_stream, width=Inches(6))
            
            if page_num < len(pdf_doc) - 1:
                doc.add_page_break()
                
        doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def pdf_to_images(pdf_path, output_folder, image_format="png"):
    """Convert PDF pages to images"""
    try:
        pdf_doc = fitz.open(pdf_path)
        images = []
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            
            file_id = uuid.uuid4().hex
            img_path = os.path.join(output_folder, f"page_{file_id}_{page_num}.{image_format}")
            pix.save(img_path)
            images.append(img_path)
        
        pdf_doc.close()
        return True, images
    except Exception as e:
        return False, str(e)


def pdf_to_word(pdf_path, output_path):
    """Convert PDF to Word document with robust fallback"""
    try:
        # Pre-validate PDF
        try:
            with fitz.open(pdf_path) as doc:
                if doc.page_count < 1:
                    return False, "PDF is empty (0 pages)."
        except Exception as e:
            return False, f"Invalid PDF file: {str(e)}"

        # Attempt 1: pdf2docx (Best for native PDFs)
        try:
            converter = Converter(pdf_path)
            converter.convert(output_path, start=0, end=None)
            converter.close()
            # Double check output
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                 return True, output_path
        except Exception as e:
            print(f"pdf2docx failed: {e}. Attempting fallback...")
        
        # Attempt 2: LibreOffice Fallback (Best for scanned/complex PDFs)
        try:
            # Dynamic import to handle path differences
            try:
                from libreoffice_converter import LibreOfficeConverter
            except ImportError:
                # Try relative import if in package
                import sys
                sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                from libreoffice_converter import LibreOfficeConverter

            if LibreOfficeConverter.is_available():
                success = LibreOfficeConverter.convert(pdf_path, output_path, output_format="docx")
                if success:
                    return True, output_path
            
            # Attempt 3: Image-based wrapper (Final fallback for scans)
            print("LibreOffice unavailable/failed. Falling back to Image-Wrapper...")
            success, result = pdf_to_word_as_images(pdf_path, output_path)
            if success:
                return True, result
            
            return False, "All conversion methods failed (pdf2docx, LibreOffice, Image-Wrapper)."
                
        except Exception as fallback_error:
            return False, f"All conversion methods failed. Error: {str(fallback_error)}"

    except Exception as e:
        # Catch-all for top level errors
        return False, f"Conversion error: {str(e)}"


def pdf_to_excel(pdf_path, output_path):
    """Extract tables from PDF and convert to Excel"""
    try:
        workbook = Workbook()
        workbook.remove(workbook.active)
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                
                if tables:
                    for table_idx, table in enumerate(tables):
                        ws = workbook.create_sheet(title=f"Page_{page_num + 1}_Table_{table_idx + 1}")
                        for row_idx, row in enumerate(table):
                            for col_idx, cell in enumerate(row):
                                ws.cell(row=row_idx + 1, column=col_idx + 1, value=cell)
        
        # Remove empty sheet if created
        if len(workbook.sheetnames) == 0:
            ws = workbook.create_sheet("Sheet1")
        
        workbook.save(output_path)
        return True, output_path
    except Exception as e:
        return False, str(e)


def pdf_to_jpg(pdf_path, output_folder):
    """Convert PDF pages to JPG images"""
    return pdf_to_images(pdf_path, output_folder, "jpg")


def pdf_to_png(pdf_path, output_folder):
    """Convert PDF pages to PNG images"""
    return pdf_to_images(pdf_path, output_folder, "png")


def create_image_zip(image_files, output_path):
    """Create ZIP archive from image files"""
    try:
        with ZipFile(output_path, 'w') as zipf:
            for img_file in image_files:
                zipf.write(img_file, os.path.basename(img_file))
        return True, output_path
    except Exception as e:
        return False, str(e)


def add_text_to_pdf(pdf_path, output_path, annotations):
    """Add text annotations to PDF pages"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        for annotation in annotations:
            page_num = annotation.get('page', 0)
            x = annotation.get('x', 50)
            y = annotation.get('y', 50)
            text = annotation.get('text', '')
            font_size = annotation.get('font_size', 12)
            color = annotation.get('color', (0, 0, 0))
            
            if 0 <= page_num < len(pdf_doc):
                page = pdf_doc[page_num]
                # Insert text at specified location
                point = fitz.Point(x, y)
                page.insert_text(point, text, fontsize=font_size, color=color)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def rotate_pdf_pages(pdf_path, output_path, rotations):
    """Rotate specific pages in PDF"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        for rotation in rotations:
            page_num = rotation.get('page', 0)
            angle = rotation.get('angle', 90)
            
            if 0 <= page_num < len(pdf_doc):
                page = pdf_doc[page_num]
                page.set_rotation(angle)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def delete_pdf_pages(pdf_path, output_path, pages_to_delete):
    """Delete specific pages from PDF"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        # Sort in reverse to delete from end first
        for page_num in sorted(pages_to_delete, reverse=True):
            if 0 <= page_num < len(pdf_doc):
                pdf_doc.delete_page(page_num)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def extract_pdf_page(pdf_path, output_path, page_num):
    """Extract a single page from PDF"""
    try:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        if 0 <= page_num < len(reader.pages):
            writer.add_page(reader.pages[page_num])
        
        with open(output_path, "wb") as f:
            writer.write(f)
        
        return True, output_path
    except Exception as e:
        return False, str(e)


def add_watermark_to_pdf(pdf_path, output_path, watermark_text, opacity=0.3):
    """Add watermark to all pages"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            # Add watermark text
            page.insert_text(
                (page.rect.width / 2 - 100, page.rect.height / 2),
                watermark_text,
                fontsize=48,
                color=(0.5, 0.5, 0.5),
                alpha=opacity
            )
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def add_page_numbers_to_pdf(pdf_path, output_path, start_page=1):
    """Add page numbers to PDF"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            page_number = start_page + page_num
            # Insert page number at bottom right
            page.insert_text(
                (page.rect.width - 60, page.rect.height - 30),
                f"Page {page_number}",
                fontsize=10,
                color=(0, 0, 0)
            )
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def add_image_to_pdf(pdf_path, output_path, image_path, page_num, x=0, y=0, width=None, height=None):
    """Add image to specific PDF page"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            if width and height:
                page.insert_image((x, y, x + width, y + height), filename=image_path)
            else:
                page.insert_image((x, y), filename=image_path)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def draw_rectangle_on_pdf(pdf_path, output_path, page_num, x, y, width, height, color=(1, 0, 0), line_width=2):
    """Draw rectangle on PDF page"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            rect = fitz.Rect(x, y, x + width, y + height)
            page.draw_rect(rect, color=color, width=line_width)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def draw_circle_on_pdf(pdf_path, output_path, page_num, cx, cy, radius, color=(1, 0, 0), line_width=2):
    """Draw circle on PDF page"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            ellipse = fitz.Rect(cx - radius, cy - radius, cx + radius, cy + radius)
            page.draw_circle((cx, cy), radius, color=color, width=line_width)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def highlight_text_in_pdf(pdf_path, output_path, page_num, x, y, width, height, color=(1, 1, 0)):
    """Highlight area in PDF page (yellow by default)"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            highlight = fitz.Rect(x, y, x + width, y + height)
            page.draw_rect(highlight, color=color, fill=color)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def blank_page_in_pdf(pdf_path, output_path, page_num):
    """Blank out (whiteout) specific page"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            white_rect = fitz.Rect(page.rect)
            page.draw_rect(white_rect, color=(1, 1, 1), fill=(1, 1, 1))
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def draw_line_on_pdf(pdf_path, output_path, page_num, x1, y1, x2, y2, color=(0, 0, 0), line_width=2):
    """Draw line on PDF page"""
    try:
        pdf_doc = fitz.open(pdf_path)
        
        if 0 <= page_num < len(pdf_doc):
            page = pdf_doc[page_num]
            page.draw_line((x1, y1), (x2, y2), color=color, width=line_width)
        
        pdf_doc.save(output_path)
        pdf_doc.close()
        return True, output_path
    except Exception as e:
        return False, str(e)


def apply_multiple_edits(pdf_path, output_path, edits):
    """Apply multiple edits to PDF in sequence"""
    try:
        current_pdf = pdf_path
        
        for edit in edits:
            edit_type = edit.get('type')
            temp_output = os.path.join(os.path.dirname(output_path), f"temp_{uuid.uuid4().hex()}.pdf")
            
            if edit_type == 'text':
                success, result = add_text_to_pdf(current_pdf, temp_output, [edit])
            elif edit_type == 'watermark':
                success, result = add_watermark_to_pdf(current_pdf, temp_output, edit.get('text', 'WATERMARK'))
            elif edit_type == 'page_number':
                success, result = add_page_numbers_to_pdf(current_pdf, temp_output)
            elif edit_type == 'rectangle':
                success, result = draw_rectangle_on_pdf(
                    current_pdf, temp_output, edit.get('page', 0),
                    edit.get('x', 0), edit.get('y', 0),
                    edit.get('width', 100), edit.get('height', 100),
                    edit.get('color', (1, 0, 0))
                )
            elif edit_type == 'circle':
                success, result = draw_circle_on_pdf(
                    current_pdf, temp_output, edit.get('page', 0),
                    edit.get('cx', 0), edit.get('cy', 0),
                    edit.get('radius', 50), edit.get('color', (1, 0, 0))
                )
            elif edit_type == 'highlight':
                success, result = highlight_text_in_pdf(
                    current_pdf, temp_output, edit.get('page', 0),
                    edit.get('x', 0), edit.get('y', 0),
                    edit.get('width', 100), edit.get('height', 20),
                    edit.get('color', (1, 1, 0))
                )
            elif edit_type == 'delete_page':
                success, result = delete_pdf_pages(current_pdf, temp_output, [edit.get('page', 0)])
            elif edit_type == 'line':
                success, result = draw_line_on_pdf(
                    current_pdf, temp_output, edit.get('page', 0),
                    edit.get('x1', 0), edit.get('y1', 0),
                    edit.get('x2', 100), edit.get('y2', 100),
                    edit.get('color', (0, 0, 0))
                )
            else:
                continue
            
            if success:
                if current_pdf != pdf_path and os.path.exists(current_pdf):
                    os.remove(current_pdf)
                current_pdf = temp_output
            else:
                if os.path.exists(temp_output):
                    os.remove(temp_output)
                return False, result
        
        # Move final result to output path
        if current_pdf != output_path:
            if os.path.exists(current_pdf):
                os.rename(current_pdf, output_path)
        
        return True, output_path
    except Exception as e:
        return False, str(e)
