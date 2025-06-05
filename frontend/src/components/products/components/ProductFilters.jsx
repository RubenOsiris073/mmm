import React from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { BsSearch, BsGrid3X3, BsList } from 'react-icons/bs';
import { formatCategoryTitle } from '../utils/categoryUtils';

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  allCategories,
  viewMode,
  setViewMode,
  onClearFilters
}) => {
  return (
    <div className="mb-4">
      <Row className="align-items-end">
        <Col md={5} lg={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                ×
              </Button>
            )}
          </InputGroup>
        </Col>
        
        <Col md={4} lg={4}>
          <Form.Select 
            className="mb-3"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {formatCategoryTitle(cat)}
              </option>
            ))}
            <option value="sin-categoria">Sin categoría</option>
          </Form.Select>
        </Col>
        
        <Col md={3} lg={4} className="d-flex justify-content-end gap-2">
          {/* Botones de vista */}
          <div className="btn-group mb-3">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('grid')}
              title="Vista de cuadrícula"
            >
              <BsGrid3X3 />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <BsList />
            </Button>
          </div>
          
          {/* Botón limpiar filtros */}
          {(searchTerm || selectedCategory !== 'all') && (
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={onClearFilters}
              title="Limpiar filtros"
            >
              <i className="bi bi-x-circle me-1"></i>
              Limpiar
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductFilters;