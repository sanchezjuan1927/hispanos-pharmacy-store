'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import CategoryButtons from '../components/CategoryButtons';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import { useStore } from '../context/StoreContext';
import { placeholderProducts } from '../lib/products';

export default function Home() {
  const { lang } = useStore();
  const [category, setCategory] = useState('todos');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    let products = placeholderProducts;

    if (category !== 'todos') {
      products = products.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      products = products.filter((p) => {
        const name = lang === 'es' ? p.name_es : p.name_en;
        return name.toLowerCase().includes(query);
      });
    }

    return products;
  }, [category, search, lang]);

  return (
    <>
      <Header search={search} onSearchChange={setSearch} />
      <main>
        <CategoryButtons active={category} onSelect={setCategory} />
        <ProductGrid products={filteredProducts} />
      </main>
      <Cart />
      <Checkout />
    </>
  );
}
