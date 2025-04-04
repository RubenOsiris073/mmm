import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { getRegisteredProducts } from '../../services/storageService';
import BatchProductForm from './BatchProductForm';
import BatchProductList from './BatchProductList';
import RegisteredProducts from './RegisteredProducts';
import AutomaticRegistration from './AutomaticRegistration';

const InventoryView = () => {
  const [products, setProducts] = useState([]);
  const [batchProducts, setBatchProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('manual');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getRegisteredProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const onBatchSaved = () => {
    setBatchProducts([]);
    loadProducts();
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Gestión de Inventario</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="manual" title="Registro Manual">
          <BatchProductForm 
            batchProducts={batchProducts}
            setBatchProducts={setBatchProducts}
          />

          <BatchProductList 
            batchProducts={batchProducts}
            setBatchProducts={setBatchProducts}
            onBatchSaved={onBatchSaved}
          />
        </Tab>
        <Tab eventKey="automatic" title="Registro Automático">
          <AutomaticRegistration onProductRegistered={loadProducts} />
        </Tab>
      </Tabs>

      <RegisteredProducts products={products} />
    </Container>
  );
};

export default InventoryView;