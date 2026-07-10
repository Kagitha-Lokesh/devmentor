# JavaMentor — Security & Quality Specifications

This document maps out user privacy isolation boundaries, DOMPurify sanitizer configurations, WCAG 2.1 AA targets, and testing coverage structures.

---

## 1. Security & Data Isolation

### A. DOMPurify Sanitization
All dynamically parsed Markdown values are sanitized to protect against cross-site scripting (XSS):
- Uses `DOMPurify.sanitize(html)` to clean output tags.
- Embedded inside `MarkdownRenderer.jsx` to parse lesson descriptions safely.

### B. Firestore Rules & User Isolation
Access controls are verified inside `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(uid) { return isAuthenticated() && request.auth.uid == uid; }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```
This forces user document locks, preventing read/write actions on foreign folders.

---

## 2. Performance & Web Vitals Budget

All production builds must satisfy the following budget limits:

| Metric | Target Budget Limit |
| ------ | ------------------- |
| **Initial JS bundle** | < 300 KB gzipped |
| **Largest Route bundle** | < 600 KB |
| **Largest Contentful Paint (LCP)** | < 2.5 seconds |
| **Interaction to Next Paint (INP)** | < 200 milliseconds |
| **Cumulative Layout Shift (CLS)** | < 0.1 |

- **Monaco & Route Splitting**: Lazy load the Monaco code editor instance and secondary routes (Compiler, Revision, Interviews, Assistant, Projects).
- **List Virtualization**: Implement window-virtualized list containers for long items (Timeline logs, active notes lists) to keep DOM nodes minimal.

---

## 3. Accessibility Standards (WCAG 2.1 AA)

- **Keyboard navigation**: Focus indicators (`:focus-visible`) are styled with high-contrast outlines.
- **Focus Trap**: Modals (`Modal.jsx`) and Sidebars (`Sidebar.jsx`) trap focus within active dialog boundaries on Escape/Tab navigation.
- **Touch margin**: Interactive click points have a minimum size of 44px on mobile devices.
- **Skip Link**: `LayoutShell.jsx` provides a skip-to-content anchor for keyboard navigation users.
