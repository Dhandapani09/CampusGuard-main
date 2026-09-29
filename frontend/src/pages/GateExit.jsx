import React from 'react';
import ExitCheckout from '../components/gate/ExitCheckout';

const GateExit = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white light:text-gray-900 font-heading">
          Gate Departure
        </h1>
        <p className="text-gray-400 light:text-gray-500 text-sm mt-1">
          Log exiting visitors to ensure accurate on-site headcounts.
        </p>
      </div>

      <ExitCheckout />
    </div>
  );
};

export default GateExit;
