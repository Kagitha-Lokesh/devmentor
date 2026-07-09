# Portfolio Website Architectural Architecture

## Component Design Tree
```
App.jsx (Router)
├── LayoutShell
│   ├── Navbar (Hamburger, Theme Toggle)
│   └── Footer (Copyright, Social Links)
└── Pages
    └── Portfolio (Single Page Layout)
        ├── HeroSection (Call To Action)
        ├── AboutSection (Bio & Key Stats)
        ├── SkillsSection (Grid & Badges)
        ├── ProjectsSection (Responsive Cards)
        └── ContactSection (Forms Validation)
```

## Theme Custom Styles & Design System
Use CSS custom variables declared in `:root` scope for typography, colors, and shadows:
```css
:root {
  --color-primary: #10b981;    /* Emerald Accent */
  --color-bg-light: #ffffff;
  --color-text-light: #0f172a;
  --color-bg-dark: #090d16;
  --color-text-dark: #f8fafc;
}
```

## Theme Switching Lifecycle Flow
1. User clicks Toggle button in Navbar.
2. Script toggles `data-theme="dark"` attribute on `<html>` tag.
3. Local storage is updated: `localStorage.setItem('theme', 'dark')`.
4. Page styles shift reactively.
