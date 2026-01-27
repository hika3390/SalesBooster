'use client';

import React from 'react';

export default function PerformanceLabels() {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between px-12">
      <div className="text-xs text-blue-600 bg-blue-50 border border-blue-400 px-3 py-1">
        TOP 20%
      </div>
      <div className="text-xs text-gray-600 bg-gray-100 border border-gray-400 px-3 py-1">
        CENTER
      </div>
      <div className="text-xs text-orange-600 bg-orange-50 border border-orange-400 px-3 py-1">
        LOW 20%
      </div>
    </div>
  );
}
