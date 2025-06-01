// frontend/src/pages/POSMainPage.jsx
import React from 'react';
import POSLayout from '../components/layout/POSLayout';
import POSView from '../components/pos/POSView';

const POSMainPage = () => {
  return (
    <POSLayout>
      <div className="pos-main-page h-100">
        <POSView />
      </div>
    </POSLayout>
  );
};

export default POSMainPage;