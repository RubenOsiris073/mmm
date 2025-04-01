import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import { BiEdit, BiTrash, BiHistory } from 'react-icons/bi';

const InventarioTable = ({ inventario = [], onEdit, onDelete, onViewHistory }) => {
  // Función para determinar el color del badge según la cantidad
  const getBadgeVariant = (cantidad) => {
    if (cantidad <= 0) return 'danger';
    if (cantidad <= 5) return 'warning';
    return 'success';
  };

  // Función para formatear la fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (!inventario.length) {
    return (
      <Card className="text-center p-4">
        <Card.Body>
          <p className="text-muted mb-0">
            No hay productos registrados en el inventario
          </p>
          <small className="text-muted">
            Use la cámara para detectar y registrar productos
          </small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-light">
        <h5 className="mb-0">Inventario Actual</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Categoría</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">{item.nombre}</span>
                      {item.deteccion && (
                        <small className="text-muted">
                          Confianza: {(item.deteccion.confidence * 100).toFixed(2)}%
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge bg={getBadgeVariant(item.cantidad)}>
                      {item.cantidad}
                    </Badge>
                  </td>
                  <td>
                    {item.categoria || (
                      <span className="text-muted">Sin categoría</span>
                    )}
                  </td>
                  <td>
                    <small>{formatDate(item.updatedAt)}</small>
                  </td>
                  <td>
                    <div className="btn-group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit && onEdit(item)}
                        title="Editar"
                      >
                        <BiEdit />
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => onViewHistory && onViewHistory(item)}
                        title="Ver historial"
                      >
                        <BiHistory />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete && onDelete(item)}
                        title="Eliminar"
                      >
                        <BiTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      <Card.Footer className="bg-light">
        <small className="text-muted">
          Total de productos: {inventario.length}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default InventarioTable;