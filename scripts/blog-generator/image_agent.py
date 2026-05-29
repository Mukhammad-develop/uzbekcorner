import requests
import random
from pathlib import Path
import config

class ImageAgent:
    def __init__(self, topic_details):
        self.slug = topic_details.get('slug', 'blog-upload')
        self.title = topic_details.get('title', '')
        self.focus = topic_details.get('focus', '')

    def acquire_image(self):
        """
        Acquires a high-quality, royalty-free image matching the blog topic.
        Downloads the image locally to a temporary path.
        Returns: Path to the local downloaded image.
        """
        # Map topics to specific, stunning Unsplash food photography coordinates
        # These are high-quality, high-resolution direct image source URLs
        image_mappings = {
            'shashlik': [
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&h=800&q=80',  # charcoal skewers
                'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&h=800&q=80'   # hot grilled meat
            ],
            'non': [
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=800&q=80',  # rustic golden bread
                'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&h=800&q=80'   # bakery fresh bread
            ],
            'manti': [
                'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&h=800&q=80',  # steamed dumplings
                'https://images.unsplash.com/photo-1541696497-39685e603d47?auto=format&fit=crop&w=1200&h=800&q=80'   # savory stuffed pastry
            ],
            'somsa': [
                'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1200&h=800&q=80',  # flaky golden pastries
                'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=1200&h=800&q=80'   # savory baked snacks
            ],
            'plov': [
                'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&h=800&q=80',  # gorgeous rice & lamb bowl
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=800&q=80'   # premium hot food table
            ]
        }

        # Check which keyword fits the slug or title
        target_key = 'plov'  # Default fallback
        combined_text = f"{self.slug} {self.title} {self.focus}".lower()
        
        for keyword in image_mappings.keys():
            if keyword in combined_text:
                target_key = keyword
                break

        # Pick a random candidate URL
        target_urls = image_mappings[target_key]
        image_url = random.choice(target_urls)

        # Set up local save path
        filename = f"temp-{self.slug}.jpg"
        save_path = config.LOCAL_TEMP_DIR / filename

        print(f"📷 Matching topic to premium category '{target_key}'...")
        print(f"⬇️ Downloading image from: {image_url}")
        
        try:
            res = requests.get(image_url, timeout=15)
            res.raise_for_status()
            
            with open(save_path, 'wb') as f:
                f.write(res.content)
            
            print(f"✅ Image downloaded and saved locally to: {save_path}")
            return str(save_path)
        except Exception as e:
            print(f"⚠️ Image download failed: {e}. Generating local fallback placeholder...")
            return self._generate_fallback_placeholder(save_path)

    def _generate_fallback_placeholder(self, save_path):
        """
        Creates a valid image file locally in case of network download failure.
        Ensures the automation pipeline never crashes.
        """
        try:
            # We can write a simple tiny 1x1 base64 pixel as a valid JPEG/PNG representation
            small_jpeg_hex = (
                "FFD8FFE000104A46494600010101006000600000FFFE003B4372656174656420776974682047494D50"
                "FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C2024"
                "2E2720222B221C1C2837292B30313434341F27393D38323C2E333432FFC0000B080001000101011100"
                "FFC4001F0000010501110101010100000000000000000102030405060708090A0BFFC400B110000201"
                "0303020403050504040000017D01020300041105122131410613516107227114328191A1082342B1C1"
                "1552D1F02433627282090A161718191A25262728292A3435363738393A434445464748494A53545556"
                "5758595A636465666768696A737475767778797A838485868788898A92939495969798999AA2A3A4A5"
                "A6A7A8A9AAB2B3B4B5B6B7B8B9BAB3B4B5B6B7B8B9BABAFFDA000C03010002110311003F003D00FFD9"
            )
            image_data = bytes.fromhex(small_jpeg_hex)
            
            with open(save_path, 'wb') as f:
                f.write(image_data)
                
            print(f"✅ Programmatic local JPEG placeholder created at: {save_path}")
            return str(save_path)
        except Exception as ex:
            raise Exception(f"Failed to generate local fallback image: {ex}")

if __name__ == '__main__':
    agent = ImageAgent({'slug': 'delicious-plov-streatham', 'title': 'The Golden Crown of Plov'})
    local_img = agent.acquire_image()
    print("Local image path:", local_img)
