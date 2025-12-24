# PizzaDojo2Go.com Website - Flow & Technical Summary

## Overview
PizzaDojo2Go.com is a simple, elegant "Coming Soon" website built with vanilla HTML/CSS. The site features a video background, responsive design, and a clean three-page structure. It's designed to build anticipation for the Pizza Dojo 2Go launch in 2026.

## Site Flow

### Page Structure
1. **Home Page (`index.html`)**
   - Landing page with video background
   - "Coming in 2026 to a community near you!" headline
   - Navigation buttons: "About Us" and "Contact Us"

2. **About Page (`about.html`)**
   - Placeholder content: "Details are being fired up. Check back soon!"
   - Navigation: "Return Home" and "Contact Us" buttons

3. **Contact Page (`contact.html`)**
   - Placeholder content: "We're not ready to take orders yet, but check back soon!"
   - Navigation: "Return Home" and "About Us" buttons

### User Navigation Flow
```
index.html (Home)
    ├── Click "About Us" → about.html
    │       ├── Click "Return Home" → index.html
    │       └── Click "Contact Us" → contact.html
    │
    └── Click "Contact Us" → contact.html
            ├── Click "Return Home" → index.html
            └── Click "About Us" → about.html
```

## Technical Architecture

### File Structure
```
pizzadojo2go/
├── index.html          # Home/landing page
├── about.html          # About page
├── contact.html        # Contact page
├── template.html       # Template for creating new pages
├── layout.css          # Main layout and responsive styles
├── style.css           # Additional styles (legacy, may be unused)
├── README.md           # Project documentation
└── assets/
    └── images/
        ├── background.jpg    # Static background for about/contact pages
        ├── oven2.jpg         # Video poster image
        └── oven3.mp4         # Background video for home page
```

### Technology Stack
- **HTML5**: Semantic markup, no frameworks
- **CSS3**: Custom properties (CSS variables), Flexbox, Grid, Media queries
- **Vanilla JavaScript**: None (pure HTML/CSS)
- **Fonts**: Google Fonts (Playfair Display, Lora)
- **Assets**: MP4 video, JPG images

## Technical Details

### CSS Architecture

#### `layout.css` (Primary Stylesheet)
- **CSS Variables**: Defined in `:root` for responsive typography
  - `--overlay-top`: 0.25 (lighter overlay at top)
  - `--overlay-bot`: 0.65 (darker overlay at bottom)
  - `--title-size`: `clamp(2rem, 6vw, 4rem)` (responsive title)
  - `--tagline-size`: `clamp(1.1rem, 3.2vw, 2rem)` (responsive tagline)
  - `--content-size`: `clamp(1rem, 2.5vw, 1.5rem)` (responsive content)

- **Layout System**:
  - Grid-based container: `grid-template-rows: auto 1fr auto` (header, main, footer)
  - Full viewport height: `min-height: 100vh`
  - Centered content with max-width: `max-width: 1200px`

- **Background System**:
  - Video background (`#bgVideo`): Fixed position, centered, full viewport coverage
  - Image background (`.bg-image`): Fixed position, full viewport coverage
  - Overlay (`.overlay`): Gradient overlay for text readability
  - Z-index layering: Background (-2), Overlay (-1), Content (0+)

- **Typography**:
  - Primary font: `'Lora', serif` (body text)
  - Display font: `'Playfair Display', serif` (headings, buttons)
  - Responsive sizing using `clamp()` function
  - Text shadows for readability over video/image backgrounds

- **Responsive Breakpoints**:
  - Mobile: `@media (max-width: 768px)` - Stacked buttons, reduced padding
  - Small mobile: `@media (max-width: 480px)` - Further reduced spacing

#### `style.css` (Legacy Stylesheet)
- Contains older styles that may conflict with `layout.css`
- References `Cinzel` font (not loaded in HTML)
- Has different container/button styles
- **Status**: Appears to be legacy/unused code

### HTML Structure

#### Common Elements Across All Pages
1. **Head Section**:
   - Meta charset and viewport
   - Google Fonts preconnect and link
   - Links to `layout.css`
   - Page-specific title

2. **Body Structure**:
   ```html
   <body>
     <!-- Background (video or image) -->
     <div class="overlay"></div>
     
     <div class="container">
       <header>
         <h1 class="site-title">PizzaDojo2Go.com</h1>
       </header>
       
       <main>
         <h2 class="headline">Page Headline</h2>
         <div class="content">...</div>
         <div class="actions">...</div>
       </main>
       
       <footer>
         <div class="footer-content">
           <p>&copy; 2025 PizzaDojo2Go. All rights reserved.</p>
         </div>
       </footer>
     </div>
   </body>
   ```

#### Page-Specific Differences

**index.html (Home)**:
- Uses `<video>` element with `autoplay`, `muted`, `playsinline`, `loop`
- Video source: `assets/images/oven3.mp4`
- Poster image: `assets/images/oven2.jpg` (fallback while video loads)
- Headline: "Coming in 2026 to a community near you!"

**about.html & contact.html**:
- Uses `<img>` element with class `bg-image`
- Image source: `assets/images/background.jpg`
- Placeholder content in `.content` div

### Styling Details

#### Button Styles (`.btn`)
- Transparent background with white border
- Hover effect: White background, black text, slight lift (`translateY(-2px)`)
- Backdrop filter blur for glassmorphism effect
- Responsive: Full width on mobile (max-width: 280px)

#### Overlay System
- Gradient overlay from top (25% opacity) to bottom (65% opacity)
- Ensures text readability over video/image backgrounds
- Uses CSS custom properties for easy adjustment

#### Responsive Design
- Fluid typography using `clamp()` for all text sizes
- Flexible grid layout that adapts to screen size
- Mobile-first approach with progressive enhancement
- Touch-friendly button sizes on mobile

## Assets

### Images
- **background.jpg**: Static background for about/contact pages (pizza oven)
- **oven2.jpg**: Video poster/fallback image (1024x1024 or similar)
- **oven3.mp4**: Background video for home page (looping pizza oven footage)

### Fonts (Google Fonts)
- **Playfair Display** (700 weight): Headings, buttons
- **Lora** (400, 700 weights): Body text, content

## Current State

### Working Features
✅ Responsive design (mobile, tablet, desktop)
✅ Video background on home page
✅ Image backgrounds on about/contact pages
✅ Smooth hover transitions on buttons
✅ Accessible semantic HTML
✅ Cross-browser compatibility (modern browsers)

### Placeholder Content
⚠️ About page: "Details are being fired up. Check back soon!"
⚠️ Contact page: "We're not ready to take orders yet, but check back soon!"

### Potential Issues
- `style.css` may contain conflicting styles (not linked in HTML, but exists)
- No JavaScript for interactivity (if needed)
- No form handling on contact page
- No analytics or tracking
- No SEO meta tags beyond basic title

## Development Notes

### Creating New Pages
Use `template.html` as a starting point:
1. Copy `template.html` to new filename
2. Update `<title>` tag
3. Update `.headline` text
4. Add content to `.content` div
5. Update navigation buttons in `.actions` div

### Styling Guidelines
- Use CSS variables from `:root` for consistent sizing
- Follow existing button/container patterns
- Maintain responsive breakpoints (768px, 480px)
- Keep text shadows for readability over backgrounds

### Best Practices Followed
- Semantic HTML5 elements
- ARIA labels where appropriate
- Responsive viewport meta tag
- Font preconnect for performance
- Accessible color contrast (white text on dark backgrounds)

## Future Enhancement Opportunities

1. **Content Updates**:
   - Replace placeholder text on about/contact pages
   - Add actual business information
   - Add social media links

2. **Functionality**:
   - Contact form with email/backend integration
   - Newsletter signup
   - Social media integration
   - Analytics tracking

3. **SEO**:
   - Meta descriptions
   - Open Graph tags
   - Structured data (JSON-LD)
   - Sitemap.xml

4. **Performance**:
   - Image optimization (WebP format)
   - Video compression/optimization
   - Lazy loading for images
   - Service worker for offline support

5. **Code Cleanup**:
   - Remove or integrate `style.css` (currently unused)
   - Consolidate duplicate styles
   - Add comments for maintainability

## Quick Reference

### File Locations
- **Home**: `pizzadojo2go/index.html`
- **About**: `pizzadojo2go/about.html`
- **Contact**: `pizzadojo2go/contact.html`
- **Styles**: `pizzadojo2go/layout.css`
- **Assets**: `pizzadojo2go/assets/images/`

### Key CSS Classes
- `.container`: Main layout wrapper (grid)
- `.site-title`: Site header/title
- `.headline`: Page headline (h2)
- `.content`: Main content area
- `.actions`: Button container
- `.btn`: Button style
- `.overlay`: Background overlay
- `.bg-image`: Static background image
- `#bgVideo`: Video background element

### Color Scheme
- **Text**: White (#fff)
- **Background**: Black (#000) with overlay
- **Buttons**: Transparent with white border, white on hover
- **Overlay**: Black gradient (25% top, 65% bottom opacity)

---

**Last Updated**: December 2025
**Status**: Production-ready "Coming Soon" site
**Next Steps**: Content updates, form integration, SEO optimization






