import os
from playwright.sync_api import sync_playwright

def convert_url_to_pdf(url, output_path, options):
    """
    Convert a webpage (URL) to a PDF using Playwright.
    
    options dictionary can contain:
    - screen_size: (width, height) tuple
    - page_size: e.g., 'A4', 'Letter'
    - one_long_page: boolean
    - orientation: 'portrait' or 'landscape'
    - margins: 'None', 'Small', 'Big'
    - block_ads: boolean
    - remove_popups: boolean
    """
    try:
        with sync_playwright() as p:
            # Launch chromium carefully
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            
            # Setup context with screen size
            width, height = options.get('screen_size', (1536, 864))
            context = browser.new_context(viewport={'width': width, 'height': height})
            page = context.new_page()
            
            # Navigate to URL
            # Wait until load to ensure most scripts/styles are loaded, avoiding networkidle errors on complex sites
            page.goto(url, wait_until='load', timeout=60000)
            
            # Inject CSS/JS to remove ads and popups if requested
            if options.get('remove_popups'):
                # Try to remove fixed/sticky overlay elements often used for popups/cookie banners
                page.evaluate('''() => {
                    const elements = document.querySelectorAll('*');
                    for (const el of elements) {
                        const style = window.getComputedStyle(el);
                        if ((style.position === 'fixed' || style.position === 'sticky') && (style.zIndex > 100)) {
                            el.remove();
                        }
                    }
                }''')
                
            if options.get('block_ads'):
                # Inject a simplistic ad-blocker CSS style
                page.add_style_tag(content='''
                    iframe, .adsbygoogle, [id^="div-gpt-ad"], .ad-container, .ad-slot, .ad-banner {
                        display: none !important;
                    }
                ''')
            
            # Prepare PDF generation options
            pdf_options = {
                'path': output_path,
                'print_background': True,
                'landscape': options.get('orientation') == 'landscape',
            }
            
            # Handle Page Size vs "One long page"
            if options.get('one_long_page'):
                # To get one long page, we need to know the full scroll height
                height = page.evaluate("() => document.documentElement.scrollHeight")
                if height:
                    # Width is standard viewport width (in pixels turned to inches approximately, playwright takes px or in/cm)
                    # We just pass the width and height directly
                    pdf_options['width'] = f"{width}px"
                    pdf_options['height'] = f"{height}px"
                else:
                    pdf_options['format'] = options.get('page_size', 'A4')
            else:
                pdf_options['format'] = options.get('page_size', 'A4')
                
            # Handle margins
            margin_val = '0px'
            if options.get('margins') == 'Small':
                margin_val = '0.5in'
            elif options.get('margins') == 'Big':
                margin_val = '1in'
                
            if margin_val != '0px':
                pdf_options['margin'] = {
                    'top': margin_val,
                    'right': margin_val,
                    'bottom': margin_val,
                    'left': margin_val
                }
            else:
                 pdf_options['margin'] = {
                    'top': '0px',
                    'right': '0px',
                    'bottom': '0px',
                    'left': '0px'
                }
            
            # Emulate media print to ensure print styles are used (or maybe screen if we want exact screen look?)
            # Usually users want exactly what they see on screen for this tool type, so we emulate 'screen'
            page.emulate_media(media="screen")
            
            # Generate the PDF
            page.pdf(**pdf_options)
            
            browser.close()
            return True, output_path
            
    except Exception as e:
        return False, str(e)
