"use client";
import React, { useEffect, useState } from 'react';

const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const result = await fetchData('/api/data');
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAndSetData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Data Loaded</h1>
      <h2>Items</h2>
      <pre>{JSON.stringify(data.items, null, 2)}</pre>
      <h2>Moisture</h2>
      <pre>{JSON.stringify(data.moisture, null, 2)}</pre>
      <h2>Temperatures</h2>
      <pre>{JSON.stringify(data.temperatures, null, 2)}</pre>
      <h2>Trial Durations</h2>
      <pre>{JSON.stringify(data.trialDurations, null, 2)}</pre>
    </div>
  );
};

export default Home;