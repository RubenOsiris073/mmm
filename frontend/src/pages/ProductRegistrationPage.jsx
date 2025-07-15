import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaCamera, FaBoxOpen, FaPlus } from 'react-icons/fa';
import CameraDetectionComponent from '../components/products/CameraDetectionComponent';
import ProductRegistrationForm from '../components/products/ProductRegistrationForm';
import ProductUpdateForm from '../components/products/ProductUpdateForm';
import apiService from '../services/apiService';
import { getProductInfoFromLabel, generateProductCodeFromLabel, getSuggestedExpirationDate } from '../utils/productMapping';

const ProductRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState('selection'); // selection, camera, form
  const [detectionResult, setDetectionResult] = useState(null);
  const [existingProduct, setExistingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset states when starting over
  const resetFlow = () => {
    setCurrentStep('selection');
    setDetectionResult(null);
    setExistingProduct(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  // Handle detection result from camera
  const handleDetectionResult = async (detection) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Detection result received:', detection);
      
      // Enriquecer la detección con información del mapeo
      const productInfo = getProductInfoFromLabel(detection.label);
      const enrichedDetection = {
        ...detection,
        productInfo,
        suggestedCode: generateProductCodeFromLabel(detection.label),
        suggestedExpirationDate: getSuggestedExpirationDate(productInfo.categoria, productInfo.perecedero)
      };
      
      setDetectionResult(enrichedDetection);

      // Search for existing product by class_name/label
      const products = await apiService.getProducts();
      console.log('Products response:', products);
      
      // Extraer correctamente el array de productos
      let productsData = [];
      if (products.data && Array.isArray(products.data.data)) {
        productsData = products.data.data;
      } else if (products.data && Array.isArray(products.data)) {
        productsData = products.data;
      } else if (Array.isArray(products)) {
        productsData = products;
      }
      
      console.log('Products data array:', productsData);
      console.log('Is array?', Array.isArray(productsData));
      
      // Look for product with matching detection label or similar name
      const foundProduct = productsData.find(product => 
        product.detectionId === detection.label ||
        product.nombre?.toLowerCase().includes(detection.label.toLowerCase()) ||
        product.nombre?.toLowerCase().includes(productInfo.nombre.toLowerCase()) ||
        product.label?.toLowerCase().includes(detection.label.toLowerCase())
      );

      if (foundProduct) {
        // Product found - show simplified form for stock update
        console.log('Producto existente encontrado:', foundProduct.nombre);
        setExistingProduct(foundProduct);
        setCurrentStep('product-update');
      } else {
        // Product not found - show full registration form with pre-filled data
        console.log('Producto nuevo detectado:', productInfo.nombre);
        setExistingProduct(null);
        setCurrentStep('product-registration');
      }
    } catch (err) {
      setError(`Error processing detection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle product stock update for existing product
  const handleProductStockUpdate = async (updateData) => {
    try {
      setLoading(true);
      setError(null);

      // Update product stock
      const response = await apiService.updateProductStock(
        existingProduct.id,
        updateData.quantity,
        `Registro por detección: ${detectionResult.label}`
      );

      if (response.success) {
        setSuccess(`Inventario actualizado: +${updateData.quantity} unidades de ${existingProduct.nombre}`);
        // Ask if user wants to register another product
        setTimeout(() => {
          const continueRegistration = window.confirm('¿Desea registrar otro producto?');
          if (continueRegistration) {
            resetFlow();
          }
        }, 2000);
      }
    } catch (err) {
      setError(`Error updating inventory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle new product registration
  const handleProductRegistration = async (productData) => {
    try {
      setLoading(true);
      setError(null);

      // Create new product with detection mapping
      const newProduct = {
        ...productData,
        detectionId: detectionResult.label,
        precisionDeteccion: detectionResult.similarity,
        cantidad: productData.initialQuantity || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const response = await apiService.createProduct(newProduct);

      if (response.success || response.id) {
        setSuccess(`Producto creado exitosamente: ${productData.nombre} con ${productData.initialQuantity} unidades`);
        // Ask if user wants to register another product
        setTimeout(() => {
          const continueRegistration = window.confirm('¿Desea registrar otro producto?');
          if (continueRegistration) {
            resetFlow();
          }
        }, 2000);
      }
    } catch (err) {
      setError(`Error creating product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FaBoxOpen className="me-2" />
                Registro de Productos con Detección
              </h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              {/* Step 1: Selection */}
              {currentStep === 'selection' && (
                <div className="text-center py-4">
                  <h5 className="mb-4">Seleccione el método de registro</h5>
                  <Row className="justify-content-center">
                    <Col md={6}>
                      <Card className="h-100 border-primary">
                        <Card.Body className="text-center">
                          <FaCamera size={48} className="text-primary mb-3" />
                          <h6>Registro con Cámara</h6>
                          <p className="text-muted">
                            Use la cámara para detectar productos automáticamente
                          </p>
                          <Button 
                            variant="primary" 
                            onClick={() => setCurrentStep('camera')}
                            disabled={loading}
                          >
                            Activar Cámara
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="h-100 border-secondary">
                        <Card.Body className="text-center">
                          <FaPlus size={48} className="text-secondary mb-3" />
                          <h6>Registro Manual</h6>
                          <p className="text-muted">
                            Registre productos manualmente sin cámara
                          </p>
                          <Button 
                            variant="secondary" 
                            onClick={() => setCurrentStep('product-registration')}
                            disabled={loading}
                          >
                            Registro Manual
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Step 2: Camera Detection */}
              {currentStep === 'camera' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Detección por Cámara</h5>
                    <Button variant="outline-secondary" onClick={resetFlow}>
                      Volver
                    </Button>
                  </div>
                  <CameraDetectionComponent 
                    onDetectionResult={handleDetectionResult}
                    onError={setError}
                    loading={loading}
                  />
                </div>
              )}

              {/* Step 3: Product Update (Existing Product) */}
              {currentStep === 'product-update' && existingProduct && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Actualizar Stock - Producto Existente</h5>
                    <Button variant="outline-secondary" onClick={resetFlow}>
                      Nuevo Registro
                    </Button>
                  </div>
                  <ProductUpdateForm
                    product={existingProduct}
                    detectionResult={detectionResult}
                    onSubmit={handleProductStockUpdate}
                    loading={loading}
                  />
                </div>
              )}

              {/* Step 4: Product Registration (New Product) */}
              {currentStep === 'product-registration' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>
                      {detectionResult ? 'Registrar Nuevo Producto Detectado' : 'Registro Manual de Producto'}
                    </h5>
                    <Button variant="outline-secondary" onClick={resetFlow}>
                      Volver
                    </Button>
                  </div>
                  <ProductRegistrationForm
                    detectionResult={detectionResult}
                    onSubmit={handleProductRegistration}
                    loading={loading}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductRegistrationPage;