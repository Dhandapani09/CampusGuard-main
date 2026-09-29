import React, { useState } from 'react';
import VisitorForm from '../components/gate/VisitorForm';
import PassPreview from '../components/gate/PassPreview';
import Modal from '../components/shared/Modal';
import { useVisitorContext } from '../context/VisitorContext';
import './GateEntry.css';

const GateEntry = () => {
  const { checkIn } = useVisitorContext();
  const [generatedPass, setGeneratedPass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormComplete = (data) => {
    // Generate Pass
    const checkedInVisitor = checkIn(data);
    setGeneratedPass(checkedInVisitor);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
    setIsModalOpen(false);
    setGeneratedPass(null);
    // In a real app, we might redirect or reset form here
  };

  return (
    <div className="page-container gate-entry-page">
      <div className="page-header">
        <h1>Gate Registration</h1>
        <p>Register new visitors, verify identity, and generate gate passes.</p>
      </div>

      <div className="card">
        <VisitorForm onComplete={handleFormComplete} />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Pass Generated Successfully"
      >
        <PassPreview visitorData={generatedPass} onPrint={handlePrint} />
      </Modal>
    </div>
  );
};

export default GateEntry;