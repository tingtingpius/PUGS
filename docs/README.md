# Academic Project Page Template

A modern, high-end academic project page built with:
- **Tailwind CSS** — modern utility-first CSS framework
- **Three.js** — 3D particle background
- **Glassmorphism** — frosted glass UI design
- **Dark/Light themes** — CSS custom properties with localStorage persistence
- **Scroll animations** — Intersection Observer API
- **Image comparison slider** — before/after results
- **Video modal** — click-to-play demo video
- **BibTeX copy** — one-click citation copy

## File Structure

```
├── index.html              # Main page
├── assets/
│   ├── css/
│   │   └── style.css       # Custom styles, themes, animations
│   ├── js/
│   │   ├── three-bg.js     # Three.js particle background
│   │   ├── main.js         # Scroll animations, nav, theme toggle
│   │   └── components.js   # Carousel, comparison slider, video, BibTeX
│   ├── images/
│   │   ├── teaser.png      # Overview teaser image
│   │   └── pipeline.png    # Method pipeline figure
│   └── videos/
│       └── demo.mp4        # Demo video
└── README.md
```

## How to Use

### 1. Replace Content

Edit `index.html` to replace:
- Paper title, authors, affiliation
- Abstract text
- Conference name and year
- Add your images to `assets/images/`
- Add your video to `assets/videos/`
- Update BibTeX entry

### 2. Local Preview

Open `index.html` directly in your browser, or use any static server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```

### 3. Deploy to GitHub Pages

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then enable GitHub Pages in Settings → Pages → Source: main branch.

## License

CC BY-SA 4.0 — feel free to use and modify with attribution.
