import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  const svgPath = path.join(rootDir, 'public', 'favicon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error(`SVG file not found at: ${svgPath}`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Create public/icons directory if it doesn't exist
  const iconsDir = path.join(rootDir, 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Launching browser to generate icons...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const targets = [
    { name: 'icons/icon-192x192.png', size: 192 },
    { name: 'icons/icon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.ico', size: 32 } // Simple PNG renamed to ico or just PNG format
  ];

  for (const target of targets) {
    const destPath = path.join(rootDir, 'public', target.name);
    console.log(`Generating ${target.name} (${target.size}x${target.size})...`);

    // Set viewport to the target size
    await page.setViewportSize({ width: target.size, height: target.size });

    // HTML that renders the SVG to fill the viewport exactly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: transparent;
            }
            svg {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    // Give a tiny moment for layout/rendering
    await page.waitForTimeout(100);

    await page.screenshot({
      path: destPath,
      omitBackground: true,
      type: 'png'
    });
  }

  // Also copy favicon.svg to masked-icon.svg as a fallback
  const maskedIconPath = path.join(rootDir, 'public', 'masked-icon.svg');
  if (!fs.existsSync(maskedIconPath)) {
    console.log('Copying favicon.svg to masked-icon.svg...');
    fs.copyFileSync(svgPath, maskedIconPath);
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
