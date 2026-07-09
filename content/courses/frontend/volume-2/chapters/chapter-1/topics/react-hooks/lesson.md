# React Hooks

## Learning Objectives
- Manage component state using useState.
- Run side effects with useEffect.
- Share state without prop drilling using useContext.

---

## What are Hooks?
Hooks are functions that let you "hook into" React state and lifecycle features from **function components**. Before Hooks (React 16.8), only class components could have state.

---

## useState — Managing State
```jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0); // initial value = 0

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <button onClick={() => setCount(c => c - 1)}>-1</button>
        </div>
    );
}
```

> [!IMPORTANT]
> Never mutate state directly: `count++` won't trigger re-render. Always use the setter function.

---

## useEffect — Side Effects
```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Runs after render when userId changes
        fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(data => setUser(data));

        // Cleanup function (runs before next effect / unmount)
        return () => console.log('cleanup');
    }, [userId]); // dependency array: re-run when userId changes

    return <div>{user ? user.name : 'Loading...'}</div>;
}
```

**Dependency Array Rules:**
- `[]` — run once after first render (like componentDidMount)
- `[dep1, dep2]` — re-run when deps change
- No array — run after every render

---

## useRef — Persistent Value / DOM Access
```jsx
const inputRef = useRef(null);

// Access DOM element
<input ref={inputRef} />
<button onClick={() => inputRef.current.focus()}>Focus</button>
```