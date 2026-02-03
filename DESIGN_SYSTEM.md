# DocuFlux Frontend Design System

> **Note**: This document serves as the "memory" of the frontend architecture and design choices.

## 1. Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with CSS Variables for theme)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Fonts**:
  - Headings: `Outfit` (via Google Fonts)
  - Body: `Inter` (via Google Fonts)

## 2. Design Tokens

### Colors
**Brand Colors (Emerald/Green)**
- Primary-500: `#047857`
- Primary-600: `#065F46`
- Primary-700: `#064E3B`
- Background (Cream): `#FFFCF5`
- Gradient: `from-emerald-600 to-teal-500` (used in text clip)

### Typography
- **Heading Font**: `Outfit` (Bold, Modern)
- **Body Font**: `Inter` (Clean, Legible)
- **Classes**: `.font-display` for headings, `.font-sans` for body.

### Common Effects
- **Glassmorphism**: `.glass` utility class
  ```css
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  ```
- **Text Gradient**: `.text-gradient`
- **Soft Shadows**: `shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]`

## 3. Directory Structure
```
frontend/
├── app/
│   ├── components/    # Reusable UI components
│   ├── tools/         # Tool-specific pages (pdf-to-word, etc.)
│   ├── globals.css    # Global styles & Tailwind directives
│   ├── layout.tsx     # Root layout (Metadata, Font loading)
│   └── page.tsx       # Landing page
```

## 4. Key Components

### **Navbar** (`Navbar.tsx`)
- **Behavior**: Sticky, transforms on scroll (intended), glass effect.
- **State**: Manages mobile menu (`isOpen`), Auth modals (`showAuthModal`), and mock login state.
- **Responsiveness**: Hamburger menu on mobile (< md), full links on desktop.

### **Hero** (`Hero.tsx`)
- **Layout**: Two-column (Text Left, Visual Right).
- **Interactive**:
  - Entrance animations using `framer-motion` (fade up/in).
  - Floating badges ("Converted", "Compressed") with continuous y-axis oscillation.
- **Visuals**: Abstract gradient background blobs.

### **Modals**
- `AuthModal.tsx`: Login/Signup handling.
- `ProfileSettingsModal.tsx`: User settings.

## 5. Development Patterns
- **"use client"**: Explicitly used for components with state/animations.
- **Micro-interactions**: Hover effects on buttons (`hover:bg-emerald-900`, `transition`).
- **Gradients**: Heavy use of subtle gradients for backgrounds and text.
