# DevMentor AI — Developer Setup & Workflow Guide

## 1. Project Requirements
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Firebase CLI**: Installed globally (`npm install -g firebase-tools`)

---

## 2. Environment Configuration
Copy `.env.example` to `.env.local` and customize the variables:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ENVIRONMENT=development
```

---

## 3. Running Locally
To launch the developer runtime and local static content registry compilation:
```bash
# Install dependencies
npm install

# Start local dev server (triggers build-time search registry generation first)
npm run dev
```

---

## 4. Code Standards & Linting
We enforce fast Oxlint checking. Run the check before making pull requests:
```bash
# Run oxlint check
npm run lint
```
All imports must remain structured, avoiding relative paths imports beyond the `/src` boundaries when using absolute aliases.
