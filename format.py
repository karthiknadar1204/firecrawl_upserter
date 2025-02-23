import json

def format_markdown_and_add_id(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)

    for idx, element in enumerate(data, start=1):
        element['id'] = idx
        if 'data' in element:
            # Remove HTML data
            if 'html' in element['data']:
                del element['data']['html']
            
            # Format markdown by splitting into lines and joining with newlines
            if 'markdown' in element['data']:
                markdown = element['data']['markdown']
                formatted_markdown = '\n'.join(markdown.split('\\n'))
                element['data']['markdown'] = formatted_markdown

            # Filter metadata fields
            if 'metadata' in element['data']:
                metadata = element['data']['metadata']
                keys_to_keep = [
                    'title', 'ogSiteName', 'og:image', 'keywords', 
                    'ogUrl', 'ogDescription', 'description', 
                    'scrapeId', 'sourceURL', 'url'
                ]
                element['data']['metadata'] = {key: metadata[key] for key in keys_to_keep if key in metadata}

    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

# Usage
format_markdown_and_add_id('results5.json')
