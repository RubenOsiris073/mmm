import React from 'react';
import { Row, Col } from 'react-bootstrap';
import GoogleStudioDashboard from '../shared/GoogleStudioDashboard';

const DashboardContent = ({ dashboardUrl, title, height = "700px" }) => {
  return (
    <Row>
      <Col>
        <GoogleStudioDashboard 
          dashboardUrl={dashboardUrl}
          title={title}
          height={height}
        />
      </Col>
    </Row>
  );
};

export default DashboardContent;