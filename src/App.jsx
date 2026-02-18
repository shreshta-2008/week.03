import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- CLOSURE: TRACKS COMPONENT LIFECYCLE MEMORY ---
const createFetchTracker = () => {
  let attempts = 0;
  return () => {
    attempts++;
    return { count: attempts, timestamp: new Date().toLocaleTimeString() };
  };
};
const tracker = createFetchTracker();

// --- PRESENTATIONAL (DUMB) COMPONENTS ---

const SearchBar = ({ value, onChange }) => (
  <div className="search-container">
    <input
      type="text"
      className="marvel-input"
      placeholder="Search Avengers database (Try: Iron Man, Thor, Hulk)..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SkeletonCard = () => (
  <div className="product-card">
    <div className="product-image skeleton" style={{ height: '200px' }} />
    <div className="product-info">
      <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '10px' }} />
      <div className="skeleton" style={{ height: '15px', width: '40%' }} />
    </div>
  </div>
);

const ProductCard = ({ product, onClick }) => (
  <div className="product-card" onClick={onClick}>
    <img src={product.thumbnail} alt={product.title} className="product-image" />
    <div className="product-info">
      <h3>{product.title}</h3>
      <p className="price-tag">${product.price}</p>
    </div>
  </div>
);

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>&times;</button>
        <div className="modal-body">
          <img src={product.thumbnail} alt={product.title} style={{ width: '100%', borderRadius: '8px' }} />
          <div>
            <h2>{product.title}</h2>
            <p style={{ color: '#aaa', margin: '1rem 0' }}>{product.description}</p>
            <p>Rating: ⭐ {product.rating}</p>
            <p className="price-tag" style={{ fontSize: '2rem' }}>${product.price}</p>
            <button className="buy-btn">Assemble to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CONTAINER (SMART) COMPONENT ---

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fetchStats, setFetchStats] = useState({ count: 0, timestamp: '' });

  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true);
      const stats = tracker(); 
      setFetchStats(stats);

      try {
        // We fetch ALL products to ensure we get data
        const response = await fetch('https://dummyjson.com/products?limit=20');
        const data = await response.json();
        
        // MARVEL-IZER: We map the real API data to Marvel Toy names 
        // to make sure your theme stays consistent!
        const marvelNames = [
          "Iron Man Action Figure", "Thor Hammer (Mjolnir)", "Captain America Shield", 
          "Spider-Man Web Shooter", "Black Widow Stingers", "Hulk Smash Gloves",
          "Black Panther Mask", "Doctor Strange Eye of Agamotto", "Groot Plushie",
          "Star-Lord Helmet", "Ant-Man Shrink Suit", "Wolverine Claws"
        ];

        const cleanData = data.products.map((p, index) => ({
          ...p,
          title: marvelNames[index] || `Marvel Item #${p.id}`,
          description: `Authentic Stark Industries ${marvelNames[index] || 'Gear'}. High quality and Battle-tested.`
        }));

        setProducts(cleanData);
      } catch (err) {
        console.error("Hydra intercepted the data!", err);
      } finally {
        setLoading(false);
      }
    };
    loadHeroes();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  return (
    <div className="app-container">
      <header>
        <h1 className="shop-title">Marvel Toy Vault</h1>
        <div className="stats-bar">
          MISSION STATUS: {loading ? 'FETCHING...' : 'READY'} | ACCESS ATTEMPTS: {fetchStats.count} | LAST SYNC: {fetchStats.timestamp}
        </div>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </header>

      <main className="product-grid">
        {loading ? (
          Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
          ))
        )}
      </main>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}