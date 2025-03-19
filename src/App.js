import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './services/firebase';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product, imageFile) => {
    try {
      let imageUrl = null;
      
      if (imageFile) {
        const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      await addDoc(collection(db, "productos"), {
        ...product,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const updateProduct = async (productId, updatedData, imageFile) => {
    try {
      const productRef = doc(db, "productos", productId);
      const productToUpdate = products.find(p => p.id === productId);
      
      let imageUrl = productToUpdate.imageUrl;
      
      if (imageFile) {
        // Delete old image if exists
        if (imageUrl) {
          try {
            const oldImageRef = ref(storage, imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log("Error deleting old image: ", error);
          }
        }
        
        // Upload new image
        const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      await updateDoc(productRef, {
        ...updatedData,
        imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const deleteProduct = async (productId, imageUrl) => {
    try {
      // Delete document
      await deleteDoc(doc(db, "productos", productId));
      
      // Delete image if exists
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.log("Error deleting image: ", error);
        }
      }
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-4">
            <ProductForm 
              addProduct={addProduct} 
              updateProduct={updateProduct}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
            />
          </div>
          <div className="col-md-8">
            <ProductList 
              products={products} 
              loading={loading}
              onEdit={setEditingProduct}
              onDelete={deleteProduct}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;