import React from 'react';
import { Row, Col, Form, Button, Badge, InputGroup } from 'react-bootstrap';

const ProductFiltersTest = ({
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
      {/* Header de filtros con tema de testing */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <h5 className="mb-0 me-3">
            <i className="bi bi-funnel-fill text-info me-2"></i>
            Filtros de Testing
          </h5>
          <Badge bg="info" className="small">
            🧪 Entorno de Pruebas
          </Badge>
        </div>
        
        {/* Toggle de vista */}
        <div className="btn-group" role="group">
          <Button
            variant={viewMode === 'grid' ? 'info' : 'outline-info'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-grid-3x3-gap me-1"></i>
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'info' : 'outline-info'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-list-ul me-1"></i>
            Lista
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Row className="g-3 align-items-end">
        {/* Búsqueda */}
        <Col md={6}>
          <Form.Label className="small fw-semibold text-muted">
            <i className="bi bi-search me-1"></i>
            Buscar productos de testing
          </Form.Label>
          <InputGroup>
            <InputGroup.Text className="bg-info bg-opacity-10 border-info">
              <i className="bi bi-search text-info"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-info focus-ring-info"
              style={{
                borderLeft: 'none',
                '&:focus': {
                  borderColor: '#0dcaf0',
                  boxShadow: '0 0 0 0.2rem rgba(13, 202, 240, 0.25)'
                }
              }}
            />
            {searchTerm && (
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => setSearchTerm('')}
                style={{ borderLeft: 'none' }}
              >
                <i className="bi bi-x"></i>
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Filtro por categoría */}
        <Col md={4}>
          <Form.Label className="small fw-semibold text-muted">
            <i className="bi bi-tags me-1"></i>
            Categoría de testing
          </Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-info focus-ring-info"
            style={{
              '&:focus': {
                borderColor: '#0dcaf0',
                boxShadow: '0 0 0 0.2rem rgba(13, 202, 240, 0.25)'
              }
            }}
          >
            <option value="all">🧪 Todas las categorías (Testing)</option>
            {allCategories.map(category => (
              <option key={category} value={category}>
                {category} (Test)
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Botón limpiar filtros */}
        <Col md={2}>
          <div className="d-grid">
            <Button
              variant="outline-info"
              onClick={onClearFilters}
              className="d-flex align-items-center justify-content-center"
              disabled={!searchTerm && selectedCategory === 'all'}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Indicadores activos de filtros */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mt-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="small text-muted fw-semibold">
              <i className="bi bi-filter-circle text-info me-1"></i>
              Filtros activos:
            </span>
            
            {searchTerm && (
              <Badge 
                bg="info" 
                className="d-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-search"></i>
                "{searchTerm}"
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1 text-white"
                  style={{ fontSize: '0.7rem', lineHeight: 1 }}
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </Badge>
            )}
            
            {selectedCategory !== 'all' && (
              <Badge 
                bg="info" 
                className="d-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-tag"></i>
                {selectedCategory}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1 text-white"
                  style={{ fontSize: '0.7rem', lineHeight: 1 }}
                  onClick={() => setSelectedCategory('all')}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Separador con estilo de testing */}
      <hr 
        className="mt-4 mb-0" 
        style={{
          background: 'repeating-linear-gradient(90deg, #0dcaf0 0, #0dcaf0 5px, transparent 5px, transparent 10px)',
          height: '2px',
          border: 'none',
          opacity: 0.6
        }}
      />
    </div>
  );
};

export default ProductFiltersTest;