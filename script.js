const fs = require('fs');
const path = 'e:/Merch/src/components/merch-landing.tsx';
let content = fs.readFileSync(path, 'utf8');

const capabilitiesPattern = /const capabilities = \[\s+{(?:[^{}]*|{[^{}]*})*}\s*,\s*{(?:[^{}]*|{[^{}]*})*}\s*,\s*{(?:[^{}]*|{[^{}]*})*}\s*,\s*{(?:[^{}]*|{[^{}]*})*}\s*,\s*\];/s;

const newCategories = const categories = [
  {
    title: "T-Shirts",
    image: "/products/tshirt.png",
    products: [
      "Couple T-Shirts", "Crop T-Shirts", "Plain T-shirt", "Oversized T-shirt", 
      "Custom T-shirt", "Gym T-shirt", "Corporate T-shirt", 
      "Sports T-shirt", "V Neck T-shirt", "Round Neck T-shirt", 
      "Full Sleeve T-shirt", "Polo T-shirts", "Printed T-shirts"
    ]
  },
  {
    title: "Hoodies & Sweatshirts",
    image: "/products/hoodie.png",
    products: [
      "Zipper Hoodies", "Non-Zipper Hoodies", "Oversized Hoodies", "Promotional Hoodies",
      "Crewneck Sweatshirts", "Full Zip Sweatshirts", "Premium Sweatshirts", "Embroidered Sweatshirts"
    ]
  },
  {
    title: "Jackets",
    image: "/products/varsity.png",
    products: [
      "Varsity Jackets", "Reflective Jackets", "Safety Jackets", "Fleece Jackets", 
      "Corporate Jackets", "Nehru Jackets", "Lab Coat Uniform"
    ]
  },
  {
    title: "Caps & Headwear",
    image: "/products/cap.png",
    products: [
      "Customised Caps", "Bucket Hats", "Summer Caps", "Headbands", "Visors", "Umpire Hats"
    ]
  },
  {
    title: "Drinkware",
    image: "/products/bottle.png",
    products: [
      "Water Bottles", "Travel Mugs", "Customised Mugs", "Tumblers", "Sports Bottles", "Coasters", "Bottle Openers"
    ]
  },
  {
    title: "Bags & Kits",
    image: "/products/kit.png",
    products: [
      "Tote Bags", "Drawstring Bags", "Backpacks", "Duffle & Gym Bags", "Laptop Bags", "Jute Bags", "Messenger Bags"
    ]
  },
  {
    title: "Promo & Tech",
    image: "/products/kit.png",
    products: [
      "Customised Diaries", "Pens", "Badges", "Lanyards", "Mouse Pads", "Pen Drives", "Power Banks", "Headphones"
    ]
  },
  {
    title: "Uniforms & Tracksuits",
    image: "/products/varsity.png",
    products: [
      "Corporate Uniforms", "Hospital Uniforms", "School Uniforms", "Men Tracksuit", "Women Tracksuit", "Cricket Tracksuits"
    ]
  }
];;

content = content.replace(capabilitiesPattern, newCategories);

const capabilityCardPattern = /function CapabilityCard.*?return \([^;]*;\n}/s;
const newCategoryCard = unction CategoryCard({
  title,
  image,
  products,
}: {
  title: string;
  image: string;
  products: string[];
}) {
  return (
    <div className="surface-card group relative overflow-hidden rounded-[30px] p-5 transition-all hover:border-[color:var(--border-strong)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-surface">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <h3 className="mt-5 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {products.slice(0, 6).map((product) => (
          <span key={product} className="rounded-full border border-[color:var(--border)] bg-surface-soft px-3 py-1 text-[11px] text-text-soft transition-colors group-hover:border-[color:var(--border-strong)] group-hover:text-foreground">
            {product}
          </span>
        ))}
        {products.length > 6 && (
          <span className="rounded-full border border-transparent px-2 py-1 text-[11px] font-medium text-accent">
            +{products.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
};

content = content.replace(capabilityCardPattern, newCategoryCard);

content = content.replace(/\{capabilities\.map\(\(capability, index\) => \(\s*<ScrollReveal key=\{capability\.title\} delay=\{index \* 0\.05\}>\s*<CapabilityCard \{\.\.\.capability\} \/>\s*<\/ScrollReveal>\s*\)\)\}/s, \{categories.map((category, index) => (
                <ScrollReveal key={category.title} delay={index * 0.05}>
                  <CategoryCard {...category} />
                </ScrollReveal>
              ))}\);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated merch-landing.tsx');
