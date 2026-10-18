'use client';

import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { ExcelValidationResult } from '@/types';

export default function ExcelManagementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [validation, setValidation] = useState<ExcelValidationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownloadTemplate = () => {
    window.location.href = '/api/admin/excel/template';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidation(null);
      setStatusMessage(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setIsValidating(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/excel/validate', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setValidation(data.validation);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed parsing Excel file.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error validating file.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommitUpdates = async () => {
    if (!file) return;
    setIsCommitting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('actor', 'AdminUser');

    try {
      const res = await fetch('/api/admin/excel/commit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setValidation(null);
        setFile(null);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed applying updates.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error applying updates.' });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Excel Price & Stock Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Bulk update variations, selling prices, MRPs, and inventory quantities with automatic validation safety.
        </p>
      </div>

      {/* Step 1: Workflow Guide & Template Download */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
            1
          </div>
          <h3 className="font-bold text-sm text-gray-900">Download Catalogue Template</h3>
          <p className="text-xs text-gray-500">
            Export the current live product catalogue into a formatted .xlsx spreadsheet with all SKUs.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .XLSX Template</span>
          </button>
        </div>

        {/* Step 2 Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
            2
          </div>
          <h3 className="font-bold text-sm text-gray-900">Edit Prices & Stock</h3>
          <p className="text-xs text-gray-500">
            Modify selling prices, MRPs, stock quantities, or active statuses directly in Microsoft Excel or Google Sheets.
          </p>
          <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-100 space-y-1">
            <div>✓ Keep existing Variant SKUs unchanged</div>
            <div>✓ Ensure Selling Price ≤ MRP</div>
          </div>
        </div>

        {/* Step 3 Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
            3
          </div>
          <h3 className="font-bold text-sm text-gray-900">Upload & Safe Commit</h3>
          <p className="text-xs text-gray-500">
            Automated validation checks duplicate SKUs, invalid prices, and flags large price fluctuations before applying.
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Downtime Atomic Updates</span>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>Upload Modified Excel File</span>
        </h2>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="w-full sm:flex-1 text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />

          <button
            onClick={handleValidate}
            disabled={!file || isValidating}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isValidating ? 'Validating Excel...' : 'Validate File'}</span>
          </button>
        </div>
      </div>

      {/* Validation Results & Preview Diff Section */}
      {validation && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6 animate-in fade-in">
          
          {/* Header Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  validation.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {validation.isValid ? '✓ Validation Passed' : '✕ Critical Errors Detected'}
                </span>
                <span className="text-xs text-gray-500">
                  {validation.totalRows} total rows parsed ({validation.validRows} valid, {validation.invalidRows} invalid)
                </span>
              </div>
            </div>

            {/* Commit CTA (Disabled if critical errors exist) */}
            <div>
              <button
                onClick={handleCommitUpdates}
                disabled={!validation.isValid || isCommitting}
                className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md transition-all ${
                  validation.isValid && !isCommitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isCommitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isCommitting ? 'Applying Updates...' : 'Confirm & Apply Updates'}</span>
              </button>
            </div>
          </div>

          {/* Errors List */}
          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-red-900 flex items-center space-x-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Critical Errors ({validation.errors.length}) — Must be resolved before updating catalogue:</span>
              </h4>
              <ul className="text-xs text-red-800 space-y-1 pl-6 list-disc">
                {validation.errors.map((err, i) => (
                  <li key={i}>
                    <strong>Row {err.row} ({err.sku}):</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings List (e.g. >30% price change) */}
          {validation.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Price Fluctuation Warnings ({validation.warnings.length}):</span>
              </h4>
              <ul className="text-xs text-amber-800 space-y-1 pl-6 list-disc">
                {validation.warnings.map((warn, i) => (
                  <li key={i}>
                    <strong>Row {warn.row} ({warn.sku}):</strong> {warn.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Changes Diff Table */}
          {validation.previewDiffs.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">
                Preview Price & Stock Differences
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Variant SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Price (Old → New)</th>
                      <th className="py-2.5 px-3">Change %</th>
                      <th className="py-2.5 px-3">Stock (Old → New)</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {validation.previewDiffs.map(diff => (
                      <tr key={diff.variantSku} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{diff.variantSku}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{diff.productName}</td>
                        <td className="py-2.5 px-3 text-gray-500">{diff.variantLabel}</td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className="text-gray-400 line-through mr-1">₹{diff.oldPrice}</span>
                          <span className="text-emerald-700">₹{diff.newPrice}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={diff.priceDiffPct > 0 ? 'text-amber-600' : diff.priceDiffPct < 0 ? 'text-blue-600' : 'text-gray-400'}>
                            {diff.priceDiffPct > 0 ? `+${diff.priceDiffPct}%` : `${diff.priceDiffPct}%`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className="text-gray-400 mr-1">{diff.oldStock}</span>
                          <span className="text-gray-900">→ {diff.newStock}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          {diff.hasPriceWarning ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Large Jump
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
