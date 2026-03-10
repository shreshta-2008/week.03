import React, { useState, useEffect } from 'react';
import './App.css';

// --- CLOSURE FOR MEMORY ---
// This tracks how many times the shop has been "restocked" (fetched)
const createFetchTracker = () => {
  let attempts = 0;
  return () => {
    attempts += 1;
    return attempts;
  };
};
const trackAttempt = createFetchTracker();

// --- PRESENTER (DUMB) COMPONENT ---
// Just displays what it's given. No logic.
const ProductCard = ({ title, price, thumbnail, loading }) => {
  if (loading) {
    return <div className="skeleton"></div>;
  }

  return (
    <div className="item-card">
      <img src={thumbnail} alt={title} style={{ width: '100%', borderRadius: '5px' }} />
      <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>{title}</h3>
      <p style={{ color: '#d4af37', fontWeight: 'bold' }}>{price} Galleons</p>
    </div>
  );
};

// --- CONTAINER (SMART) COMPONENT ---
// Handles data, state, and async logic
function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchMagicSupplies = async () => {
    setLoading(true);
    const currentAttempt = trackAttempt();
    setFetchCount(currentAttempt);

    try {
      // Mixing Async/Await with a Promise Chain for the experiment
      const response = await fetch('https://dummyjson.com/products?limit=12');
      const data = await response.json()
        .then(res => {
          console.log(`Spell cast successfully! Attempt: ${currentAttempt}`);
          return res.products;
        });
      
      setProducts(data);
    } catch (error) {
      console.error("The dark arts interfered with our fetch!", error);
    } finally {
      // Artificial delay to appreciate the skeleton UI
      setTimeout(() => setLoading(false), 1500);
    }
  };

  useEffect(() => {
    fetchMagicSupplies();
  }, []);

  return (
    <div className="apothecary-container">
      <header>
        <h1>Hogwarts Apothecary</h1>
        <p>Restock Attempts: {fetchCount}</p>
        <button 
          onClick={fetchMagicSupplies}
          style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'serif' }}
        >
          Cast "Accio Products"
        </button>
      </header>

      <div className="product-grid">
        {loading 
          ? Array(8).fill(0).map((_, i) => <ProductCard key={i} loading={true} />)
          : products.map(item => (
              <ProductCard 
                key={item.id} 
                title={item.title} 
                price={item.price} 
                thumbnail={item.thumbnail} 
                loading={false} 
              />
            ))
        }
      </div>
    </div>
  );
}

export default App;