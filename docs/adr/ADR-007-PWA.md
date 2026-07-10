# ADR-007: Packaging as Progressive Web App (PWA)

## Context
Deploying native applications for Windows, macOS, Android, and iOS viewports requires high platform overhead. DevMentor AI must run on all devices out-of-the-box.

## Decision
We package the frontend using Progressive Web App specifications (`vite-plugin-pwa`), creating a cache manifest, loading service worker cache assets offline, and allowing native home-screen installation.

## Consequences
- **Pros**: Fast layout delivery, native application feel, multi-platform installations without app stores.
- **Cons**: Service worker cache synchronization issues can serve stale resources during deployments.
