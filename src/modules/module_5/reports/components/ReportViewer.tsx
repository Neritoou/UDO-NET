"use client";

import React, { useState } from "react";
import type { Report } from '@/lib/types/report'

interface Props {
  report: Report;
  onClose: () => void;
  onAction: (action: "approve" | "reject", targetId: string, targetType: string) => Promise<void>;
}

export function ReportViewer({ report, onClose, onAction }: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async (action: "approve" | "reject") => {
    try {
      setLoading(true);
      await onAction(action, report.target_id, report.target_type);
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-candal text-2xl text-[#1E3B70]">Reporte</h3>
            <p className="text-sm text-gray-500">ID: {report.id} • {new Date(report.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">Cerrar</button>
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <div>
            <span className="block text-xs font-semibold text-gray-600">Motivo</span>
            <p className="text-sm text-black font-bold">{report.reason}</p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-600">Descripción</span>
            <p className="text-sm text-gray-700">{report.description || "(Sin descripción)"}</p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-600">Tipo / objetivo</span>
            <p className="text-sm text-gray-700">{report.target_type} — {report.target_id}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => handle("approve")}
            disabled={loading}
            className="rounded-full bg-[#4181E0] px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Aceptar y ocultar contenido"}
          </button>

          <button
            onClick={() => handle("reject")}
            disabled={loading}
            className="rounded-full border border-[#4181E0] px-4 py-2 text-[#4181E0] hover:bg-[#F3F9FF] disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Rechazar reporte"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportViewer;