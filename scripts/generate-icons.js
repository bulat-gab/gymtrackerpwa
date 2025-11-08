// Simple script to generate PWA icons using Node.js
// Run with: node scripts/generate-icons.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Simple SVG icon for gym/fitness theme
const iconSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#42b983" rx="80"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">G</text>
  <circle cx="256" cy="160" r="40" fill="white" opacity="0.9"/>
  <rect x="216" y="200" width="80" height="120" rx="10" fill="white" opacity="0.9"/>
</svg>`

const svgBuffer = Buffer.from(iconSvg)

async function generateIcons() {
  try {
    // Save SVG
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg)

    // Generate PNG icons
    await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'))

    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'))

    console.log('✓ Icon generation complete!')
    console.log('✓ Created pwa-192x192.png')
    console.log('✓ Created pwa-512x512.png')
    console.log('✓ Created icon.svg')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()
