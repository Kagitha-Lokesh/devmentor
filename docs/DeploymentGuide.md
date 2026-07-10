# DevMentor AI — Production Deployment Guide

## 1. Firebase Hosting Setup

### A. Initialization
Ensure the project is logged in to Firebase CLI:
```bash
firebase login
```
Associate the repository with your Firebase Hosting project:
```bash
firebase use --add
```

### B. Deployment
Run production compilation first:
```bash
# Build the production bundle
npm run build

# Deploy assets to Firebase Hosting
firebase deploy --only hosting
```

---

## 2. Environment Variables & Preview
Verify all credentials in Google Firebase Project Dashboard align with configurations:
- Firebase Spark Plan database write thresholds are set.
- PWA manifests and icon indexes are located inside `/public` before building.
- Security Headers are set up inside `firebase.json` for clickjacking/frame options security.
