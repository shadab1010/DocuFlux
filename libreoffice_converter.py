"""
Advanced document conversion module
Implements multiple conversion strategies with smart fallbacks:
1. LibreOffice (100% accurate - professional grade)
2. Pandoc (excellent for text-based conversions)
3. python-docx + pdf2docx + reportlab (when others unavailable)

This architecture mirrors what iLovePDF uses
"""

import subprocess
import os
import time
from pathlib import Path
from typing import Tuple, Optional


class DocumentConverter:
    """Multi-strategy document converter"""
    
    # LibreOffice paths
    LIBREOFFICE_PATHS = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        r"C:\Program Files\LibreOffice 7\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice 7\program\soffice.exe",
        r"C:\Program Files\LibreOffice 8\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice 8\program\soffice.exe",
        "libreoffice", "soffice",
    ]
    
    # Pandoc paths
    PANDOC_PATHS = [
        r"C:\Program Files\Pandoc\pandoc.exe",
        r"C:\Program Files (x86)\Pandoc\pandoc.exe",
        "pandoc",
    ]
    
    _cache = {
        'libreoffice': None,
        'pandoc': None,
        'checked': False
    }
    
    @staticmethod
    def find_tool(paths: list, tool_name: str) -> Optional[str]:
        """Find an executable tool from a list of possible paths"""
        for path in paths:
            try:
                result = subprocess.run(
                    [path, "--version"],
                    capture_output=True,
                    timeout=3
                )
                if result.returncode == 0:
                    print(f"Found {tool_name} at: {path}")
                    return path
            except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
                continue
        return None
    
    @staticmethod
    def get_available_tools() -> dict:
        """Get available conversion tools"""
        if DocumentConverter._cache['checked']:
            return {
                'libreoffice': DocumentConverter._cache['libreoffice'],
                'pandoc': DocumentConverter._cache['pandoc']
            }
        
        lo_path = DocumentConverter.find_tool(DocumentConverter.LIBREOFFICE_PATHS, "LibreOffice")
        pandoc_path = DocumentConverter.find_tool(DocumentConverter.PANDOC_PATHS, "Pandoc")
        
        DocumentConverter._cache['libreoffice'] = lo_path
        DocumentConverter._cache['pandoc'] = pandoc_path
        DocumentConverter._cache['checked'] = True
        
        return {'libreoffice': lo_path, 'pandoc': pandoc_path}
    
    @staticmethod
    def convert_with_libreoffice(input_path: str, output_path: str, output_format: str, timeout: int = 60) -> bool:
        """Convert using LibreOffice (best quality)"""
        tools = DocumentConverter.get_available_tools()
        if not tools['libreoffice']:
            return False
        
        try:
            output_dir = os.path.dirname(output_path) or '.'
            os.makedirs(output_dir, exist_ok=True)
            
            cmd = [
                tools['libreoffice'],
                '--headless',
                '--convert-to', output_format,
                '--outdir', output_dir,
                input_path
            ]
            
            print(f"Converting with LibreOffice: {input_path} -> {output_format}")
            result = subprocess.run(cmd, capture_output=True, timeout=timeout, text=True)
            
            if result.returncode != 0:
                print(f"LibreOffice error: {result.stderr}")
                return False
            
            time.sleep(0.5)
            
            # Rename output file
            input_name = os.path.splitext(os.path.basename(input_path))[0]
            temp_output = os.path.join(output_dir, f"{input_name}.{output_format}")
            
            if os.path.exists(temp_output) and temp_output != output_path:
                os.rename(temp_output, output_path)
            
            success = os.path.exists(output_path) and os.path.getsize(output_path) > 100
            if success:
                print(f"LibreOffice conversion successful!")
            return success
            
        except subprocess.TimeoutExpired:
            print(f"LibreOffice timeout")
            return False
        except Exception as e:
            print(f"LibreOffice error: {str(e)}")
            return False
    
    @staticmethod
    def convert_with_pandoc(input_path: str, output_path: str, from_fmt: str, to_fmt: str, timeout: int = 30) -> bool:
        """Convert using Pandoc"""
        tools = DocumentConverter.get_available_tools()
        if not tools['pandoc']:
            return False
        
        try:
            cmd = [
                tools['pandoc'],
                input_path,
                '-f', from_fmt,
                '-t', to_fmt,
                '-o', output_path
            ]
            
            print(f"Converting with Pandoc: {from_fmt} -> {to_fmt}")
            result = subprocess.run(cmd, capture_output=True, timeout=timeout, text=True)
            
            if result.returncode != 0:
                print(f"Pandoc error: {result.stderr}")
                return False
            
            success = os.path.exists(output_path) and os.path.getsize(output_path) > 100
            if success:
                print(f"Pandoc conversion successful!")
            return success
            
        except subprocess.TimeoutExpired:
            print(f"Pandoc timeout")
            return False
        except Exception as e:
            print(f"Pandoc error: {str(e)}")
            return False


class LibreOfficeConverter:
    """Backward compatible converter class"""
    
    @staticmethod
    def find_libreoffice():
        """Find LibreOffice installation"""
        tools = DocumentConverter.get_available_tools()
        return tools['libreoffice']
    
    @staticmethod
    def is_available():
        """Check if LibreOffice is available"""
        return LibreOfficeConverter.find_libreoffice() is not None
    
    @staticmethod
    def convert(input_path, output_path, input_format=None, output_format=None, timeout=60):
        """Convert using best available method"""
        return DocumentConverter.convert_with_libreoffice(
            input_path, output_path, 
            output_format or os.path.splitext(output_path)[1].lstrip('.'),
            timeout
        )


def convert_pdf_to_word(pdf_path: str, output_path: str) -> bool:
    """Convert PDF to Word Document with fallbacks"""
    # Try LibreOffice first
    if DocumentConverter.convert_with_libreoffice(pdf_path, output_path, 'docx'):
        return True
    
    # Fallback to pdf2docx
    try:
        from pdf2docx.converter import Converter
        print("Falling back to pdf2docx converter...")
        cv = Converter(pdf_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()
        return os.path.exists(output_path) and os.path.getsize(output_path) > 100
    except Exception as e:
        print(f"pdf2docx error: {str(e)}")
        return False


def convert_word_to_pdf(word_path: str, output_path: str) -> bool:
    """Convert Word Document to PDF with fallbacks"""
    # Try LibreOffice first
    if DocumentConverter.convert_with_libreoffice(word_path, output_path, 'pdf'):
        return True
    
    # Try Pandoc
    if DocumentConverter.convert_with_pandoc(word_path, output_path, 'docx', 'pdf'):
        return True
    
    # Fallback to python-docx + reportlab (already handled in app.py)
    print("Will use python-docx + reportlab fallback")
    return False
