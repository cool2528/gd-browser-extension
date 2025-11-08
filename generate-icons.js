/**
 * Icon Generator Script
 *
 * This script generates PNG icons from the SVG source in multiple sizes.
 *
 * Usage:
 *   npm install sharp (if not already installed)
 *   node generate-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ICON_SIZES = [16, 32, 48, 128];
const INPUT_SVG = path.join(__dirname, 'public', 'icons', 'icon.svg');
const OUTPUT_DIR = path.join(__dirname, 'public', 'icons');

// Colors
const COLORS = {
	default: '#409EFF', // Element Plus primary blue
	dark: '#1D1E1F',     // Dark theme background
	light: '#FFFFFF'     // Light theme
};

async function generateIcons() {
	console.log('🎨 GDownload Extension Icon Generator\n');

	// Check if SVG exists
	if (!fs.existsSync(INPUT_SVG)) {
		console.error('❌ Error: icon.svg not found at', INPUT_SVG);
		process.exit(1);
	}

	console.log('📄 Source SVG:', INPUT_SVG);
	console.log('📁 Output directory:', OUTPUT_DIR);
	console.log('📏 Generating sizes:', ICON_SIZES.join(', '), '\n');

	// Read SVG content
	const svgBuffer = fs.readFileSync(INPUT_SVG);

	// Generate each size
	for (const size of ICON_SIZES) {
		try {
			const outputFile = path.join(OUTPUT_DIR, `icon-${size}.png`);

			await sharp(svgBuffer)
				.resize(size, size, {
					fit: 'contain',
					background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
				})
				.png({
					compressionLevel: 9,
					adaptiveFiltering: true,
					palette: true
				})
				.toFile(outputFile);

			const stats = fs.statSync(outputFile);
			console.log(`✅ Generated icon-${size}.png (${(stats.size / 1024).toFixed(2)} KB)`);
		} catch (error) {
			console.error(`❌ Error generating ${size}×${size}:`, error.message);
		}
	}

	console.log('\n🎉 Icon generation complete!');
	console.log('\n📋 Next steps:');
	console.log('   1. Check the icons in public/icons/');
	console.log('   2. Verify icons display correctly in browser');
	console.log('   3. Update manifest.json if needed');
}

// Run the generator
generateIcons().catch(error => {
	console.error('💥 Fatal error:', error);
	process.exit(1);
});
