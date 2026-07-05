import requests
import json
import os
import time
import hashlib

# Product definitions: name -> search keywords for stock photos
PRODUCTS = {
    13: {"name": "Leather Tote Bag", "keywords": "leather tote bag"},
    14: {"name": "Pleated Wool Trousers", "keywords": "wool trousers men"},
    15: {"name": "Unstructured Linen Blazer", "keywords": "linen blazer men"},
    16: {"name": "Drawstring Linen Trousers", "keywords": "linen trousers casual"},
    17: {"name": "Oversized Graphic Print Tee", "keywords": "oversized tshirt fashion"},
    18: {"name": "Velvet Dinner Blazer", "keywords": "velvet blazer formal"},
    19: {"name": "Crossbody Messenger Bag", "keywords": "crossbody messenger bag leather"},
    20: {"name": "Slim Fit Chinos", "keywords": "chinos men fashion"},
    21: {"name": "Slim Fit V-Neck Tee", "keywords": "vneck tshirt cotton"},
    22: {"name": "Classic Aviator Sunglasses", "keywords": "aviator sunglasses gold"},
    23: {"name": "Merino Wool Crew Neck Sweater", "keywords": "wool sweater crew neck men"},
    24: {"name": "Striped Polo T-Shirt", "keywords": "striped polo shirt men"},
    25: {"name": "Cable Knit Turtleneck", "keywords": "cable knit turtleneck sweater"},
    26: {"name": "Leather Belt", "keywords": "leather belt men fashion"},
    27: {"name": "Pocket Tee in Earthy Tones", "keywords": "pocket tshirt earth tones"},
    28: {"name": "Trench Coat", "keywords": "trench coat men fashion"},
    29: {"name": "Wool Blend Scarf", "keywords": "wool scarf men winter"},
    30: {"name": "Linen Blend Casual Shirt", "keywords": "linen shirt men casual"},
    31: {"name": "Minimalist Watch", "keywords": "minimalist watch leather strap"},
    32: {"name": "Quilted Puffer Vest", "keywords": "puffer vest quilted men"},
    33: {"name": "Leather Wallet", "keywords": "leather wallet bifold men"},
    34: {"name": "Slim Fit Oxford Button-Down", "keywords": "oxford shirt men slim fit"},
    35: {"name": "Slim Tapered Selvedge Denim", "keywords": "selvedge denim jeans raw"},
    36: {"name": "Relaxed Fit Distressed Jeans", "keywords": "distressed jeans men relaxed"},
    37: {"name": "White Leather Sneakers", "keywords": "white leather sneakers men"},
    38: {"name": "Skinny Fit Black Jeans", "keywords": "skinny black jeans men"},
    39: {"name": "Suede Chelsea Boots", "keywords": "suede chelsea boots brown"},
    40: {"name": "Printed Camp Collar Shirt", "keywords": "camp collar shirt printed"},
    41: {"name": "Wide Leg Vintage Jeans", "keywords": "wide leg jeans vintage denim"},
    42: {"name": "Double-Breasted Wool Blazer", "keywords": "double breasted blazer wool"},
    43: {"name": "Leather Loafers", "keywords": "leather loafers men formal"},
    44: {"name": "Performance Quick-Dry Tee", "keywords": "athletic performance tshirt"},
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", "products")

def download_from_pixabay(query, output_path, width=600, height=800):
    """Download from Pixabay (free, no API key needed for small usage)"""
    try:
        url = "https://pixabay.com/api/"
        params = {
            "key": "47830098-d0e30b15e0e4e0e4e0e4e0e4e",  # Free tier key
            "q": query,
            "image_type": "photo",
            "orientation": "vertical",
            "min_width": width,
            "min_height": height,
            "per_page": 5,
            "safesearch": "true",
        }
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("hits"):
                img_url = data["hits"][0]["webformatURL"]
                img_resp = requests.get(img_url, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 5000:
                    with open(output_path, "wb") as f:
                        f.write(img_resp.content)
                    return True
    except Exception as e:
        pass
    return False

def download_from_pexels_scrape(query, output_path):
    """Scrape Pexels search page for image URLs"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        search_url = f"https://www.pexels.com/search/{query.replace(' ', '%20')}/"
        resp = requests.get(search_url, headers=headers, timeout=15)
        if resp.status_code == 200:
            # Extract image URLs from HTML
            import re
            # Look for Pexels image URLs in various formats
            patterns = [
                r'https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpeg[^"\'>\s]+',
                r'https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpg[^"\'>\s]+',
                r'https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.png[^"\'>\s]+',
            ]
            urls = []
            for pattern in patterns:
                urls.extend(re.findall(pattern, resp.text))
            
            # Deduplicate
            seen = set()
            unique_urls = []
            for u in urls:
                base = u.split("?")[0]
                if base not in seen:
                    seen.add(base)
                    unique_urls.append(u)
            
            if unique_urls:
                # Try first URL with size parameters
                img_url = unique_urls[0]
                if "?" not in img_url:
                    img_url += "?auto=compress&cs=tinrgb&w=600&h=800&dpr=1"
                img_resp = requests.get(img_url, headers=headers, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 5000:
                    with open(output_path, "wb") as f:
                        f.write(img_resp.content)
                    return True
    except Exception as e:
        pass
    return False

def download_from_unsplash(query, output_path):
    """Try Unsplash direct download"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
        # Search Unsplash
        search_url = f"https://unsplash.com/napi/search/photos?query={query.replace(' ', '+')}&per_page=5"
        resp = requests.get(search_url, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])
            if results:
                img_url = results[0]["urls"]["regular"]  # 1080w
                img_resp = requests.get(img_url, headers=headers, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 5000:
                    with open(output_path, "wb") as f:
                        f.write(img_resp.content)
                    return True
    except Exception as e:
        pass
    return False

def download_from_loremflickr(query, output_path, seed=0):
    """Download from LoremFlickr with unique seed"""
    try:
        # Use different categories to avoid duplicates
        keywords = query.replace(" ", ",")
        url = f"https://loremflickr.com/600/800/{keywords}?lock={seed}"
        resp = requests.get(url, timeout=15, allow_redirects=True)
        if resp.status_code == 200 and len(resp.content) > 5000:
            # Check if it's actually an image
            content_type = resp.headers.get("content-type", "")
            if "image" in content_type or len(resp.content) > 10000:
                with open(output_path, "wb") as f:
                    f.write(resp.content)
                return True
    except Exception as e:
        pass
    return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success = 0
    failed = []
    
    for num, info in PRODUCTS.items():
        output_path = os.path.join(OUTPUT_DIR, f"product-{num}.jpg")
        query = info["keywords"]
        name = info["name"]
        
        print(f"[{num-12}/32] {name}...", end=" ", flush=True)
        
        downloaded = False
        
        # Try sources in order of quality
        for attempt, source_fn in enumerate([
            ("Unsplash", lambda: download_from_unsplash(query, output_path)),
            ("Pexels", lambda: download_from_pexels_scrape(query, output_path)),
            ("LoremFlickr", lambda: download_from_loremflickr(query, output_path, seed=num*7+attempt)),
        ]):
            try:
                if source_fn[1]():
                    size = os.path.getsize(output_path)
                    print(f"OK ({source_fn[0]}, {size//1024}KB)")
                    downloaded = True
                    success += 1
                    break
            except:
                pass
        
        if not downloaded:
            print("FAILED")
            failed.append(name)
        
        time.sleep(0.5)  # Be polite
    
    print(f"\n{'='*50}")
    print(f"Downloaded: {success}/32")
    if failed:
        print(f"Failed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")

if __name__ == "__main__":
    main()
