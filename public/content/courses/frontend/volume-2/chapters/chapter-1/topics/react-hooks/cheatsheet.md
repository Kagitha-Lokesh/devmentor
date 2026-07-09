# React Hooks Cheatsheet

## useState
```jsx
const [state, setState] = useState(initialValue);
setState(newValue);
setState(prev => prev + 1); // functional update
```

## useEffect
```jsx
useEffect(() => { /* effect */ }, [dependencies]);
useEffect(() => { /* once */ }, []);          // mount only
useEffect(() => { /* always */ });            // every render
useEffect(() => { return () => { /* cleanup */ }; }, [dep]);
```

## useContext
```jsx
const ThemeContext = createContext('light');
const theme = useContext(ThemeContext); // in consumer
```

## useRef
```jsx
const ref = useRef(null); // ref.current = null
// Does NOT trigger re-render when changed
```

## Rules of Hooks
1. Only call Hooks at the **top level** (not in if/loops)
2. Only call Hooks in **React function components** or custom hooks