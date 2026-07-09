# React Hooks — Examples

## useEffect for API calls + cleanup
```jsx
function SearchResults({ query }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        const controller = new AbortController();

        fetch(`/api/search?q=${query}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => { setResults(data); setLoading(false); })
            .catch(() => setLoading(false));

        return () => controller.abort(); // cleanup: cancel previous request
    }, [query]);

    if (loading) return <p>Searching...</p>;
    return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```