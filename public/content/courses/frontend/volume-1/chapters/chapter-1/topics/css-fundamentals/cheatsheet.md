# CSS Fundamentals Cheatsheet

## Selectors
```css
*           { }  /* universal */
p           { }  /* element */
.className  { }  /* class */
#idName     { }  /* id */
div > p     { }  /* direct child */
div p       { }  /* descendant */
a:hover     { }  /* pseudo-class */
p::first-line { } /* pseudo-element */
```

## Box Model (border-box is best practice)
```css
* { box-sizing: border-box; }
```

## Common Properties
| Property | Example |
|---|---|
| color | `color: #333` |
| background | `background: #f0f0f0` |
| font-size | `font-size: 1rem` |
| font-weight | `font-weight: bold` |
| margin | `margin: 10px 20px` |
| padding | `padding: 8px 16px` |
| border | `border: 1px solid black` |
| border-radius | `border-radius: 8px` |
| display | `display: flex / block / inline` |