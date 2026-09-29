import React from 'react';
import ExitCheckout from '../components/gate/ExitCheckout';
import '../pages/GateEntry.css'; // Reusing page container styles

const GateExit = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gate Departure</h1>
        <p>Log exiting visitors to ensure accurate on-site headcounts.</p>
      </div>

      <ExitCheckout />
    </div>
  );
};

export default GateExit;