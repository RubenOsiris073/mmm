import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

/**
 * Componente para mostrar notificaciones flotantes (toasts)
 */
const ToastNotifications = ({ toasts, getNotificationIcon, setToasts }) => {
  return (
    <ToastContainer position="top-end" className="p-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show={toast.show}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          delay={5000}
          autohide
          className={`border-${toast.type === 'error' ? 'danger' : toast.type}`}
        >
          <Toast.Header>
            {getNotificationIcon(toast.type)}
            <strong className="me-auto ms-2">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default ToastNotifications;
