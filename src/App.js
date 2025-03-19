import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ObjectDetection from './components/ObjectDetection';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Container className="mt-4 mb-4">
        <Row>
          <Col>
            <h1 className="text-center mb-4">Detección de Objetos en Tiempo Real</h1>
            <ObjectDetection />
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default App;