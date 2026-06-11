# Aaish Faisal Hameedi — Portfolio

A single-page portfolio website for **Aaish Faisal Hameedi**, an AI Engineer
specializing in machine learning, computer vision, NLP, and production AI
systems (Graph-RAG, LLMs, agentic pipelines). Built with a "Dark Technical"
design and an interactive code-terminal widget in the hero section.

**Live site:** https://aaish-developer26.github.io/aaish-portfolio/

## Sections

- **Hero** — name, title, value proposition, resume/contact CTAs, and an
  interactive "code terminal" widget that types out a live introduction
- **About** — bio and quick stats
- **Skills** — AI/ML, languages & frameworks, databases, backend, cloud/MLOps,
  and professional skills
- **Experience** — vertical timeline of roles
- **Projects** — featured AI projects with live demo / GitHub links
- **Education & Certifications**
- **Contact** — phone, email, LinkedIn, GitHub

## Tech Stack

- **HTML5** — semantic, single-file structure (`index.html`)
- **CSS3** — custom properties, Grid & Flexbox layouts, keyframe animations
  (`css/style.css`)
- **Vanilla JavaScript** — mobile nav, smooth scroll, scroll-spy, scroll
  reveal animations, and the terminal widget (`js/main.js`)
- **Google Fonts** — Inter & JetBrains Mono (via CDN)
- **Font Awesome 6** — icons (via CDN)

No frameworks, build tools, or npm packages — everything runs directly in
the browser.

## Project Structure

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    ├── images/        # profile photo
    ├── resume/         # downloadable resume (PDF)
    └── certificates/   # certification PDFs
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Aaish-Developer26/aaish-portfolio.git
cd aaish-portfolio
```

Since this is a static site with no build step, you can open it directly:

```bash
# Open index.html in your default browser
start index.html       # Windows
open index.html         # macOS
xdg-open index.html      # Linux
```

Or serve it locally (recommended for the most accurate preview):

```bash
# Using Python
python -m http.server 8000

# Or using Node
npx serve .
```

Then visit `http://localhost:8000` in your browser.

## Deployment

This site is deployed via **GitHub Pages** from the repository root on the
`main` branch. The `.nojekyll` file in the project root disables Jekyll
processing so all folders (including `assets/`) are served as-is.

## Contact

- **Email:** hameediaaish@gmail.com
- **Phone:** +92 333 0378408
- **LinkedIn:** https://www.linkedin.com/in/aaish-hameedi-a8480b269
- **GitHub:** https://github.com/Aaish-Developer26
