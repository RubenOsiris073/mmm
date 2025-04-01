import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const TransactionList = ({ transactions }) => {
  return (
    <Card className="mb-4">
      <Card.Header>Últimas Transacciones</Card.Header>
      <ListGroup variant="flush">
        {transactions.length === 0 ? (
          <ListGroup.Item>No hay transacciones recientes</ListGroup.Item>
        ) : (
          transactions.map(transaction => (
            <ListGroup.Item key={transaction.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{transaction.productName}</strong>
                  <br />
                  <small className="text-muted">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </small>
                </div>
                <Badge bg={transaction.tipo === 'entrada' ? 'success' : 'danger'}>
                  {transaction.tipo === 'entrada' ? '+' : '-'}{transaction.cantidad}
                </Badge>
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
};

export default TransactionList;