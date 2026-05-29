import requests
import os
from pathlib import Path
import config

class UzbekCornerAPIClient:
    def __init__(self):
        self.base_url = config.BLOG_API_URL.rstrip('/')
        self.api_key = config.BLOG_API_KEY
        
    def get_existing_posts(self):
        """
        Fetches all currently published blog posts.
        Returns a list of dicts with keys like 'slug', 'title', 'imageUrl', etc.
        """
        url = f"{self.base_url}/public/blog"
        try:
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            data = res.json()
            return data.get('posts', [])
        except Exception as e:
            print(f"❌ Failed to fetch existing posts from {url}: {e}")
            return []

    def upload_image(self, file_path, slug=None):
        """
        Uploads a local image file to the server.
        - file_path: Absolute path to the local image file.
        - slug: Optional slug context to format the generated filename.
        Returns: The server-relative URL string (e.g., '/images/blog/...')
        """
        url = f"{self.base_url}/public/upload"
        path_obj = Path(file_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"Image file not found at: {file_path}")

        headers = {
            'x-api-key': self.api_key
        }

        # Select mime-type based on extension
        ext = path_obj.suffix.lower()
        if ext in ['.jpg', '.jpeg']:
            mime = 'image/jpeg'
        elif ext == '.png':
            mime = 'image/png'
        elif ext == '.webp':
            mime = 'image/webp'
        else:
            mime = 'application/octet-stream'

        try:
            with open(file_path, 'rb') as f:
                files = {
                    'file': (path_obj.name, f, mime)
                }
                data = {}
                if slug:
                    data['slug'] = slug

                print(f"📤 Uploading {path_obj.name} ({mime}) to {url}...")
                res = requests.post(url, headers=headers, files=files, data=data, timeout=20)
                
                if res.status_code != 200:
                    try:
                        err_msg = res.json().get('error', res.text)
                    except:
                        err_msg = res.text
                    raise Exception(f"Upload failed with status {res.status_code}: {err_msg}")

                response_data = res.json()
                return response_data.get('url')
        except Exception as e:
            print(f"❌ Error uploading image to {url}: {e}")
            raise

    def publish_blog_post(self, slug, title, content, excerpt=None, image_url=None, published=True):
        """
        Publishes/upserts a blog post.
        Returns: The published post object details.
        """
        url = f"{self.base_url}/public/blog"
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': self.api_key
        }
        
        payload = {
            'slug': slug,
            'title': title,
            'content': content,
            'excerpt': excerpt,
            'imageUrl': image_url,
            'published': published
        }

        try:
            print(f"✍️ Publishing blog post '{title}' (slug: {slug}) to {url}...")
            res = requests.post(url, headers=headers, json=payload, timeout=15)
            
            if res.status_code not in [200, 201]:
                try:
                    err_msg = res.json().get('error', res.text)
                except:
                    err_msg = res.text
                raise Exception(f"Publishing failed with status {res.status_code}: {err_msg}")

            response_data = res.json()
            return response_data.get('post')
        except Exception as e:
            print(f"❌ Error publishing blog post: {e}")
            raise

if __name__ == '__main__':
    # Quick connectivity test
    client = UzbekCornerAPIClient()
    print("Testing Uzbek Corner API connection...")
    posts = client.get_existing_posts()
    print(f"Successfully retrieved {len(posts)} posts from the index.")
