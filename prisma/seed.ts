import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding MAISON database...\n");

  // ============================================================
  // 1. UPDATE EXISTING CATEGORIES (icons + descriptions)
  // ============================================================
  console.log("📂 Updating categories...");
  const categoryUpdates: Record<string, { icon: string; description: string }> = {
    "T-Shirts": {
      icon: "Shirt",
      description: "Premium cotton tees crafted for everyday comfort and effortless style.",
    },
    Shirts: {
      icon: "Menu",
      description: "From crisp formals to relaxed casuals, find the perfect shirt for every occasion.",
    },
    Blazers: {
      icon: "Briefcase",
      description: "Tailored blazers that define sophistication and modern elegance.",
    },
    Sweaters: {
      icon: "Cloud",
      description: "Luxuriously soft knits to keep you warm in style through every season.",
    },
    Jeans: {
      icon: "Star",
      description: "Premium denim crafted for the perfect fit and lasting durability.",
    },
    Trousers: {
      icon: "MoveHorizontal",
      description: "Versatile trousers that transition seamlessly from office to evening.",
    },
    Outerwear: {
      icon: "Shield",
      description: "Statement outerwear pieces designed to elevate any ensemble.",
    },
    Footwear: {
      icon: "Footprints",
      description: "From sneakers to loafers, step out in style with our curated footwear collection.",
    },
    Bags: {
      icon: "ShoppingBag",
      description: "Functional yet fashionable bags for every need and occasion.",
    },
    Accessories: {
      icon: "Gem",
      description: "The finishing touches that complete your look with refined elegance.",
    },
  };

  for (const [name, data] of Object.entries(categoryUpdates)) {
    await prisma.category.upsert({
      where: { name },
      update: data,
      create: {
        name,
        slug: slugify(name),
        icon: data.icon,
        description: data.description,
      },
    });
  }
  console.log("  ✓ Categories updated\n");

  // ============================================================
  // 2. SEED USERS (8 total)
  // ============================================================
  console.log("👤 Seeding users...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  const usersData = [
    {
      email: "admin@maison.com",
      password: adminHash,
      name: "MAISON Admin",
      phone: "+91 98765 43210",
      role: "admin",
      loyaltyPoints: 0,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Office",
          street: "42, Linking Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          phone: "+91 98765 43210",
        },
      ]),
    },
    {
      email: "staff@maison.com",
      password: staffHash,
      name: "Priya Sharma",
      phone: "+91 98123 45670",
      role: "staff",
      loyaltyPoints: 500,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "15, Park Street",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700016",
          phone: "+91 98123 45670",
        },
      ]),
    },
    {
      email: "arjun.mehta@email.com",
      password: userHash,
      name: "Arjun Mehta",
      phone: "+91 99887 76655",
      role: "user",
      loyaltyPoints: 1200,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "A-12, Juhu Scheme",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400049",
          phone: "+91 99887 76655",
        },
      ]),
    },
    {
      email: "ananya.iyer@email.com",
      password: userHash,
      name: "Ananya Iyer",
      phone: "+91 98765 12345",
      role: "user",
      loyaltyPoints: 850,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "27, 2nd Main Road, Indiranagar",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560038",
          phone: "+91 98765 12345",
        },
        {
          label: "Office",
          street: "WeWork Galaxy, Residency Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560025",
          phone: "+91 98765 12345",
        },
      ]),
    },
    {
      email: "vikram.singh@email.com",
      password: userHash,
      name: "Vikram Singh Rathore",
      phone: "+91 97654 32100",
      role: "user",
      loyaltyPoints: 2100,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "H-45, Greater Kailash II",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110048",
          phone: "+91 97654 32100",
        },
      ]),
    },
    {
      email: "meera.nair@email.com",
      password: userHash,
      name: "Meera Nair",
      phone: "+91 94456 78901",
      role: "user",
      loyaltyPoints: 640,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "TC 14/2345, Jawahar Nagar",
          city: "Trivandrum",
          state: "Kerala",
          pincode: "695003",
          phone: "+91 94456 78901",
        },
      ]),
    },
    {
      email: "rohan.kulkarni@email.com",
      password: userHash,
      name: "Rohan Kulkarni",
      phone: "+91 91234 56789",
      role: "user",
      loyaltyPoints: 1750,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "Flat 301, Solitaire Towers",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          phone: "+91 91234 56789",
        },
      ]),
    },
    {
      email: "isha.gupta@email.com",
      password: userHash,
      name: "Isha Gupta",
      phone: "+91 99876 54321",
      role: "user",
      loyaltyPoints: 430,
      isVerified: true,
      addresses: JSON.stringify([
        {
          label: "Home",
          street: "B-7, Civil Lines",
          city: "Jaipur",
          state: "Rajasthan",
          pincode: "302001",
          phone: "+91 99876 54321",
        },
      ]),
    },
  ];

  const users: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    users[u.email] = user.id;
    console.log(`  ✓ ${u.name} (${u.role})`);
  }
  console.log();

  // ============================================================
  // 3. LOOKUP EXISTING CATEGORIES & BRANDS BY NAME
  // ============================================================
  console.log("🔍 Looking up categories and brands...");

  const allCategories = await prisma.category.findMany();
  const categoryMap: Record<string, string> = {};
  for (const c of allCategories) {
    categoryMap[c.name] = c.id;
  }
  console.log(`  Found ${allCategories.length} categories`);

  // ============================================================
  // 3b. SEED BRANDS (if empty)
  // ============================================================
  const existingBrands = await prisma.brand.findMany();
  if (existingBrands.length === 0) {
    console.log("🏷️  Seeding brands...");
    const brandNames = [
      "H&M", "ZARA", "Uniqlo", "Levi's", "Arrow", "Allen Solly", "Peter England",
      "Hugo Boss", "Armani Exchange", "Van Heusen", "Marks & Spencer", "Wrangler",
      "Pepe Jeans", "Blackberrys", "United Colors of Benetton", "Nike", "Adidas",
      "Steve Madden", "Clarks", "Puma", "Tommy Hilfiger", "Titan", "Fossil",
      "MAISON Basics", "MAISON Essentials", "MAISON",
    ];
    for (const name of brandNames) {
      await prisma.brand.create({
        data: { name, slug: slugify(name) },
      });
    }
    console.log(`  ✓ Created ${brandNames.length} brands\n`);
  }

  const allBrands = await prisma.brand.findMany();
  const brandMap: Record<string, string> = {};
  for (const b of allBrands) {
    brandMap[b.name] = b.id;
  }
  console.log(`  Found ${allBrands.length} brands`);
  console.log(`  Categories: ${Object.keys(categoryMap).join(", ")}`);
  console.log(`  Brands: ${Object.keys(brandMap).join(", ")}`);
  console.log();

  // Helper to pick a random brand
  const brandNames = Object.keys(brandMap);
  function pickBrand(categoryName: string): string {
    const brandsByCategory: Record<string, string[]> = {
      "T-Shirts": ["H&M", "ZARA", "Uniqlo", "Levi's", "MAISON Basics"],
      Shirts: ["H&M", "ZARA", "Arrow", "Allen Solly", "Peter England"],
      Blazers: ["ZARA", "Hugo Boss", "Armani Exchange", "Allen Solly", "Van Heusen"],
      Sweaters: ["Uniqlo", "H&M", "ZARA", "Marks & Spencer", "MAISON Essentials"],
      Jeans: ["Levi's", "H&M", "ZARA", "Wrangler", "Pepe Jeans"],
      Trousers: ["H&M", "ZARA", "Arrow", "Allen Solly", "Blackberrys"],
      Outerwear: ["ZARA", "H&M", "Hugo Boss", "United Colors of Benetton", "Marks & Spencer"],
      Footwear: ["Nike", "Adidas", "Steve Madden", "Clarks", "Puma"],
      Bags: ["H&M", "ZARA", "MAISON", "Steve Madden", "Tommy Hilfiger"],
      Accessories: ["H&M", "ZARA", "Titan", "Fossil", "MAISON"],
    };
    const list = brandsByCategory[categoryName] || brandNames;
    const valid = list.filter((b) => brandMap[b]);
    return valid[Math.floor(Math.random() * valid.length)] || brandNames[0];
  }

  // ============================================================
  // 4. SEED PRODUCTS (add ~44 more to reach 60+)
  // ============================================================
  console.log("🛍️  Seeding products...");

  const newProducts = [
    // T-Shirts (add ~6 more)
    {
      name: "Essential Crew Neck Tee",
      category: "T-Shirts",
      description: "A wardrobe essential crafted from premium Supima cotton with a relaxed fit. The clean crew neckline and soft hand feel make it perfect for everyday wear. Pairs effortlessly with jeans or chinos.",
      price: 1299,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["White","Black","Navy","Grey"]',
      material: "100% Supima Cotton, 180 GSM",
      care: "Machine wash cold, tumble dry low",
      tags: "essentials,cotton,basic,crew neck",
      flags: { isBestSeller: true },
    },
    {
      name: "Oversized Graphic Print Tee",
      category: "T-Shirts",
      description: "Make a statement with this oversized tee featuring an original abstract graphic print. Drop shoulders and a boxy silhouette give it a contemporary streetwear vibe. Made from heavyweight organic cotton.",
      price: 1899,
      sizes: '["M","L","XL","XXL"]',
      colors: '["Washed Black","Cream","Olive"]',
      material: "100% Organic Cotton, 240 GSM",
      care: "Machine wash cold inside out, hang dry",
      tags: "graphic,oversized,streetwear,organic",
      flags: { isTrending: true, isNew: true },
    },
    {
      name: "Slim Fit V-Neck Tee",
      category: "T-Shirts",
      description: "This slim fit V-neck tee flatters the physique with its tailored cut. The micro-ribbed fabric adds subtle texture while maintaining stretch comfort. Ideal for layering or wearing solo on warm days.",
      price: 1499,
      sizes: '["S","M","L","XL"]',
      colors: '["Black","White","Burgundy","Teal"]',
      material: "95% Cotton, 5% Elastane, 160 GSM",
      care: "Machine wash cold, do not bleach",
      tags: "v-neck,slim fit,ribbed,stretch",
      flags: {},
    },
    {
      name: "Striped Polo T-Shirt",
      category: "T-Shirts",
      description: "Elevate your casual rotation with this classic striped polo. The piqué cotton fabric and contrast collar detailing lend a refined touch. Perfect for smart-casual Fridays or weekend brunches.",
      price: 2199,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["Navy/White","Red/White","Green/White"]',
      material: "100% Cotton Piqué, 220 GSM",
      care: "Machine wash warm, iron medium",
      tags: "polo,striped,smart casual,piqué",
      flags: { isFeatured: true },
    },
    {
      name: "Pocket Tee in Earthy Tones",
      category: "T-Shirts",
      description: "Minimalist design meets earthy sophistication in this pocket tee. The single chest pocket and relaxed fit create an understated look. Garment-dyed for a rich, lived-in colour that gets better with every wash.",
      price: 1599,
      sizes: '["S","M","L","XL"]',
      colors: '["Sage","Terracotta","Sand","Charcoal"]',
      material: "100% Cotton, Garment Dyed, 200 GSM",
      care: "Wash separately first time, tumble dry low",
      tags: "pocket,earthy,garment dyed,minimal",
      flags: { isNew: true },
    },
    {
      name: "Performance Quick-Dry Tee",
      category: "T-Shirts",
      description: "Engineered for active lifestyles, this tee features moisture-wicking fabric and four-way stretch. The anti-odour finish keeps you fresh through long days. Seam-free construction minimises chafing.",
      price: 1799,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["Black","Grey","Navy","White"]',
      material: "88% Polyester, 12% Spandex",
      care: "Machine wash cold, do not iron print area",
      tags: "performance,quick dry,active,moisture wicking",
      flags: { isTrending: true },
    },

    // Shirts (add ~5 more)
    {
      name: "Linen Blend Casual Shirt",
      category: "Shirts",
      description: "Embrace relaxed elegance with this linen-cotton blend shirt. The natural texture and breathable fabric make it ideal for Indian summers. Roll up the sleeves for an effortlessly cool look.",
      price: 2499,
      sizes: '["S","M","L","XL"]',
      colors: '["White","Sky Blue","Sage Green","Sand"]',
      material: "55% Linen, 45% Cotton",
      care: "Gentle machine wash, hang dry, warm iron",
      tags: "linen,summer,relaxed,blend",
      flags: { isFeatured: true, isBestSeller: true },
    },
    {
      name: "Slim Fit Oxford Button-Down",
      category: "Shirts",
      description: "The quintessential Oxford button-down reimagined with a modern slim fit. Premium long-staple cotton ensures a smooth, lustrous finish. A timeless piece that works from boardroom to bar.",
      price: 2899,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["White","Light Blue","Pink","Chambray"]',
      material: "100% Cotton Oxford, 180 GSM",
      care: "Machine wash warm, iron on medium",
      tags: "oxford,button down,formal,slim fit",
      flags: { isBestSeller: true },
    },
    {
      name: "Mandarin Collar Kurta Shirt",
      category: "Shirts",
      description: "Where Indian heritage meets contemporary design. This mandarin collar shirt features a straight cut with side slits for ease of movement. Crafted from soft cotton with subtle dobby weave texture.",
      price: 2199,
      sizes: '["S","M","L","XL"]',
      colors: '["Ivory","Indigo","Olive","Dusty Rose"]',
      material: "100% Cotton Dobby Weave",
      care: "Machine wash cold, tumble dry low",
      tags: "mandarin collar,kurta,indian wear,dobby",
      flags: { isTrending: true, isNew: true },
    },
    {
      name: "Flannel Check Shirt",
      category: "Shirts",
      description: "Stay cosy in this brushed flannel check shirt with a relaxed fit. Double-brushed for maximum softness against the skin. Features two chest pockets and durable button closure throughout.",
      price: 1999,
      sizes: '["M","L","XL","XXL"]',
      colors: '["Red Check","Blue Check","Green Check","Brown Check"]',
      material: "100% Cotton Flannel, 200 GSM",
      care: "Machine wash warm, do not bleach, iron low",
      tags: "flannel,check,winter,brushed",
      flags: {},
    },
    {
      name: "Printed Camp Collar Shirt",
      category: "Shirts",
      description: "Vacation-ready camp collar shirt with an all-over tropical print. The loose, airy fit and revere collar channel effortless resort style. Tuck it in or leave it untucked — either way, you win.",
      price: 2699,
      sizes: '["S","M","L","XL"]',
      colors: '["White Print","Blue Print","Green Print"]',
      material: "100% Viscose Rayon",
      care: "Hand wash or gentle machine wash, hang dry",
      tags: "camp collar,printed,resort,tropical",
      flags: { isNew: true, isFlashDeal: true },
    },

    // Blazers (add ~4 more)
    {
      name: "Double-Breasted Wool Blazer",
      category: "Blazers",
      description: "Command attention in this impeccably tailored double-breasted blazer. Constructed from premium wool blend fabric with a half-canvas construction. Peak lapels and gold-tone buttons add distinguished flair.",
      price: 12499,
      sizes: '["S","M","L","XL"]',
      colors: '["Charcoal","Navy","Black"]',
      material: "70% Wool, 28% Polyester, 2% Elastane",
      care: "Dry clean only, store on wooden hanger",
      tags: "double breasted,wool,formal,peak lapel",
      flags: { isFeatured: true },
    },
    {
      name: "Unstructured Linen Blazer",
      category: "Blazers",
      description: "The ultimate summer blazer — unlined and crafted from pure linen for maximum breathability. The relaxed, deconstructed silhouette pairs beautifully with a simple tee and chinos. Effortless sophistication at its best.",
      price: 8999,
      sizes: '["S","M","L","XL"]',
      colors: '["Natural","Sage","Navy"]',
      material: "100% Linen",
      care: "Dry clean recommended, gentle iron",
      tags: "unstructured,linen,summer,deconstructed",
      flags: { isTrending: true, isNew: true },
    },
    {
      name: "Velvet Dinner Blazer",
      category: "Blazers",
      description: "Make a grand entrance in this plush velvet blazer. The rich texture and shawl collar create an unmistakably luxurious aesthetic. Perfect for weddings, galas, and memorable evenings out.",
      price: 15999,
      sizes: '["M","L","XL"]',
      colors: '["Burgundy","Emerald","Midnight Blue","Black"]',
      material: "100% Cotton Velvet, Satin Lining",
      care: "Dry clean only, steam to remove wrinkles",
      tags: "velvet,dinner jacket,party,luxury",
      flags: { isFeatured: true, isFlashDeal: true },
    },
    {
      name: "Cotton Chino Blazer",
      category: "Blazers",
      description: "A versatile blazer in cotton chino fabric that bridges the gap between smart and casual. Patch pockets and a soft shoulder give it a relaxed yet polished demeanour. Your go-to for smart-casual occasions.",
      price: 7499,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["Khaki","Olive","Navy","Stone"]',
      material: "98% Cotton, 2% Elastane",
      care: "Machine wash cold, iron medium, do not tumble dry",
      tags: "chino,casual blazer,patch pocket,versatile",
      flags: { isBestSeller: true },
    },

    // Sweaters (add ~4 more)
    {
      name: "Merino Wool Crew Neck Sweater",
      category: "Sweaters",
      description: "Ultra-fine merino wool knit in a classic crew neck silhouette. Naturally temperature-regulating and odour-resistant, this sweater keeps you comfortable all day. The smooth finish resists pilling wash after wash.",
      price: 3999,
      sizes: '["S","M","L","XL"]',
      colors: '["Black","Navy","Oatmeal","Burgundy"]',
      material: "100% Extra Fine Merino Wool",
      care: "Hand wash cold, lay flat to dry",
      tags: "merino,crew neck,warm,fine knit",
      flags: { isBestSeller: true },
    },
    {
      name: "Cable Knit Turtleneck",
      category: "Sweaters",
      description: "A chunky cable knit turtleneck that exudes old-world charm. The generous turtleneck collar provides cosy warmth while the textured pattern adds visual depth. Layer it under a blazer for a preppy winter look.",
      price: 5499,
      sizes: '["S","M","L","XL"]',
      colors: '["Cream","Grey","Forest Green","Navy"]',
      material: "60% Wool, 40% Acrylic",
      care: "Hand wash cold, reshape and lay flat to dry",
      tags: "cable knit,turtleneck,chunky,winter",
      flags: { isFeatured: true },
    },
    {
      name: "Cashmere Blend V-Neck",
      category: "Sweaters",
      description: "Indulge in the buttery softness of this cashmere-cotton blend V-neck. Lightweight yet incredibly warm, it layers beautifully over collared shirts. An investment piece that elevates any wardrobe.",
      price: 7999,
      sizes: '["S","M","L","XL"]',
      colors: '["Camel","Light Grey","Black","Ivory"]',
      material: "30% Cashmere, 70% Cotton",
      care: "Dry clean or hand wash in cold water with wool detergent",
      tags: "cashmere,v-neck,luxury,lightweight",
      flags: { isNew: true, isTrending: true },
    },
    {
      name: "Colour Block Pullover",
      category: "Sweaters",
      description: "A modern colour block pullover that adds a playful pop to your winter wardrobe. The relaxed fit and ribbed hem and cuffs ensure all-day comfort. Crafted from a soft cotton-acrylic blend for easy care.",
      price: 2499,
      sizes: '["M","L","XL","XXL"]',
      colors: '["Navy/Grey","Burgundy/Navy","Green/Cream"]',
      material: "60% Cotton, 40% Acrylic",
      care: "Machine wash cold, tumble dry low",
      tags: "colour block,pullover,casual,ribbed",
      flags: {},
    },

    // Jeans (add ~5 more)
    {
      name: "Slim Tapered Selvedge Denim",
      category: "Jeans",
      description: "Premium Japanese selvedge denim in a slim tapered cut that narrows from thigh to hem. The raw indigo fabric develops unique fading patterns over time. A must-have for denim enthusiasts.",
      price: 5499,
      sizes: '["28","30","32","34","36"]',
      colors: '["Raw Indigo","Black","Washed Blue"]',
      material: "100% Cotton Selvedge Denim, 14oz",
      care: "Wash inside out, cold water, air dry",
      tags: "selvedge,slim taper,raw denim,japanese",
      flags: { isFeatured: true },
    },
    {
      name: "Relaxed Fit Distressed Jeans",
      category: "Jeans",
      description: "Laid-back distressed jeans with vintage-inspired fading and strategic rips. The relaxed fit through the seat and thigh ensures all-day comfort. Style with a graphic tee and sneakers for an effortless weekend look.",
      price: 3299,
      sizes: '["30","32","34","36","38"]',
      colors: '["Medium Wash","Light Wash"]',
      material: "98% Cotton, 2% Elastane",
      care: "Machine wash cold inside out, do not bleach",
      tags: "distressed,relaxed fit,vintage,faded",
      flags: { isTrending: true },
    },
    {
      name: "Skinny Fit Black Jeans",
      category: "Jeans",
      description: "A wardrobe staple — the perfect black skinny jean that goes with absolutely everything. The high-stretch fabric moves with you while maintaining its shape. Sleek enough for nights out, casual enough for daily wear.",
      price: 2799,
      sizes: '["28","30","32","34","36"]',
      colors: '["Black","Washed Black"]',
      material: "92% Cotton, 6% Polyester, 2% Elastane",
      care: "Machine wash cold, tumble dry low",
      tags: "skinny,black,stretch,versatile",
      flags: { isBestSeller: true },
    },
    {
      name: "Wide Leg Vintage Jeans",
      category: "Jeans",
      description: "Channel retro vibes with these wide-leg jeans featuring a high waist and full leg opening. The heavyweight denim holds its structure beautifully. Pair with a tucked-in blouse or cropped sweater.",
      price: 3799,
      sizes: '["28","30","32","34","36"]',
      colors: '["Dark Indigo","Light Vintage"]',
      material: "100% Cotton, 12oz Denim",
      care: "Machine wash cold, air dry to preserve colour",
      tags: "wide leg,vintage,high waist,retro",
      flags: { isNew: true },
    },
    {
      name: "Carpenter Jeans",
      category: "Jeans",
      description: "Workwear-inspired carpenter jeans with utility pockets and a hammer loop. The straight fit and durable construction make them as functional as they are stylish. A rugged addition to any denim collection.",
      price: 3499,
      sizes: '["30","32","34","36"]',
      colors: '["Rinse Wash","Brown"]',
      material: "100% Cotton, 14oz Denim",
      care: "Machine wash cold, tumble dry medium",
      tags: "carpenter,utility,workwear,straight fit",
      flags: {},
    },

    // Trousers (add ~4 more)
    {
      name: "Pleated Wool Trousers",
      category: "Trousers",
      description: "Impeccably tailored pleated trousers in a premium wool blend. The double pleats create a sophisticated drape while the tapered leg keeps the silhouette modern. An essential for formal and business-casual wardrobes.",
      price: 4999,
      sizes: '["28","30","32","34","36"]',
      colors: '["Charcoal","Navy","Camel","Black"]',
      material: "65% Wool, 33% Polyester, 2% Elastane",
      care: "Dry clean recommended, iron on medium",
      tags: "pleated,wool,formal,tapered",
      flags: { isFeatured: true },
    },
    {
      name: "Drawstring Linen Trousers",
      category: "Trousers",
      description: "Effortlessly cool drawstring trousers in breathable linen. The elasticated waist and relaxed leg offer unbeatable comfort without sacrificing style. Perfect for resort wear or relaxed weekends at home.",
      price: 2299,
      sizes: '["S","M","L","XL"]',
      colors: '["White","Natural","Navy","Olive"]',
      material: "100% Linen",
      care: "Gentle machine wash, hang dry, warm iron",
      tags: "drawstring,linen,relaxed,summer",
      flags: { isTrending: true, isNew: true },
    },
    {
      name: "Slim Fit Chinos",
      category: "Trousers",
      description: "The perfect everyday chino with a slim fit that sits comfortably at the waist. Garment-washed for a soft hand feel from day one. Features a zip fly, button closure, and slant side pockets.",
      price: 2499,
      sizes: '["28","30","32","34","36"]',
      colors: '["Khaki","Navy","Olive","Burgundy","Stone"]',
      material: "98% Cotton, 2% Elastane",
      care: "Machine wash cold, tumble dry low",
      tags: "chino,slim fit,garment washed,essential",
      flags: { isBestSeller: true },
    },
    {
      name: "Cargo Trousers",
      category: "Trousers",
      description: "Utility-inspired cargo trousers with multiple pockets and a tapered leg. The ripstop cotton fabric is lightweight yet durable, perfect for outdoor adventures. Cinchable ankle cuffs let you adjust the silhouette.",
      price: 2999,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["Olive","Black","Khaki","Charcoal"]',
      material: "100% Cotton Ripstop",
      care: "Machine wash cold, do not bleach, iron low",
      tags: "cargo,utility,tapered,ripstop",
      flags: { isTrending: true },
    },

    // Outerwear (add ~4 more)
    {
      name: "Bomber Jacket",
      category: "Outerwear",
      description: "A modern take on the classic bomber jacket with a satin-finish shell and quilted lining. Ribbed collar, cuffs, and hem provide a snug fit. The zip-front closure and snap pockets add functional style.",
      price: 6999,
      sizes: '["S","M","L","XL"]',
      colors: '["Black","Navy","Olive","Burgundy"]',
      material: "Shell: 100% Nylon, Lining: 100% Polyester",
      care: "Machine wash cold, tumble dry low, do not iron",
      tags: "bomber,satin,quilted,classic",
      flags: { isFeatured: true, isBestSeller: true },
    },
    {
      name: "Trench Coat",
      category: "Outerwear",
      description: "A timeless double-breasted trench coat with all the signature details — storm flap, epaulettes, and gun flaps. The water-resistant cotton gabardine keeps you dry in style. Belt it for a defined silhouette.",
      price: 12999,
      sizes: '["S","M","L","XL"]',
      colors: '["Khaki","Black","Navy"]',
      material: "65% Cotton, 35% Polyester Gabardine",
      care: "Dry clean recommended, hang on sturdy hanger",
      tags: "trench,double breasted,water resistant,classic",
      flags: { isFeatured: true },
    },
    {
      name: "Quilted Puffer Vest",
      category: "Outerwear",
      description: "Lightweight and packable, this quilted puffer vest adds an extra layer of warmth without bulk. The high-fill recycled polyester insulation delivers exceptional heat retention. Ideal for layering over sweaters.",
      price: 4499,
      sizes: '["S","M","L","XL","XXL"]',
      colors: '["Black","Navy","Olive","Wine"]',
      material: "Shell: 100% Recycled Nylon, Fill: Recycled Polyester",
      care: "Machine wash cold, tumble dry low with tennis balls",
      tags: "puffer,vest,quilted,recycled",
      flags: { isNew: true },
    },
    {
      name: "Denim Trucker Jacket",
      category: "Outerwear",
      description: "An iconic trucker jacket crafted from heavyweight selvedge denim. The boxy fit and button-front closure give it a rugged, authentic character. Sherpa-lined for extra warmth on chilly days.",
      price: 5999,
      sizes: '["S","M","L","XL"]',
      colors: '["Indigo","Washed Blue","Black"]',
      material: "100% Cotton Denim, 14oz with Sherpa Lining",
      care: "Machine wash cold separately, air dry",
      tags: "trucker,denim,sherpa,classic",
      flags: { isTrending: true, isFlashDeal: true },
    },

    // Footwear (add ~4 more)
    {
      name: "White Leather Sneakers",
      category: "Footwear",
      description: "Minimalist white leather sneakers that go with literally everything. The premium full-grain leather upper develops a beautiful patina over time. Cushioned insole and rubber outsole ensure all-day walking comfort.",
      price: 4999,
      sizes: '["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]',
      colors: '["White","White/Gum","White/Navy"]',
      material: "Full Grain Leather Upper, Rubber Outsole",
      care: "Wipe with damp cloth, use leather conditioner monthly",
      tags: "sneakers,leather,white,minimalist",
      flags: { isBestSeller: true, isFeatured: true },
    },
    {
      name: "Suede Chelsea Boots",
      category: "Footwear",
      description: "Classic Chelsea boots in buttery suede with elastic side panels for easy on-off. The stacked heel and almond toe create a refined silhouette. Resoleable Goodyear welt construction for years of wear.",
      price: 8999,
      sizes: '["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]',
      colors: '["Tan","Dark Brown","Navy","Black"]',
      material: "Premium Suede Upper, Leather Sole, Goodyear Welt",
      care: "Apply suede protector spray, brush regularly",
      tags: "chelsea boots,suede,goodyear welt,classic",
      flags: { isFeatured: true },
    },
    {
      name: "Canvas Low-Top Sneakers",
      category: "Footwear",
      description: "Casual canvas low-tops inspired by vintage tennis shoes. The organic cotton canvas upper and vulcanised rubber sole offer a timeless look. Lightweight and flexible, they are your go-to for everyday casual wear.",
      price: 2499,
      sizes: '["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"]',
      colors: '["White","Black","Navy","Red","Green"]',
      material: "Organic Cotton Canvas, Vulcanised Rubber Sole",
      care: "Spot clean, air dry, do not machine wash",
      tags: "canvas,low top,casual,vintage",
      flags: {},
    },
    {
      name: "Leather Loafers",
      category: "Footwear",
      description: "Sophisticated penny loafers crafted from polished calf leather. The blake-stitched construction provides a sleek, low-profile sole. Slip them on for instant polish — no laces required.",
      price: 7499,
      sizes: '["UK 6","UK 7","UK 8","UK 9","UK 10"]',
      colors: '["Brown","Black","Burgundy"]',
      material: "Calf Leather Upper, Leather Sole, Blake Stitched",
      care: "Polish with matching shoe cream, use cedar shoe trees",
      tags: "loafers,penny,leather,formal",
      flags: { isTrending: true },
    },

    // Bags (add ~3 more)
    {
      name: "Leather Tote Bag",
      category: "Bags",
      description: "A spacious full-grain leather tote that transitions effortlessly from office to weekend. The unlined interior maximises capacity while the structured base keeps it upright. Features an interior zip pocket and magnetic closure.",
      price: 8999,
      sizes: '["One Size"]',
      colors: '["Tan","Black","Brown","Cognac"]',
      material: "Full Grain Vegetable-Tanned Leather",
      care: "Wipe with soft cloth, condition every 3 months",
      tags: "tote,leather,spacious,versatile",
      flags: { isFeatured: true, isBestSeller: true },
    },
    {
      name: "Canvas Backpack",
      category: "Bags",
      description: "Rugged waxed canvas backpack with leather accent straps and brass hardware. The roll-top design adjusts to your load while the padded laptop compartment protects your tech. Perfect for daily commute or weekend getaways.",
      price: 4499,
      sizes: '["One Size"]',
      colors: '["Olive","Navy","Charcoal","Tan"]',
      material: "Waxed Cotton Canvas, Genuine Leather Accents",
      care: "Spot clean canvas, condition leather parts",
      tags: "backpack,canvas,waxed,laptop",
      flags: { isTrending: true },
    },
    {
      name: "Crossbody Messenger Bag",
      category: "Bags",
      description: "A sleek crossbody messenger in premium nylon with leather trim. The adjustable strap and quick-release buckle offer easy access on the go. Multiple compartments keep your essentials organised.",
      price: 3499,
      sizes: '["One Size"]',
      colors: '["Black","Navy","Olive"]',
      material: "Ballistic Nylon, Leather Trim, YKK Zippers",
      care: "Wipe with damp cloth, spot clean",
      tags: "crossbody,messenger,nylon,compact",
      flags: {},
    },

    // Accessories (add ~5 more)
    {
      name: "Classic Aviator Sunglasses",
      category: "Accessories",
      description: "Timeless aviator sunglasses with gradient lenses and a lightweight metal frame. UV400 protection keeps your eyes safe while the teardrop shape flatters every face. Comes in a hard-shell case.",
      price: 2999,
      sizes: '["One Size"]',
      colors: '["Gold/Green","Silver/Blue","Black/Grey","Gold/Brown"]',
      material: "Stainless Steel Frame, CR-39 Lenses, UV400",
      care: "Clean with microfiber cloth, store in case",
      tags: "sunglasses,aviator,UV400,classic",
      flags: { isBestSeller: true, isTrending: true },
    },
    {
      name: "Leather Belt",
      category: "Accessories",
      description: "Handcrafted full-grain leather belt with a brushed nickel buckle. The leather develops a rich patina with age, making each belt uniquely yours. A wardrobe essential that pairs with jeans or trousers alike.",
      price: 1999,
      sizes: '["32","34","36","38","40"]',
      colors: '["Black","Brown","Tan"]',
      material: "Full Grain Leather, Nickel Buckle",
      care: "Wipe clean, apply leather conditioner occasionally",
      tags: "belt,leather,essential,nickel",
      flags: { isBestSeller: true },
    },
    {
      name: "Wool Blend Scarf",
      category: "Accessories",
      description: "Luxuriously soft wool-cashmere blend scarf in a generous size for versatile wrapping. The subtle herringbone pattern adds sophistication without being overwhelming. A thoughtful gift for someone special — or yourself.",
      price: 2499,
      sizes: '["One Size"]',
      colors: '["Charcoal","Camel","Navy","Burgundy"]',
      material: "70% Wool, 30% Cashmere",
      care: "Dry clean or hand wash in cold water with wool detergent",
      tags: "scarf,wool,cashmere,winter",
      flags: { isNew: true },
    },
    {
      name: "Minimalist Watch",
      category: "Accessories",
      description: "A refined minimalist watch with a Japanese quartz movement and sapphire crystal glass. The ultra-thin case and genuine leather strap create an understated elegance that suits any occasion. Water-resistant to 30 metres.",
      price: 6999,
      sizes: '["One Size"]',
      colors: '["Silver/Black","Gold/Brown","Rose Gold/Navy"]',
      material: "316L Stainless Steel Case, Sapphire Crystal, Leather Strap",
      care: "Avoid extreme temperatures, service every 3-5 years",
      tags: "watch,minimalist,quartz,sapphire",
      flags: { isFeatured: true },
    },
    {
      name: "Leather Wallet",
      category: "Accessories",
      description: "Slim bifold wallet crafted from genuine pebbled leather with RFID-blocking technology. Features 6 card slots, 2 bill compartments, and a hidden pocket. Compact enough for front-pocket carry.",
      price: 1499,
      sizes: '["One Size"]',
      colors: '["Black","Brown","Tan","Navy"]',
      material: "Pebbled Leather, RFID-Blocking Lining",
      care: "Wipe with soft cloth, avoid prolonged sun exposure",
      tags: "wallet,bifold,leather,RFID",
      flags: {},
    },
  ];

  let productCount = 0;
  for (const p of newProducts) {
    const mrp = Math.round(p.price * (1 + 0.1 + Math.random() * 0.35));
    const discount = Math.round((1 - p.price / mrp) * 100);
    const slug = slugify(p.name);
    const brand = pickBrand(p.category);

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        mrp,
        category: p.category,
        brand,
        sizes: p.sizes,
        colors: p.colors,
        images: JSON.stringify([
          `/images/products/${slug}-1.jpg`,
          `/images/products/${slug}-2.jpg`,
          `/images/products/${slug}-3.jpg`,
        ]),
        stock: Math.floor(Math.random() * 80) + 5,
        material: p.material,
        care: p.care,
        tags: p.tags,
        discount,
        isFeatured: p.flags.isFeatured || false,
        isNew: p.flags.isNew || false,
        isTrending: p.flags.isTrending || false,
        isBestSeller: p.flags.isBestSeller || false,
        isFlashDeal: p.flags.isFlashDeal || false,
        categoryId: categoryMap[p.category] || null,
        brandId: brandMap[brand] || null,
      },
    });
    productCount++;
  }
  console.log(`  ✓ Added ${productCount} new products\n`);

  // Get all products for orders & reviews
  const allProducts = await prisma.product.findMany({ select: { id: true, name: true, category: true, price: true, slug: true, images: true } });
  console.log(`  Total products now: ${allProducts.length}\n`);

  // ============================================================
  // 5. SEED ORDERS (12 orders)
  // ============================================================
  console.log("📦 Seeding orders...");

  const orderStatuses = ["pending", "confirmed", "shipped", "delivered", "delivered", "delivered", "cancelled"];
  const paymentMethods = ["razorpay", "upi", "card", "cod"];
  const paymentStatuses = ["paid", "paid", "paid", "pending", "refunded"];

  const ordersData = [];
  for (let i = 0; i < 12; i++) {
    const isGuest = i % 4 === 3;
    const userId = isGuest ? null : Object.values(users)[(i % 6) + 1]; // skip admin
    const numItems = 1 + Math.floor(Math.random() * 3);
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
      const sizeArr = JSON.parse(prod.images ? "[]" : "[]"); // we don't have sizes easily
      const qty = 1 + Math.floor(Math.random() * 2);
      const itemPrice = prod.price;
      subtotal += itemPrice * qty;
      items.push({
        productId: prod.id,
        name: prod.name,
        price: itemPrice,
        quantity: qty,
        size: "M",
        color: "Default",
        image: `/images/products/${prod.slug}-1.jpg`,
      });
    }

    const shipping = subtotal > 2000 ? 0 : 149;
    const discount = i % 5 === 0 ? Math.min(500, subtotal * 0.15) : 0;
    const total = subtotal - discount + shipping;
    const status = orderStatuses[i % orderStatuses.length];
    const payMethod = paymentMethods[i % paymentMethods.length];
    const payStatus = status === "cancelled" ? "refunded" : status === "pending" ? "pending" : "paid";

    const addresses = [
      { name: "Arjun Mehta", street: "A-12, Juhu Scheme", city: "Mumbai", state: "Maharashtra", pincode: "400049", phone: "+91 99887 76655" },
      { name: "Ananya Iyer", street: "27, 2nd Main Road, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038", phone: "+91 98765 12345" },
      { name: "Vikram Singh", street: "H-45, Greater Kailash II", city: "New Delhi", state: "Delhi", pincode: "110048", phone: "+91 97654 32100" },
      { name: "Meera Nair", street: "TC 14/2345, Jawahar Nagar", city: "Trivandrum", state: "Kerala", pincode: "695003", phone: "+91 94456 78901" },
      { name: "Rohan Kulkarni", street: "Flat 301, Solitaire Towers", city: "Pune", state: "Maharashtra", pincode: "411001", phone: "+91 91234 56789" },
      { name: "Isha Gupta", street: "B-7, Civil Lines", city: "Jaipur", state: "Rajasthan", pincode: "302001", phone: "+91 99876 54321" },
    ];

    const addr = addresses[i % addresses.length];
    const orderNum = `MSN-2025-${String(10001 + i).padStart(5, "0")}`;

    ordersData.push({
      orderNumber: orderNum,
      userId,
      status,
      total: Math.round(total * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping,
      shippingAddress: JSON.stringify(addr),
      paymentMethod: payMethod,
      paymentStatus: payStatus,
      couponCode: discount > 0 ? "WELCOME15" : null,
      items,
    });
  }

  for (const order of ordersData) {
    const created = await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: {
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        couponCode: order.couponCode,
        items: {
          create: order.items,
        },
      },
    });
    console.log(`  ✓ Order ${created.orderNumber} (${created.status}, ${order.items.length} items)`);
  }
  console.log();

  // ============================================================
  // 6. SEED REVIEWS (add ~18 more to reach ~30)
  // ============================================================
  console.log("⭐ Seeding reviews...");

  const reviewNames = [
    "Arjun Mehta", "Ananya Iyer", "Vikram Singh Rathore", "Meera Nair",
    "Rohan Kulkarni", "Isha Gupta", "Aditya Verma", "Pooja Reddy",
    "Karan Malhotra", "Sneha Joshi", "Rahul Deshmukh", "Divya Pillai",
    "Nikhil Patel", "Tanvi Sharma", "Saurabh Kapoor", "Amrita Singh",
    "Harsh Agarwal", "Prachi Kulkarni",
  ];

  const reviewComments = [
    "Absolutely love the fabric quality! It feels premium and the stitching is impeccable. Will definitely order more from MAISON.",
    "Great fit and very comfortable. The colour is exactly as shown in the pictures. Delivery was super fast too!",
    "The material is soft and breathable, perfect for Indian weather. Sizing is true to the chart. Highly recommended.",
    "Stylish and well-made. Got so many compliments wearing this. The packaging was also really nice.",
    "Decent quality for the price. The fit is slightly loose but nothing a tailor can't fix. Overall satisfied.",
    "Amazing product! The fabric has a nice weight to it and doesn't feel cheap at all. Worth every rupee.",
    "Very happy with my purchase. The colour hasn't faded after multiple washes. MAISON quality is consistent.",
    "The design is very modern and the fabric drapes beautifully. Perfect for both casual and semi-formal occasions.",
    "Good quality product. The only reason I'm giving 4 stars instead of 5 is that delivery took a bit longer than expected.",
    "Excellent build quality and the fit is spot on. I've been wearing it almost every week since I got it.",
    "The texture is incredibly soft and the stitching is neat. One of the best purchases I've made online.",
    "Really impressed with the packaging and the product itself. The colour is rich and the fabric feels luxurious.",
    "Fits perfectly! I was worried about the sizing but the chart was accurate. The material is top-notch.",
    "Beautiful piece. The attention to detail is remarkable — from the buttons to the inner lining. Premium feel all around.",
    "Solid product. Comfortable, stylish, and great value for money. MAISON is becoming my go-to brand.",
    "The quality exceeded my expectations. The fabric has a slight sheen to it that looks very sophisticated.",
    "Very comfortable and the sizing is generous. I would suggest going a size down if you prefer a slimmer fit.",
    "Superb quality! I've washed it multiple times and it still looks brand new. Colour retention is excellent.",
  ];

  const reviewTitles = [
    "Excellent quality!", "Great purchase", "Love it!", "Good value",
    "Stunning piece", "Very comfortable", "Premium feel", "Exceeded expectations",
    "Worth the price", "Best buy this month", "Highly recommend", "Solid quality",
    "Perfect fit", "Beautiful design", "Impressive fabric", "Amazing product",
    "Consistent quality", "Fantastic buy",
  ];

  const reviewUserEmails = [
    "arjun.mehta@email.com", "ananya.iyer@email.com", "vikram.singh@email.com",
    "meera.nair@email.com", "rohan.kulkarni@email.com", "isha.gupta@email.com",
    null, null, null, null, null, null, null, null, null, null, null, null,
  ];

  let reviewCount = 0;
  for (let i = 0; i < 18; i++) {
    const product = allProducts[i % allProducts.length];
    const rating = 3 + Math.floor(Math.random() * 3); // 3-5
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: reviewUserEmails[i] ? users[reviewUserEmails[i]] : null,
        userName: reviewNames[i],
        rating,
        title: reviewTitles[i],
        comment: reviewComments[i],
      },
    });
    reviewCount++;
  }
  console.log(`  ✓ Added ${reviewCount} new reviews\n`);

  // Update product ratings based on reviews
  console.log("  Updating product ratings...");
  const productsWithReviews = await prisma.product.findMany({
    include: { reviews: true },
  });
  for (const product of productsWithReviews) {
    if (product.reviews.length > 0) {
      const avgRating =
        product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: product.reviews.length,
        },
      });
    }
  }
  console.log("  ✓ Product ratings updated\n");

  // ============================================================
  // 7. SEED TESTIMONIALS (8)
  // ============================================================
  console.log("💬 Seeding testimonials...");

  const testimonials = [
    {
      name: "Arun Kapoor",
      location: "Mumbai, Maharashtra",
      rating: 5,
      title: "Unmatched quality and style",
      comment: "MAISON has completely transformed my wardrobe. The fabrics are luxurious, the fits are impeccable, and every piece feels like it was made just for me. I've never received so many compliments!",
      product: "Slim Fit Oxford Button-Down",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Deepika Nambiar",
      location: "Bangalore, Karnataka",
      rating: 5,
      title: "My go-to fashion destination",
      comment: "Shopping at MAISON is always a delightful experience. The curation is thoughtful, and the quality is consistent across every purchase. Their linen collection is an absolute must-have for Indian summers.",
      product: "Linen Blend Casual Shirt",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Rajat Sharma",
      location: "New Delhi, Delhi",
      rating: 4,
      title: "Premium feel, fair pricing",
      comment: "I was pleasantly surprised by the quality-to-price ratio. The blazer I ordered looks and feels like something twice its price. Fast delivery and beautiful packaging made it even better.",
      product: "Cotton Chino Blazer",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: "Sneha Patel",
      location: "Pune, Maharashtra",
      rating: 5,
      title: "Obsessed with the quality",
      comment: "Every single item I've ordered from MAISON has exceeded my expectations. The attention to detail — from stitching to buttons to packaging — shows they truly care about their customers.",
      isFeatured: false,
      sortOrder: 4,
    },
    {
      name: "Karthik Iyer",
      location: "Chennai, Tamil Nadu",
      rating: 4,
      title: "Great fabrics, modern designs",
      comment: "MAISON strikes the perfect balance between contemporary design and classic craftsmanship. The merino wool sweater I bought is incredibly soft and has held its shape beautifully after multiple washes.",
      product: "Merino Wool Crew Neck Sweater",
      isFeatured: true,
      sortOrder: 5,
    },
    {
      name: "Anisha Reddy",
      location: "Hyderabad, Telangana",
      rating: 5,
      title: "Luxury that's accessible",
      comment: "Finally, a brand that offers premium quality at reasonable prices. The cashmere blend V-neck is the softest thing I own. MAISON has earned a loyal customer in me!",
      product: "Cashmere Blend V-Neck",
      isFeatured: false,
      sortOrder: 6,
    },
    {
      name: "Manav Khanna",
      location: "Jaipur, Rajasthan",
      rating: 4,
      title: "Stylish and comfortable",
      comment: "The denim from MAISON is on another level. The selvedge jeans have the perfect weight and the slim tapered fit is exactly what I was looking for. Highly recommended for denim lovers.",
      product: "Slim Tapered Selvedge Denim",
      isFeatured: false,
      sortOrder: 7,
    },
    {
      name: "Priya Desai",
      location: "Kolkata, West Bengal",
      rating: 5,
      title: "Elevated my everyday style",
      comment: "From the white sneakers to the leather tote, every MAISON product has a refined aesthetic. The customer service is also exceptional — they truly go above and beyond. A five-star experience all around!",
      isFeatured: true,
      sortOrder: 8,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${slugify(t.name)}` },
      update: {},
      create: {
        id: `testimonial-${slugify(t.name)}`,
        ...t,
      },
    });
    console.log(`  ✓ ${t.name} — ${t.title}`);
  }
  console.log();

  // ============================================================
  // 8. SEED COUPONS (add 3 more to reach 6)
  // ============================================================
  console.log("🏷️  Seeding coupons...");

  const coupons = [
    {
      code: "WELCOME15",
      discount: 15,
      type: "percentage",
      minOrder: 2000,
      maxUses: 1000,
      expiresAt: new Date("2025-12-31"),
    },
    {
      code: "SAVE10",
      discount: 10,
      type: "percentage",
      minOrder: 1000,
      maxUses: 5000,
      expiresAt: new Date("2025-12-31"),
    },
    {
      code: "FLAT500",
      discount: 500,
      type: "fixed",
      minOrder: 3000,
      maxUses: 2000,
      expiresAt: new Date("2025-12-31"),
    },
    {
      code: "TRENDING20",
      discount: 20,
      type: "percentage",
      minOrder: 5000,
      maxUses: 500,
      expiresAt: new Date("2025-11-30"),
    },
    {
      code: "VIP25",
      discount: 25,
      type: "percentage",
      minOrder: 8000,
      maxUses: 200,
      expiresAt: new Date("2025-12-31"),
    },
    {
      code: "SUMMER30",
      discount: 30,
      type: "percentage",
      minOrder: 4000,
      maxUses: 1000,
      expiresAt: new Date("2026-06-30"),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discount: c.discount,
        type: c.type,
        minOrder: c.minOrder,
        maxUses: c.maxUses,
        expiresAt: c.expiresAt,
      },
      create: c,
    });
    console.log(`  ✓ ${c.code} — ${c.type === "fixed" ? `₹${c.discount}` : `${c.discount}%`} off (min ₹${c.minOrder})`);
  }
  console.log();

  // ============================================================
  // 9. SEED NOTIFICATIONS (7)
  // ============================================================
  console.log("🔔 Seeding notifications...");

  const notifications = [
    {
      userId: users["admin@maison.com"],
      title: "New Order Received",
      message: "Order #MSN-2025-10001 has been placed by Arjun Mehta. Total: ₹3,498.",
      type: "order",
      isRead: true,
    },
    {
      userId: users["admin@maison.com"],
      title: "Low Stock Alert",
      message: "Essential Crew Neck Tee (White, S) is running low on stock. Only 3 units remaining.",
      type: "system",
      isRead: false,
    },
    {
      userId: users["admin@maison.com"],
      title: "New Review Posted",
      message: "A 5-star review has been posted on 'Slim Fit Oxford Button-Down' by Arjun Mehta.",
      type: "order",
      isRead: true,
    },
    {
      userId: users["arjun.mehta@email.com"],
      title: "Order Shipped!",
      message: "Your order #MSN-2025-10002 has been shipped via BlueDart. Track your package now.",
      type: "order",
      isRead: true,
    },
    {
      userId: users["arjun.mehta@email.com"],
      title: "Flash Sale: 30% Off",
      message: "Limited time! Use code SUMMER30 for 30% off on summer essentials. Ends soon!",
      type: "promo",
      isRead: false,
    },
    {
      userId: users["ananya.iyer@email.com"],
      title: "Welcome to MAISON!",
      message: "Thank you for signing up! Use code WELCOME15 for 15% off your first order.",
      type: "promo",
      isRead: true,
    },
    {
      userId: users["vikram.singh@email.com"],
      title: "Loyalty Points Earned",
      message: "You've earned 350 loyalty points from your recent order. Your total balance is 2,450 points.",
      type: "system",
      isRead: false,
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
    console.log(`  ✓ [${n.type}] ${n.title} → ${n.userId ? "user" : "N/A"}`);
  }
  console.log();

  // ============================================================
  // 10. SEED NEWSLETTER (5 entries)
  // ============================================================
  console.log("📧 Seeding newsletter entries...");

  const newsletterEmails = [
    "subscribe@example.com",
    "fashion.lover@email.com",
    "trend.alerts@email.com",
    "shopper.in@mumbai.com",
    "first.time buyer@email.com",
  ];

  for (const email of newsletterEmails) {
    await prisma.newsletter.upsert({
      where: { email },
      update: {},
      create: { email, isActive: true },
    });
    console.log(`  ✓ ${email}`);
  }
  console.log();

  // ============================================================
  // 11. SEED SITE CONTENT (dynamic page content)
  // ============================================================
  console.log("🌐 Seeding site content...");

  const siteContent: Record<string, string> = {
    heroBadge: "New Season 2025",
    heroTitle: "Redefine Your Style",
    heroSubtitle: "Considered essentials crafted from the world's finest materials. Less noise, more substance.",
    heroCtaPrimary: "Shop Collection",
    heroCtaSecondary: "Our Story",
    heroImage: "/images/hero-bg.png",

    marqueeItems: JSON.stringify([
      "Free shipping on orders over \u20B92,000",
      "30-day hassle-free returns",
      "100% authentic products",
      "Crafted with premium materials",
      "Sustainable practices",
      "Worldwide delivery",
    ]),

    trustItems: JSON.stringify([
      { icon: "Truck", title: "Free Shipping", desc: "On all orders over \u20B92,000" },
      { icon: "RotateCcw", title: "Easy Returns", desc: "30-day no questions asked" },
      { icon: "Shield", title: "Authenticity", desc: "100% genuine products" },
      { icon: "Sparkles", title: "Premium Quality", desc: "Finest materials only" },
    ]),

    editorialBadge: "Our Philosophy",
    editorialTitle: "Less noise. More substance.",
    editorialTitleColor: "#4D5B47",
    editorialText: "At MAISON, we believe the best style is invisible. No logos screaming for attention, no trends chasing the moment. Just exceptional materials, considered design, and pieces that speak for themselves.|Every garment is a result of hundreds of decisions \u2014 from the mill where the fabric is woven to the last stitch. We partner with the same artisans and suppliers as the world's most prestigious houses, making true luxury accessible.",
    editorialImage: "/images/products/product-6.png",
    editorialCta: "Discover Our Collection",
    editorialLabel: "SS25 Collection",

    features: JSON.stringify([
      { image: "/images/products/product-4.png", badge: "New Season", title: "Knitwear", subtitle: "Cashmere & merino essentials" },
      { image: "/images/products/product-5.png", badge: "Handcrafted", title: "Footwear", subtitle: "Boots, sneakers & more" },
      { image: "/images/products/product-10.png", badge: "Investment Pieces", title: "Outerwear", subtitle: "Coats & jackets for every season" },
    ]),

    stats: JSON.stringify([
      { value: "15K+", label: "Happy Customers" },
      { value: "44", label: "Premium Products" },
      { value: "26", label: "In-House Brands" },
      { value: "4.7", label: "Average Rating" },
    ]),

    shopFilters: JSON.stringify({
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "ONE SIZE"],
      colors: [
        { name: "White", hex: "#FFFFFF" },
        { name: "Black", hex: "#111111" },
        { name: "Olive", hex: "#4D5B47" },
        { name: "Sand", hex: "#B79B7B" },
        { name: "Cream", hex: "#D4C4B0" },
        { name: "Navy", hex: "#1a2744" },
        { name: "Charcoal", hex: "#3a3a3a" },
        { name: "Gray", hex: "#6B6B6B" },
        { name: "Brown", hex: "#5C3D2E" },
        { name: "Tan", hex: "#8B6914" },
        { name: "Sage", hex: "#B7C4B5" },
        { name: "Ivory", hex: "#F5F0E8" },
      ],
      priceRanges: [
        { label: "Under \u20B92,000", min: 0, max: 2000 },
        { label: "\u20B92,000 - \u20B95,000", min: 2000, max: 5000 },
        { label: "\u20B95,000 - \u20B910,000", min: 5000, max: 10000 },
        { label: "\u20B910,000 - \u20B920,000", min: 10000, max: 20000 },
        { label: "Over \u20B920,000", min: 20000, max: 99999 },
      ],
      discountOptions: [
        { label: "10% or more", value: 10 },
        { label: "20% or more", value: 20 },
        { label: "30% or more", value: 30 },
      ],
    }),

    paymentMethods: JSON.stringify([
      { id: "card", label: "Credit / Debit Card", brand: "Visa, Mastercard, RuPay" },
      { id: "upi", label: "UPI", brand: "GPay, PhonePe, Paytm" },
      { id: "netbanking", label: "Net Banking", brand: "All major banks" },
      { id: "wallet", label: "Wallet", brand: "Paytm, Amazon Pay" },
      { id: "cod", label: "Cash on Delivery", brand: "Pay on delivery" },
    ]),
  };

  for (const [key, value] of Object.entries(siteContent)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`  ✓ ${key}`);
  }
  console.log();

  // ============================================================
  // FINAL COUNTS
  // ============================================================
  console.log("=".repeat(50));
  console.log("📊 FINAL DATABASE COUNTS:");
  console.log("=".repeat(50));

  const counts = {
    Users: await prisma.user.count(),
    Products: await prisma.product.count(),
    Categories: await prisma.category.count(),
    Brands: await prisma.brand.count(),
    Orders: await prisma.order.count(),
    OrderItems: await prisma.orderItem.count(),
    Reviews: await prisma.review.count(),
    Testimonials: await prisma.testimonial.count(),
    Coupons: await prisma.coupon.count(),
    Notifications: await prisma.notification.count(),
    Newsletters: await prisma.newsletter.count(),
    WishlistItems: await prisma.wishlistItem.count(),
  };

  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(16)} ${count}`);
  }
  console.log("=".repeat(50));
  console.log("✅ Seed completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });