# Icon Generation Guide

This directory should contain the extension icons in PNG format. The SVG source is provided in `icon.svg`.

## Required Icon Sizes

For browser extension compatibility, you need the following PNG files:

- `icon-16.png` - 16×16 pixels (toolbar, context menu)
- `icon-32.png` - 32×32 pixels (toolbar, Windows)
- `icon-48.png` - 48×48 pixels (extension management page)
- `icon-128.png` - 128×128 pixels (Chrome Web Store, installation)

## Generating PNG Icons from SVG

### Method 1: Using Online Tools

**Recommended**: [CloudConvert](https://cloudconvert.com/svg-to-png)

1. Upload `icon.svg`
2. Set output size (16, 32, 48, or 128)
3. Download the PNG
4. Rename to match the required filename

**Alternative**: [SVG to PNG Converter](https://svgtopng.com/)

### Method 2: Using Inkscape (Command Line)

If you have Inkscape installed:

```bash
# Install Inkscape first: https://inkscape.org/

# Generate all sizes
inkscape icon.svg --export-type=png --export-filename=icon-16.png --export-width=16
inkscape icon.svg --export-type=png --export-filename=icon-32.png --export-width=32
inkscape icon.svg --export-type=png --export-filename=icon-48.png --export-width=48
inkscape icon.svg --export-type=png --export-filename=icon-128.png --export-width=128
```

### Method 3: Using ImageMagick

If you have ImageMagick installed:

```bash
# Install ImageMagick first: https://imagemagick.org/

# Generate all sizes
convert -background none icon.svg -resize 16x16 icon-16.png
convert -background none icon.svg -resize 32x32 icon-32.png
convert -background none icon.svg -resize 48x48 icon-48.png
convert -background none icon.svg -resize 128x128 icon-128.png
```

### Method 4: Using Node.js Script

Install sharp package:

```bash
npm install sharp
```

Create `generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 48, 128];
const svgBuffer = fs.readFileSync('icon.svg');

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`icon-${size}.png`)
    .then(() => console.log(`Generated icon-${size}.png`))
    .catch(err => console.error(`Error generating ${size}:`, err));
});
```

Run:

```bash
node generate-icons.js
```

## Icon Design Guidelines

The provided SVG icon features:

- **Primary Color**: `#409EFF` (Element Plus primary blue)
- **Design**: Download arrow with speed lines
- **Style**: Modern, flat design
- **Visibility**: High contrast white on blue for clarity

### Customizing the Icon

To modify the icon design:

1. Open `icon.svg` in a vector editor (Inkscape, Illustrator, Figma)
2. Edit colors, shapes, or elements
3. Save the SVG
4. Re-generate PNG files

### Color Variations

For different themes:

**Light Theme** (current):
- Background: `#409EFF`
- Foreground: `#FFFFFF`

**Dark Theme**:
- Background: `#1D1E1F`
- Foreground: `#409EFF`

**Monochrome**:
- Single color: `#303133`

## Placeholder Icons

If you need temporary placeholder icons during development:

1. Use any 128×128 image
2. Resize it to required sizes
3. Replace with final icons before release

## Verification

After generating icons, verify:

- [ ] All four sizes (16, 32, 48, 128) are present
- [ ] Files are in PNG format
- [ ] Files are named correctly (`icon-{size}.png`)
- [ ] Images have transparent background
- [ ] Icons are sharp and clear at each size
- [ ] manifest.json references the correct paths

## Testing Icons

Load the extension in browser and check:

- [ ] Toolbar icon displays correctly
- [ ] Context menu icon is visible
- [ ] Extension management page shows the icon
- [ ] Icon scales well at different sizes

---

**Current Status**: SVG source provided, PNG files need to be generated before first use.
