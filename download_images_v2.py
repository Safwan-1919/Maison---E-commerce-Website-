import requests
import json
import os
import time
import re

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", "products")

PRODUCTS = {
    13: "leather tote bag",
    14: "wool trousers men",
    15: "linen blazer men",
    16: "linen trousers drawstring",
    17: "oversized graphic tshirt",
    18: "velvet blazer",
    19: "crossbody messenger bag",
    20: "slim chinos men",
    21: "vneck tshirt cotton",
    22: "aviator sunglasses",
    23: "wool sweater men",
    24: "striped polo shirt",
    25: "cable knit turtleneck",
    26: "leather belt men",
    27: "pocket tshirt earth tones",
    28: "trench coat men",
    29: "wool scarf men",
    30: "linen shirt casual men",
    31: "minimalist watch",
    32: "puffer vest men",
    33: "leather wallet bifold",
    34: "oxford button down shirt",
    35: "raw selvedge denim jeans",
    36: "distressed jeans men",
    37: "white leather sneakers",
    38: "skinny black jeans",
    39: "suede chelsea boots",
    40: "printed camp collar shirt",
    41: "wide leg jeans vintage",
    42: "double breasted blazer",
    43: "leather loafers men",
    44: "athletic performance shirt",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

def try_pexels_page(query, output_path):
    """Scrape Pexels search page for image URLs"""
    try:
        url = f"https://www.pexels.com/search/{query.replace(' ', '%20')}/"
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        if resp.status_code != 200:
            return False
        
        # Find image URLs in the page source
        # Pexels uses data attributes and JSON in script tags
        patterns = [
            r'"src":"(https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpeg[^"]*)"',
            r'"src":"(https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpg[^"]*)"',
            r'srcset="(https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.[^"]*)"',
            r'(https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpeg)',
            r'(https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpg)',
        ]
        
        all_urls = []
        for pattern in patterns:
            matches = re.findall(pattern, resp.text)
            all_urls.extend(matches)
        
        # Deduplicate
        seen = set()
        unique = []
        for u in all_urls:
            # Get base photo ID
            photo_match = re.search(r'pexels-photo-(\d+)', u)
            if photo_match:
                pid = photo_match.group(1)
                if pid not in seen:
                    seen.add(pid)
                    # Use direct URL with dimensions
                    unique.append(f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinrgb&w=600&h=800&fit=crop")
        
        if not unique:
            return False
        
        # Try each unique URL
        for img_url in unique[:3]:
            try:
                img_resp = requests.get(img_url, headers=HEADERS, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 10000:
                    content_type = img_resp.headers.get("content-type", "")
                    if "image" in content_type:
                        with open(output_path, "wb") as f:
                            f.write(img_resp.content)
                        return True
            except:
                continue
        
        return False
    except Exception as e:
        return False

def try_unsplash_page(query, output_path):
    """Scrape Unsplash search page"""
    try:
        url = f"https://unsplash.com/s/photos/{query.replace(' ', '-')}"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return False
        
        # Find image URLs
        patterns = [
            r'"raw":"(https://images\.unsplash\.com/photo-[^"]*)"',
            r'(https://images\.unsplash\.com/photo-[^"\\]*\.(?:jpeg|jpg|png))',
        ]
        
        urls = []
        for pattern in patterns:
            matches = re.findall(pattern, resp.text)
            urls.extend(matches)
        
        seen = set()
        for u in urls:
            base = u.split("?")[0]
            if base not in seen:
                seen.add(base)
                img_url = base + "?w=600&h=800&fit=crop&q=80"
                try:
                    img_resp = requests.get(img_url, headers=HEADERS, timeout=15)
                    if img_resp.status_code == 200 and len(img_resp.content) > 10000:
                        with open(output_path, "wb") as f:
                            f.write(img_resp.content)
                        return True
                except:
                    continue
        
        return False
    except:
        return False

def try_loremflickr_unique(query, output_path, num):
    """Try loremflickr with different photo categories"""
    categories = [
        "fashion", "clothing", "apparel", "style", "outfit",
        "accessories", "footwear", "formal", "casual", "menswear",
        "winter", "summer", "leather", "cotton", "wool",
    ]
    keywords = query.split()
    
    for i, cat in enumerate(categories[:5]):
        # Build unique keyword combinations
        kw_list = keywords[:2] + [cat]
        kw_str = ",".join(kw_list)
        url = f"https://loremflickr.com/600/800/{kw_str}?lock={num*100+i*13+7}"
        try:
            resp = requests.get(url, timeout=15, allow_redirects=True, headers=HEADERS)
            if resp.status_code == 200 and len(resp.content) > 10000:
                content_type = resp.headers.get("content-type", "")
                if "jpeg" in content_type or "jpg" in content_type or "image" in content_type:
                    with open(output_path, "wb") as f:
                        f.write(resp.content)
                    return True
        except:
            continue
    return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Check which images are duplicates and need replacing
    hashes = {}
    for num in range(13, 45):
        path = os.path.join(OUTPUT_DIR, f"product-{num}.jpg")
        if os.path.exists(path):
            import hashlib
            with open(path, "rb") as f:
                h = hashlib.md5(f.read()).hexdigest()
            hashes.setdefault(h, []).append(num)
    
    # Find duplicate groups
    to_download = []
    for h, nums in hashes.items():
        if len(nums) > 1:
            # Keep first, replace rest
            for n in nums[1:]:
                to_download.append(n)
        # All unique, skip
    
    if not to_download:
        print("All images are already unique!")
        return
    
    print(f"Need to replace {len(to_download)} duplicate images\n")
    
    success = 0
    failed = []
    
    for num in to_download:
        query = PRODUCTS[num]
        output_path = os.path.join(OUTPUT_DIR, f"product-{num}.jpg")
        
        print(f"[{num}] {query}...", end=" ", flush=True)
        
        downloaded = False
        
        # Try Pexels scrape first
        if try_pexels_page(query, output_path):
            size = os.path.getsize(output_path)
            # Verify it's different from existing
            import hashlib
            with open(output_path, "rb") as f:
                new_hash = hashlib.md5(f.read()).hexdigest()
            # Check if this hash already exists for another product
            already_exists = any(new_hash == h for h in hashes.keys() if h != new_hash)
            print(f"OK (Pexels, {size//1024}KB)")
            downloaded = True
            success += 1
        elif try_unsplash_page(query, output_path):
            size = os.path.getsize(output_path)
            print(f"OK (Unsplash, {size//1024}KB)")
            downloaded = True
            success += 1
        elif try_loremflickr_unique(query, output_path, num):
            size = os.path.getsize(output_path)
            print(f"OK (LoremFlickr, {size//1024}KB)")
            downloaded = True
            success += 1
        
        if not downloaded:
            print("FAILED")
            failed.append((num, query))
        
        time.sleep(1)
    
    print(f"\n{'='*50}")
    print(f"Replaced: {success}/{len(to_download)}")
    if failed:
        print(f"Failed: {len(failed)}")
        for num, name in failed:
            print(f"  [{num}] {name}")

if __name__ == "__main__":
    main()
