import sys
import re

def transform_frontmatter(frontmatter):
    # Extract title
    title_match = re.search(r'title:\s*([^\n\r]+)', frontmatter)
    title = title_match.group(1).strip() if title_match else ''

    # Extract description
    description_match = re.search(r'description:\s*([^\n\r]+)', frontmatter)
    description = description_match.group(1).strip() if description_match else ''

    # if description includes 'date:', that means the description was empty
    # TODO: fix this quick fix later
    if 'date:' in description:
        description = ''

    # Extract date
    date_match = re.search(r'date:\s*"(\d{4}-\d{2}-\d{2})"', frontmatter)
    date = date_match.group(1) if date_match else ''

    # Format date
    if date:
        year, month, day = map(int, date.split('-'))
        formatted_date = f"Posted on {month_name(month)} {ordinal(day)}, {year}."
    else:
        formatted_date = ''

    # Extract tags
    tags_match = re.search(r'tags:\s*([\w\s,]+)', frontmatter, flags=re.IGNORECASE)
    tags = tags_match.group(1).split(',') if tags_match else []
    tags = [tag.strip() for tag in tags]

    # Format tags
    if tags:
        formatted_tags = "Tags include " + ', '.join(tags[:-1]) + ', and ' + tags[-1] + '.'
    else:
        formatted_tags = ''

    # Construct transformed frontmatter
    transformed_frontmatter = f"{title}\n\n{description}\n\n{formatted_date}\n\n{formatted_tags}"
    
    return transformed_frontmatter

def month_name(month):
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]

def ordinal(day):
    if 10 <= day % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    return str(day) + suffix

def transform_markdown(text):
    text_with_transformed_frontmatter = text
    # Find frontmatter, if any
    frontmatter_match = re.search(r'---\n(.*?)\n---', text, flags=re.DOTALL)
    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        transformed_frontmatter = transform_frontmatter(frontmatter)
        # Replace frontmatter with transformed version
        text_with_transformed_frontmatter = re.sub(r'---\n(.*?)\n---', transformed_frontmatter, text, flags=re.DOTALL)
        
    return text_with_transformed_frontmatter

def remove_html_blocks(text):
    # Define the pattern to match HTML blocks
    html_block_pattern = r'<[^>]*?>'
    
    # Remove HTML blocks using regex
    text_without_html = re.sub(html_block_pattern, '', text)
    
    return text_without_html

def remove_links(text):
    # regex and remove any []() or any ![]()
    text_without_links = re.sub(r'!\[.*?\]\(.*?\)', '', text)  # Remove image links first
    text_without_links = re.sub(r'\[.*?\]\(.*?\)', '', text_without_links)  # Remove regular links
    text_without_links = re.sub(r'^[*-]\s+', '', text_without_links, flags=re.MULTILINE)  # Remove bullet points
    text_without_links = re.sub(r'!+', '', text_without_links)  # Remove any remaining exclamation marks

    return text_without_links


def remove_imports(text):
    # if a line starts with 'import ', remove it
    text_without_imports = re.sub(r'^import .*', '', text, flags=re.MULTILINE)

    return text_without_imports

def deEmojify(text):
    regrex_pattern = re.compile(pattern = "["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                           "]+", flags = re.UNICODE)
    return regrex_pattern.sub(r'',text)

def extract_text_from_markdown_links(text):
    pattern = r'\[([^\[\]]*)\]\([^)]*\)'
    return re.sub(pattern, r'\1', text)

def remove_markdown_elements(text):
    # Remove * from bold words
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    
    # Remove _ from italic words
    text = re.sub(r'_(.*?)_', r'\1', text)
    
    # Remove headings (#, ##, or ###)
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    
    return text

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 clean_mdx.py <input_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    
    # Read the input file
    with open(input_file, 'r') as f:
        mdx_content = f.read()

    # Remove HTML blocks from the content
    filtered_content = remove_html_blocks(mdx_content)

    # Remove imports
    filtered_content = remove_imports(filtered_content)

    # Remove code blocks
    filtered_content = re.sub(r'```.*?```', '', filtered_content, flags=re.DOTALL)

    # Remove URL part of markdown links
    filtered_content = extract_text_from_markdown_links(filtered_content)

    # Remove markdown elements
    filtered_content = remove_markdown_elements(filtered_content)
    
    # Remove emojis from the content
    filtered_content = deEmojify(filtered_content)

    # Transform frontmatter
    filtered_content = transform_markdown(filtered_content)

    # Save it to a txt file of the same name
    with open(input_file.replace('.mdx', '.txt'), 'w') as f:
        f.write(filtered_content)
