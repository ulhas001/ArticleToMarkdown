from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)
CORS(app)

@app.route('/api/fetch-article', methods=['POST'])
def fetch_article():
    data = request.json
    url = data.get('url')
    platform = data.get('platform')
    
    try:
        if platform == 'devto':
            return fetch_devto_article(url)
        elif platform == 'medium':
            return fetch_medium_article(url)
        else:
            return jsonify({'error': 'Unsupported platform'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def fetch_devto_article(url):
    """
    Fetch dev.to article using official API
    """
    parts = url.rstrip('/').split('/')
    username = parts[-2] if len(parts) >= 2 else None
    slug = parts[-1]
    
    api_url = f"https://dev.to/api/articles/{username}/{slug}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        raise Exception("Failed to fetch article from dev.to")
    
    article_data = response.json()
    
    return jsonify({
        'title': article_data.get('title', ''),
        'content': article_data.get('body_markdown', ''),
        'html_content': article_data.get('body_html', ''),
        'author': article_data.get('user', {}).get('name', ''),
        'published_at': article_data.get('published_at', ''),
        'tags': article_data.get('tags', []),
        'url': article_data.get('url', ''),
        'cover_image': article_data.get('cover_image', '')
    })

def fetch_medium_article(url):
    """
    Fetch Medium article using RSS to JSON converter
    """
    try:
        # Extract username from URL
        if '@' in url:
            username = url.split('@')[1].split('/')[0]
            rss_url = f"https://medium.com/feed/@{username}"
        else:
            parts = url.split('/')
            domain = parts[2]
            if '.medium.com' in domain:
                username = domain.replace('.medium.com', '')
                rss_url = f"https://medium.com/feed/@{username}"
            else:
                raise Exception("Could not extract username from Medium URL")
        
        # Use RSS to JSON converter
        rss_json_url = f"https://api.rss2json.com/v1/api.json?rss_url={rss_url}"
        
        response = requests.get(rss_json_url, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch RSS feed (Status: {response.status_code})")
        
        data = response.json()
        
        if data.get('status') != 'ok':
            raise Exception("RSS feed returned an error")
        
        # Find the article matching the URL
        articles = data.get('items', [])
        target_article = None
        
        for article in articles:
            if article.get('link', '') == url or url in article.get('link', ''):
                target_article = article
                break
        
        if not target_article:
            return fetch_medium_article_direct(url)
        
        # Extract content and convert to markdown
        html_content = target_article.get('content', '') or target_article.get('description', '')
        markdown_content = convert_html_to_markdown(html_content)
        
        return jsonify({
            'title': target_article.get('title', ''),
            'content': markdown_content,
            'html_content': html_content,
            'author': target_article.get('author', 'Unknown Author'),
            'published_at': target_article.get('pubDate', ''),
            'tags': target_article.get('categories', []),
            'url': target_article.get('link', url),
            'cover_image': target_article.get('thumbnail', '')
        })
        
    except Exception as e:
        raise Exception(f"Failed to fetch article from Medium: {str(e)}")

def fetch_medium_article_direct(url):
    """
    Fallback method to fetch Medium article directly
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 403:
            raise Exception("Medium blocked the request. Please try using the RSS method.")
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch article (Status: {response.status_code})")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title_tag = soup.find('h1')
        title = title_tag.get_text(strip=True) if title_tag else 'Untitled'
        
        author_tag = soup.find('meta', {'name': 'author'})
        author = author_tag.get('content', '') if author_tag else 'Unknown Author'
        
        published_tag = soup.find('meta', {'property': 'article:published_time'})
        published_at = published_tag.get('content', '') if published_tag else ''
        
        article_body = soup.find('article')
        if not article_body:
            raise Exception("Could not find article content")
        
        html_content = str(article_body)
        markdown_content = convert_html_to_markdown(html_content)
        
        tags = []
        tag_links = soup.find_all('a', {'rel': 'tag'})
        tags = [tag.get_text(strip=True) for tag in tag_links[:5]]
        
        return jsonify({
            'title': title,
            'content': markdown_content,
            'html_content': html_content,
            'author': author,
            'published_at': published_at,
            'tags': tags,
            'url': url,
            'cover_image': ''
        })
        
    except Exception as e:
        raise Exception(f"Failed to fetch article: {str(e)}")

def convert_html_to_markdown(html_content):
    """
    Enhanced HTML to Markdown converter
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style tags
    for tag in soup(['script', 'style', 'noscript']):
        tag.decompose()
    
    def process_element(element, depth=0):
        """Recursively process HTML elements"""
        if element.name is None:
            text = str(element).strip()
            if text:
                return text
            return ''
        
        result = ''
        
        # Headings
        if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(element.name[1])
            text = element.get_text(strip=True)
            result = '\n' + ('#' * level) + ' ' + text + '\n\n'
        
        # Paragraphs
        elif element.name == 'p':
            text = ''.join([process_inline(child) for child in element.children])
            text = text.strip()
            if text:
                result = text + '\n\n'
        
        # Blockquotes
        elif element.name == 'blockquote':
            lines = element.get_text(strip=True).split('\n')
            result = '\n' + '\n'.join(['> ' + line for line in lines if line.strip()]) + '\n\n'
        
        # Code blocks
        elif element.name == 'pre':
            code = element.get_text()
            code_tag = element.find('code')
            lang = ''
            if code_tag and code_tag.get('class'):
                classes = code_tag.get('class')
                for cls in classes:
                    if cls.startswith('language-'):
                        lang = cls.replace('language-', '')
                        break
            result = f'\n```{lang}\n{code}\n```\n\n'
        
        # Lists
        elif element.name == 'ul':
            result = '\n'
            for li in element.find_all('li', recursive=False):
                text = ''.join([process_inline(child) for child in li.children])
                result += f'- {text.strip()}\n'
            result += '\n'
        
        elif element.name == 'ol':
            result = '\n'
            for idx, li in enumerate(element.find_all('li', recursive=False), 1):
                text = ''.join([process_inline(child) for child in li.children])
                result += f'{idx}. {text.strip()}\n'
            result += '\n'
        
        # Horizontal rule
        elif element.name == 'hr':
            result = '\n---\n\n'
        
        # Images
        elif element.name == 'img':
            alt = element.get('alt', '')
            src = element.get('src', '')
            if src:
                result = f'\n![{alt}]({src})\n\n'
        
        # Figures
        elif element.name == 'figure':
            img = element.find('img')
            if img:
                alt = img.get('alt', '')
                src = img.get('src', '')
                figcaption = element.find('figcaption')
                caption = figcaption.get_text(strip=True) if figcaption else ''
                if src:
                    result = f'\n![{alt}]({src})\n'
                    if caption:
                        result += f'*{caption}*\n'
                    result += '\n'
        
        # Links
        elif element.name == 'a':
            text = element.get_text(strip=True)
            href = element.get('href', '')
            if href and text:
                result = f'[{text}]({href})'
        
        # Divs and containers
        elif element.name in ['div', 'section', 'article', 'span']:
            for child in element.children:
                result += process_element(child, depth + 1)
        
        return result
    
    def process_inline(element):
        """Process inline elements"""
        if element.name is None:
            return str(element)
        
        text = ''
        
        if element.name == 'strong' or element.name == 'b':
            text = f"**{element.get_text()}**"
        elif element.name == 'em' or element.name == 'i':
            text = f"*{element.get_text()}*"
        elif element.name == 'code':
            text = f"`{element.get_text()}`"
        elif element.name == 'a':
            link_text = element.get_text(strip=True)
            href = element.get('href', '')
            text = f'[{link_text}]({href})' if href else link_text
        elif element.name == 'br':
            text = '\n'
        else:
            text = element.get_text()
        
        return text
    
    markdown_lines = []
    for element in soup.children:
        markdown_lines.append(process_element(element))
    
    markdown = ''.join(markdown_lines)
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    
    return markdown.strip()

if __name__ == '__main__':
    app.run()
