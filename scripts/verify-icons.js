const fs = require("node:fs");
const path = require("node:path");

const publicDir = path.join(__dirname, "..", "public");

const requiredIcons = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-96x96.png",
  "favicon-dark.svg",
  "apple-touch-icon.png",
  "apple-touch-icon-76x76.png",
  "apple-touch-icon-152x152.png",
  "apple-touch-icon-167x167.png",
  "apple-touch-icon-180x180.png",
  "apple-touch-icon-precomposed.png",
  "android-chrome-72x72.png",
  "android-chrome-96x96.png",
  "android-chrome-128x128.png",
  "android-chrome-144x144.png",
  "android-chrome-152x152.png",
  "android-chrome-192x192.png",
  "android-chrome-384x384.png",
  "android-chrome-512x512.png",
  "maskable-192x192.png",
  "maskable-512x512.png",
  "mstile-70x70.png",
  "mstile-144x144.png",
  "mstile-150x150.png",
  "mstile-310x150.png",
  "mstile-310x310.png",
  "og-image.png",
  "twitter-image.png",
  "og-image-square.png",
  "linkedin-image.png",
  "email-logo.png",
  "safari-pinned-tab.svg",
  "loading-spinner.svg",
  "browserconfig.xml",
  "manifest.json",
];

let missing = 0;
for (const icon of requiredIcons) {
  const p = path.join(publicDir, icon);
  if (!fs.existsSync(p)) {
    console.error(`❌ Missing asset: public/${icon}`);
    missing++;
  }
}

if (missing > 0) {
  console.error(`\nFound ${missing} missing asset(s).`);
  process.exit(1);
} else {
  console.log("✔ All required brand icons and configs verified successfully!");
}
