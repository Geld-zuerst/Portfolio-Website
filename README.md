# Harsh Tiwari — Portfolio (Next.js)

This is the Next.js version of the portfolio, split into separate component/CSS/JS files.

## Structure

```
app/
  layout.js        Root layout, fonts, metadata
  page.js           Assembles all sections
  globals.css       All site CSS (extracted from the original <style> tag)
components/
  Nav.js, Hero.js, About.js, PhotoSection.js, Projects.js,
  Skills.js, Why.js, Certifications.js, Interests.js,
  Education.js, Contact.js, Footer.js, Modal.js,
  Separator.js, ArrowIcon.js, ScrollFade.js
  ThreeScenes.js    All Three.js canvas animations (client components)
data/
  projects.js       Project cards data
  certs.js          Certification data (used by the modal)
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm start
```
