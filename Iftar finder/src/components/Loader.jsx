import React from 'react';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center gap-3 p-6 bg-white rounded-lg shadow-md">
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-t-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        {/* Text */}
        <p className="text-lg text-gray-700 font-medium">Fetching Iftar Details...</p>
      </div>
    </div>
  );
}

export default Loader;