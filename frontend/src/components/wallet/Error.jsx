import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const Error = ({ error, onRetry }) => (
  <Alert variant="danger" className="m-3">
    <Alert.Heading>Error</Alert.Heading>
    <p>{error}</p>
    <hr />
    <div className="d-flex justify-content-end">
      <Button onClick={onRetry} variant="outline-danger">
        Reintentar
      </Button>
    </div>
  </Alert>
);

export default Error;