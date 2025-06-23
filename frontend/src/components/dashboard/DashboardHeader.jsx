import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">{title}</h2>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default DashboardHeader;