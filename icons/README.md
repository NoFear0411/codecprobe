# Icons

To generate PNG icons from favicon.svg, use ImageMagick or an online converter:

```bash
# Using ImageMagick
convert -background none -resize 192x192 ../favicon.svg icon-192.png
convert -background none -resize 512x512 ../favicon.svg icon-512.png
```

Or use an online converter like:
- https://realfavicongenerator.net/
- https://favicon.io/

For now, the SVG favicon will work in modern browsers. PNG icons are needed for PWA installation.
