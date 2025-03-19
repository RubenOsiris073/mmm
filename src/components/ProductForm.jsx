import React, { useState, useEffect } from 'react';

const ProductForm = ({ addProduct, updateProduct, editingProduct, setEditingProduct }) => {
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        category: editingProduct.category || '',
        stock: editingProduct.stock || ''
      });
      
      if (editingProduct.imageUrl) {
        setPreviewUrl(editingProduct.imageUrl);
      }
    } else {
      resetForm();
    }
  }, [editingProduct]);
  
  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setPreviewUrl('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.price) {
      alert('Por favor complete los campos obligatorios');
      return;
    }
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0
    };
    
    if (editingProduct) {
      updateProduct(editingProduct.id, productData, imageFile);
    } else {
      addProduct(productData, imageFile);
    }
    
    resetForm();
  };
  
  const handleCancel = () => {
    setEditingProduct(null);
    resetForm();
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nombre*</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Precio*</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Categoría</label>
            <input
              type="text"
              className="form-control"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="stock" className="form-label">Stock</label>
            <input
              type="number"
              className="form-control"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Imagen</label>
            <input
              type="file"
              className="form-control"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          {previewUrl && (
            <div className="mb-3">
              <label className="form-label">Vista previa</label>
              <div className="text-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '200px' }} 
                />
              </div>
            </div>
          )}
          
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Actualizar' : 'Guardar'}
            </button>
            {editingProduct && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;