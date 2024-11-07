import React from 'react';

const TIME_SCALES = {
  '1h': { label: '1 Hour', fidelity: 60 },
  '6h': { label: '6 Hours', fidelity: 360 },
  '12h': { label: '12 Hours', fidelity: 720 },
  '1d': { label: '1 Day', fidelity: 1440 }
};

export default function TimeScaleSelector({ currentScale, onScaleChange, disabled }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-white border rounded-lg shadow-sm">
      {Object.entries(TIME_SCALES).map(([scale, { label }]) => (
        <button
          key={scale}
          onClick={() => onScaleChange(scale)}
          disabled={disabled}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors 
            ${currentScale === scale 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export { TIME_SCALES };