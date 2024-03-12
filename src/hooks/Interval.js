import { useEffect, useState } from 'react';

export function useAsyncInterval(asyncFunction, interval = 5000, dep = []) {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Define a function that wraps the async call
        const fetchData = async () => {
            try {
                const result = await asyncFunction();
                setData(result);
            } catch (error) {
                console.error('Error in async function:', error);
            }
        };

        // Call the function immediately and then set up the interval
        fetchData();
        const intervalId = setInterval(fetchData, interval);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [interval, ...dep]); // dependencies array

    return data;
}