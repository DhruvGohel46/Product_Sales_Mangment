import { useState, useEffect } from 'react';

/**
 * Debounce a value by `delay` milliseconds.
 *
 * Usage:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *   // Use `debouncedSearch` for filtering / API calls
 *
 * This prevents excessive re-renders and API calls when the user
 * types rapidly (e.g. product search in POS).
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
