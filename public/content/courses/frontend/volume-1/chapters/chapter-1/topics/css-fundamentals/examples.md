# CSS — Code Examples

## A styled card component
```css
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 24px;
    max-width: 360px;
    margin: 20px auto;
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-4px);
}

.card h2 {
    font-size: 1.4rem;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.card p {
    color: #555;
    line-height: 1.6;
}
```