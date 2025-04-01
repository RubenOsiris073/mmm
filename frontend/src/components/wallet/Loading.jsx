import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = () => (
  <div className="text-center p-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-3">Cargando inventario...</p>
  </div>
);

export default Loading;