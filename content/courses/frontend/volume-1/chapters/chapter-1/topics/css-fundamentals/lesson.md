# CSS Fundamentals

## Learning Objectives
- Understand the CSS Box Model.
- Apply selectors, colors, typography, and spacing.
- Control element visibility and positioning.

---

## What is CSS?
CSS (Cascading Style Sheets) describes how HTML elements should be displayed. Without CSS, the web would be plain black text on white backgrounds.

---

## The Cascade & Specificity
When multiple rules target the same element, CSS uses **specificity** to decide which wins.

| Selector | Specificity |
|---|---|
| Inline style | 1000 |
| ID `#id` | 100 |
| Class `.class`, attribute, pseudo-class | 10 |
| Element `div`, `p` | 1 |

```css
p { color: blue; }           /* specificity: 1 */
.text { color: green; }      /* specificity: 10 — wins */
#heading { color: red; }     /* specificity: 100 — wins over class */
```

---

## The Box Model
Every element is a rectangular box made up of four areas.

```
+---------------------------+
|         MARGIN            |  ← space outside border
|  +---------------------+  |
|  |       BORDER        |  |  ← outline around padding
|  |  +--------------+   |  |
|  |  |   PADDING    |   |  |  ← space inside border
|  |  | +----------+ |   |  |
|  |  | | CONTENT  | |   |  |  ← the actual text/image
|  |  | +----------+ |   |  |
|  |  +--------------+   |  |
|  +---------------------+  |
+---------------------------+
```

```css
.card {
    width: 300px;
    padding: 20px;     /* space inside */
    border: 2px solid #ccc;
    margin: 10px;      /* space outside */
    box-sizing: border-box; /* padding included in width */
}
```

---

## Positioning
```css
position: static;   /* default, normal flow */
position: relative; /* offset from normal position */
position: absolute; /* relative to nearest positioned ancestor */
position: fixed;    /* relative to viewport, stays on scroll */
position: sticky;   /* relative until scroll threshold */
```