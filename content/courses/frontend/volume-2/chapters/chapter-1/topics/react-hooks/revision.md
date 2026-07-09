# React Hooks — Revision Notes

## Why Functional Update?
`setState(prev => prev + 1)` is safer than `setState(count + 1)` when updates are batched or asynchronous. Use functional updates whenever the new state depends on the previous state.

## useEffect Cleanup is Critical
Without cleanup, subscriptions, timers, and fetch calls can cause memory leaks if the component unmounts before they complete.

## Common Hook Mistakes
1. Missing dependency in useEffect array → stale closures
2. Creating objects/arrays in dependency array → infinite re-renders
3. Setting state inside useEffect without a condition → infinite loop