'use client';

import React, { useState, useEffect } from 'react';
import { BangaloreDeliveryZone } from '@/types';
import { MapPin, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

export default function AdminZonesPage() {
  const [zones, setZones] = useState<BangaloreDeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/zones');
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleAddZone = () => {
    setZones(prev => [
      ...prev,
      {
        pincode: '5600',
        areaName: 'New Bangalore Area',
        isServiceable: true,
        deliveryFee: 35,
        freeDeliveryThreshold: 399,
        minOrderValue: 149,
        estimatedHours: 'Same Day (2-4 hrs)'
      }
    ]);
  };

  const handleRemoveZone = (idx: number) => {
    setZones(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveZones = async () => {
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones })
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('Delivery zones updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Bangalore Delivery Zones</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure serviceable Bangalore pincodes (560xxx), delivery charges, and free delivery thresholds.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddZone}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pincode</span>
          </button>
          <button
            onClick={handleSaveZones}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Zones</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Zones Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
            <tr>
              <th className="py-3 px-4">Pincode</th>
              <th className="py-3 px-4">Area Name</th>
              <th className="py-3 px-4">Delivery Fee (₹)</th>
              <th className="py-3 px-4">Free Delivery Above (₹)</th>
              <th className="py-3 px-4">Min Order (₹)</th>
              <th className="py-3 px-4">Estimated Time</th>
              <th className="py-3 px-4 text-center">Active</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zones.map((zone, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={zone.pincode}
                    onChange={e => {
                      const val = e.target.value;
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, pincode: val } : z));
                    }}
                    className="w-20 px-2 py-1 border border-gray-200 rounded font-mono font-bold"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={zone.areaName}
                    onChange={e => {
                      const val = e.target.value;
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, areaName: val } : z));
                    }}
                    className="w-48 px-2 py-1 border border-gray-200 rounded font-semibold"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    value={zone.deliveryFee}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, deliveryFee: val } : z));
                    }}
                    className="w-16 px-2 py-1 border border-gray-200 rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    value={zone.freeDeliveryThreshold}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, freeDeliveryThreshold: val } : z));
                    }}
                    className="w-20 px-2 py-1 border border-gray-200 rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    value={zone.minOrderValue}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, minOrderValue: val } : z));
                    }}
                    className="w-16 px-2 py-1 border border-gray-200 rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={zone.estimatedHours}
                    onChange={e => {
                      const val = e.target.value;
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, estimatedHours: val } : z));
                    }}
                    className="w-40 px-2 py-1 border border-gray-200 rounded"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={zone.isServiceable}
                    onChange={e => {
                      const val = e.target.checked;
                      setZones(prev => prev.map((z, i) => i === idx ? { ...z, isServiceable: val } : z));
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleRemoveZone(idx)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
