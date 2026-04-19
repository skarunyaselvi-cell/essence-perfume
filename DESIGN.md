# ESSENCE — Premium 3D Perfume Brand Showcase

## Tone & Aesthetic
Ultra-premium cinematic luxury, editorial brand experience. Dark + gold elegance, glassmorphism, smooth scroll reveals. Storytelling-first (no e-commerce).

## Purpose
Immersive 11-section perfume journey: 1 hero + 10 perfume experiences. Each section unique gradient matching fragrance identity. Pure visual + emotional storytelling.

## Color Palette (OKLCH)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Background | `0.06 0 0` | `0.06 0 0` | Deep navy base |
| Foreground | `0.95 0 0` | `0.95 0 0` | White text |
| Primary (Gold) | `0.60 0.24 79.2` | `0.60 0.24 79.2` | Accents, cursor, borders |
| Card | `0.12 0 0` | `0.12 0 0` | Glassmorphic info boxes |
| Muted | `0.25 0 0` | `0.25 0 0` | Secondary elements |
| Destructive | `0.65 0.19 22` | `0.65 0.19 22` | Interactive states |

## Typography
- **Display**: Fraunces (serif) — perfume names, hero title; 0.15em letter-spacing for luxury
- **Body**: GeneralSans (sans-serif) — descriptions, tags; readable, clean
- **Mono**: GeistMono — technical/UI elements if needed

## Structural Zones
- **Hero Section**: Full-viewport, centered 3D bottle animation, floating particles, gold glow pulse
- **Nav**: Sticky top, glass effect, gold border-bottom, navigation links with underline on hover
- **Perfume Cards**: Glassmorphic (20px blur, 0.5 opacity), gold borders, tag pills with hover scale
- **Backgrounds**: Per-perfume gradients (Jasmine cream-gold, Rose deep red-pink, Ocean blue, etc.)
- **Hover States**: Ingredient tags scale up, borders intensify, cursor ring glows

## Motion & Interaction
- **Scroll Reveals**: GSAP ScrollTrigger fade-in-up on perfume cards
- **Cursor Ring**: Custom gold circle follows mouse, intensifies on hover
- **Smooth Transitions**: All state changes 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Float Animation**: 3D bottles bob gently; particles float upward with opacity fade

## Component Patterns
- Glassmorphic cards w/ backdrop-blur-xl + gold semi-transparent border
- Tag pills: `bg-opacity-10` primary, border primary, scale on hover
- Icon accents: Sparkle emoji or minimal SVG in gold
- Gradient backgrounds: 135deg angle, 10% chroma variation per perfume

## Differentiators
1. **Gold Cursor Glow**: Signature interaction — custom ring follows mouse, glow on hover
2. **No UI Chrome**: Ultra-minimal nav, no footers, pure content focus
3. **Perfume Gradients**: Each fragrance unique background gradient encoding its scent profile
4. **3D Procedural Geometry**: No external models; Three.js bottles with rotating liquid
5. **Scroll-Linked Reveals**: Cards fade in as user scrolls; no page load animations

## Signature Detail
Gold cursor + softly glowing perfume bottle in hero + particle effects = cinematic unboxing experience.
