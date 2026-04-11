import re

def update_font_sizes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find font-size: .\d+rem or 0.\d+rem and add 0.2
    # e.g., .85rem -> 1.05rem, 0.6rem -> 0.8rem
    def replace_font_size(match):
        prefix = match.group(1)
        val_str = match.group(2)
        suffix = match.group(3)
        
        # Convert to float
        if val_str.startswith('.'):
            val_str = '0' + val_str
            
        val = float(val_str)
        # Add 0.2rem to any value less than 1.5rem (to avoid making huge text huger, mostly targeting the <1rem body text)
        if val < 1.0:
            new_val = val + 0.2
            # Format back to remove leading zero if original didn't have it, or just keep it clean
            formatted_val = f"{new_val:.2f}".rstrip('0').rstrip('.')
            # if original was like .85, we can use 1.05
            return f"{prefix}{formatted_val}{suffix}"
        return match.group(0) # unchanged

    # Regex to match: font-size:[spaces](0?.\d+)rem
    updated_content = re.sub(r'(font-size:\s*)(0?\.\d+)(rem)', replace_font_size, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print("Font sizes updated.")

update_fonts.py('page-pathbright.php')
