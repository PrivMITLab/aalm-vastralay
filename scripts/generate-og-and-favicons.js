const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

// 1. Red Card OpenGraph Image SVG
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3d0c14"/>
      <stop offset="50%" stop-color="#7a1f2b"/>
      <stop offset="100%" stop-color="#9e2739"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2A3"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#AA820A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle decorative corner border -->
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="rgba(212,175,55,0.18)" stroke-width="1.5"/>
  
  <!-- Top Left Monogram Medallion -->
  <g transform="translate(72, 60)">
    <circle cx="44" cy="44" r="42" fill="#5a0e1b" stroke="#D4AF37" stroke-width="3"/>
    <text x="44" y="58" font-family="'Noto Serif Devanagari', 'Mangal', 'Devanagari MT', serif, Georgia" font-size="48" font-weight="bold" fill="#D4AF37" text-anchor="middle">आ</text>
    <text x="106" y="38" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#FAF9F6">Aalm Vastralay</text>
    <text x="108" y="66" font-family="Georgia, serif" font-size="18" font-weight="500" fill="#ead06f">Wedding &amp; ethnic wear marketplace</text>
  </g>
  
  <!-- Main Headline -->
  <text x="72" y="380" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#FAF9F6">
    <tspan x="72" dy="0">Lehengas, sarees &amp; sherwanis</tspan>
    <tspan x="72" dy="68">straight from India&apos;s artisans</tspan>
  </text>
  
  <!-- 4 Pill Badges -->
  <g transform="translate(72, 492)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="180" height="46" rx="23" fill="rgba(255,255,255,0.12)" stroke="rgba(234,208,111,0.45)" stroke-width="1.5"/>
    <text x="90" y="29" font-family="sans-serif, system-ui" font-size="17" font-weight="500" fill="#FAF9F6" text-anchor="middle">Cash on Delivery</text>

    <!-- Pill 2 -->
    <rect x="195" y="0" width="160" height="46" rx="23" fill="rgba(255,255,255,0.12)" stroke="rgba(234,208,111,0.45)" stroke-width="1.5"/>
    <text x="275" y="29" font-family="sans-serif, system-ui" font-size="17" font-weight="500" fill="#FAF9F6" text-anchor="middle">7-day returns</text>

    <!-- Pill 3 -->
    <rect x="370" y="0" width="170" height="46" rx="23" fill="rgba(255,255,255,0.12)" stroke="rgba(234,208,111,0.45)" stroke-width="1.5"/>
    <text x="455" y="29" font-family="sans-serif, system-ui" font-size="17" font-weight="500" fill="#FAF9F6" text-anchor="middle">Verified sellers</text>

    <!-- Pill 4 -->
    <rect x="555" y="0" width="225" height="46" rx="23" fill="rgba(255,255,255,0.12)" stroke="rgba(234,208,111,0.45)" stroke-width="1.5"/>
    <text x="667" y="29" font-family="sans-serif, system-ui" font-size="17" font-weight="500" fill="#FAF9F6" text-anchor="middle">0% seller commission</text>
  </g>
</svg>
`;

// 2. Favicon SVG
const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'));

async function main() {
  console.log('Rendering high-res OpenGraph images and Favicons...');

  // Generate og-image.png and twitter-image.png (1200x630)
  const ogBuffer = await sharp(Buffer.from(ogSvg))
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuffer);
  fs.writeFileSync(path.join(publicDir, 'twitter-image.png'), ogBuffer);
  console.log(`✔ Generated public/og-image.png and public/twitter-image.png (${ogBuffer.length} bytes)`);

  // Generate square og-image-square.png (600x600)
  const squareBuffer = await sharp(faviconSvg)
    .resize(600, 600)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image-square.png'), squareBuffer);
  console.log(`✔ Generated public/og-image-square.png`);

  // Generate Favicons: 16x16, 32x32, 96x96, 180x180 (apple-touch-icon)
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const s of sizes) {
    const buf = await sharp(faviconSvg).resize(s.size, s.size).png().toBuffer();
    fs.writeFileSync(path.join(publicDir, s.name), buf);
  }
  console.log(`✔ Generated all multi-resolution PNG favicons & touch icons`);

  // Copy 32x32 to favicon.ico (valid PNG-in-ICO format supported by all modern browsers)
  const icoBuf = await sharp(faviconSvg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  console.log(`✔ Updated public/favicon.ico with royal maroon Aa medallion`);
}

main().catch((err) => {
  console.error('Failed to generate assets:', err);
  process.exit(1);
});
