import requests
import json
import os
import time
import hashlib

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", "products")

PRODUCTS = {
    14: "wool trousers men",
    15: "linen blazer men",
    20: "slim chinos men",
    21: "vneck tshirt",
    24: "striped polo shirt men",
    27: "pocket tshirt",
    31: "minimalist watch",
    32: "puffer vest men",
    34: "oxford button down shirt men",
    39: "suede chelsea boots",
    40: "printed camp collar shirt",
    41: "wide leg jeans vintage",
    44: "athletic performance shirt men",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def get_existing_hashes():
    hashes = {}
    for i in range(1, 45):
        path = os.path.join(OUTPUT_DIR, f"product-{i}.jpg")
        if os.path.exists(path):
            with open(path, "rb") as f:
                h = hashlib.md5(f.read()).hexdigest()
            hashes.setdefault(h, []).append(i)
    return hashes

def try_pexels_search(query, output_path):
    """Scrape Pexels search page HTML for image URLs"""
    try:
        url = f"https://www.pexels.com/search/{query.replace(' ', '%20')}/"
        resp = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        if resp.status_code != 200:
            return False

        import re
        # Find all pexels photo IDs from image URLs
        photo_ids = re.findall(r'pexels-photo-(\d+)', resp.text)
        # Also try images.pexels.com/photos/ID pattern
        photo_ids += re.findall(r'images\.pexels\.com/photos/(\d+)', resp.text)
        
        # Deduplicate while preserving order
        seen = set()
        unique_ids = []
        for pid in photo_ids:
            if pid not in seen:
                seen.add(pid)
                unique_ids.append(pid)
        
        if not unique_ids:
            return False
        
        for pid in unique_ids[:5]:
            img_url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinrgb&w=600&h=800&fit=crop"
            try:
                img_resp = requests.get(img_url, headers=HEADERS, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 15000:
                    with open(output_path, "wb") as f:
                        f.write(img_resp.content)
                    return True
            except:
                continue
        return False
    except Exception as e:
        return False

def try_unsplash_search(query, output_path):
    """Try Unsplash search page for image URLs"""
    try:
        url = f"https://unsplash.com/s/photos/{query.replace(' ', '-')}"
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code != 200:
            return False

        import re
        # Find photo IDs from unsplash
        photo_ids = re.findall(r'photo-([a-zA-Z0-9_-]{10,15})(?:["\\?/])', resp.text)
        photo_ids += re.findall(r'unsplash\.com/photos/([a-zA-Z0-9_-]{10,15})', resp.text)
        
        seen = set()
        unique_ids = []
        for pid in photo_ids:
            if pid not in seen and len(pid) >= 10:
                seen.add(pid)
                unique_ids.append(pid)
        
        if not unique_ids:
            return False
        
        for pid in unique_ids[:5]:
            img_url = f"https://images.unsplash.com/photo-{pid}?w=600&h=800&fit=crop&q=80"
            try:
                img_resp = requests.get(img_url, headers=HEADERS, timeout=15)
                if img_resp.status_code == 200 and len(img_resp.content) > 15000:
                    ct = img_resp.headers.get("content-type", "")
                    if "image" in ct:
                        with open(output_path, "wb") as f:
                            f.write(img_resp.content)
                        return True
            except:
                continue
        return False
    except:
        return False

def try_pixabay_scrape(query, output_path):
    """Scrape Pixabay search page"""
    try:
        url = f"https://pixabay.com/images/search/{query.replace(' ', '%20')}/"
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code != 200:
            return False

        import re
        # Find image URLs
        img_urls = re.findall(r'(https://cdn\.pixabay\.com/photo/\d{4}/\d{2}/\d{2}/\d{2}/\d{2}/[^"\'>\s]+\.(?:jpg|jpeg|png))', resp.text)
        if not img_urls:
            img_urls = re.findall(r'(https://cdn\.pixabay\.com/photo/[^"\'>\s]+\.(?:jpg|jpeg|png))', resp.text)
        
        seen = set()
        for img_url in img_urls:
            if img_url not in seen:
                seen.add(img_url)
                try:
                    img_resp = requests.get(img_url, headers=HEADERS, timeout=15)
                    if img_resp.status_code == 200 and len(img_resp.content) > 15000:
                        with open(output_path, "wb") as f:
                            f.write(img_resp.content)
                        return True
                except:
                    continue
        return False
    except:
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success = 0
    failed = []
    
    for num, query in PRODUCTS.items():
        output_path = os.path.join(OUTPUT_DIR, f"product-{num}.jpg")
        
        print(f"[{num}] {query}...", end=" ", flush=True)
        
        downloaded = False
        
        for source_name, source_fn in [
            ("Pexels", lambda: try_pexels_search(query, output_path)),
            ("Unsplash", lambda: try_unsplash_search(query, output_path)),
            ("Pixabay", lambda: try_pixabay_scrape(query, output_path)),
        ]:
            if source_fn():
                size = os.path.getsize(output_path)
                print(f"OK ({source_name}, {size//1024}KB)")
                downloaded = True
                success += 1
                break
        
        if not downloaded:
            print("FAILED")
            failed.append((num, query))
        
        time.sleep(1.5)
    
    print(f"\n{'='*50}")
    print(f"Downloaded: {success}/{len(PRODUCTS)}")
    if failed:
        print(f"Failed ({len(failed)}):")
        for num, name in failed:
            print(f"  [{num}] {name}")

if __name__ == "__main__":
    main()
