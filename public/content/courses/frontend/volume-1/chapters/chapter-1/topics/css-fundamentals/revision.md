# CSS — Revision Notes

## Box Model Mental Model
- content → padding → border → margin
- `box-sizing: border-box` makes width include padding + border (use always)

## Specificity Calculation
- Inline > ID > Class > Element
- `!important` overrides everything (avoid if possible)

## Display Values
- `block` — full width, new line
- `inline` — content width, no new line
- `inline-block` — content width, accepts width/height
- `flex` — flexible container
- `grid` — 2D layout system
- `none` — hides element completely