"""
Convert Markdown to Word Document
Simple script to convert the business overview to DOCX format
"""

try:
    import pypandoc
    import os
    
    def convert_md_to_docx(md_file, output_file):
        """Convert markdown file to Word document"""
        try:
            # Convert using pandoc
            output = pypandoc.convert_file(md_file, 'docx', outputfile=output_file)
            print(f"✅ Successfully converted {md_file} to {output_file}")
            return True
        except Exception as e:
            print(f"❌ Error converting file: {str(e)}")
            return False
    
    # Convert the business overview
    md_file = "context_files/BUSINESS_OVERVIEW.md"
    docx_file = "AI_Claims_Analysis_Business_Overview.docx"
    
    if os.path.exists(md_file):
        success = convert_md_to_docx(md_file, docx_file)
        if success:
            print(f"📄 Word document created: {docx_file}")
            print("📋 Document includes:")
            print("   • Fraud detection examples")
            print("   • Trend analysis capabilities") 
            print("   • Real-world success stories")
            print("   • Implementation process")
            print("   • Business benefits and ROI")
    else:
        print(f"❌ File not found: {md_file}")

except ImportError:
    print("📦 Installing required package...")
    print("Run this command first:")
    print("pip install pypandoc")
    print("\nAlternatively, you can:")
    print("1. Copy the markdown content")
    print("2. Paste into Word")
    print("3. Use Word's built-in formatting")
    
    # Show manual conversion instructions
    print("\n📋 Manual Conversion Steps:")
    print("1. Open the BUSINESS_OVERVIEW.md file")
    print("2. Copy all content (Ctrl+A, Ctrl+C)")
    print("3. Open Microsoft Word")
    print("4. Paste content (Ctrl+V)")
    print("5. Apply formatting:")
    print("   • Headers: Use Heading 1, 2, 3 styles")
    print("   • Tables: Convert pipe tables to Word tables")
    print("   • Bullets: Format as bullet lists")
    print("6. Save as .docx file")
