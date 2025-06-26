"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

const getRegistrosPendientes = () => {
  try {
    const arr = JSON.parse(localStorage.getItem("folio_producto") || "[]");
    return Array.isArray(arr) ? arr.filter((r: any) => r.estado !== "procesado") : [];
  } catch {
    return [];
  }
};

function tiempoTranscurrido(fecha: string, hora: string) {
  if (!fecha || !hora) return "--:--:--";
  const fechaIngreso = new Date(`${fecha}T${hora}`);
  const ahora = new Date();
  const diff = Math.floor((ahora.getTime() - fechaIngreso.getTime()) / 1000);
  const horas = Math.floor(diff / 3600);
  const minutos = Math.floor((diff % 3600) / 60);
  const segundos = diff % 60;
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}

export default function ListaEsperaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [_, setTick] = useState(0);
  const [folioToConfirm, setFolioToConfirm] = useState<string | null>(null);

  useEffect(() => {
    setRegistros(getRegistrosPendientes());
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refrescar = () => setRegistros(getRegistrosPendientes());
    setRegistros(getRegistrosPendientes());
    window.addEventListener("storage", refrescar);
    const interval = setInterval(refrescar, 1000);
    return () => {
      window.removeEventListener("storage", refrescar);
      clearInterval(interval);
    };
  }, []);

  const handleProcesar = (folio: string) => {
    setFolioToConfirm(folio);
  };

  const confirmarProcesar = () => {
    if (!folioToConfirm) return;
    const registros = JSON.parse(localStorage.getItem("folio_producto") || "[]");
    const actualizados = registros.map((r: any) =>
      r.folio === folioToConfirm ? { ...r, estado: "procesado" } : r
    );
    localStorage.setItem("folio_producto", JSON.stringify(actualizados));
    setFolioToConfirm(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-black shadow-2xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Lista de Espera</h1>
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-2">Folio</th>
              <th className="py-2">Proveedor</th>
              <th className="py-2">Tiempo en espera</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 && (
              <tr>
                <td colSpan={4} className="text-gray-500 py-6">
                  No hay registros en espera.
                </td>
              </tr>
            )}
            {registros.map((r, i) => (
              <tr key={i} className="border-t">
                <td>
                  <Badge color="blue">{r.folio}</Badge>
                </td>
                <td>{r.numEconomico}</td>
                <td>
                  <span className="font-mono">{tiempoTranscurrido(r.fechaIngreso, r.horaIngreso)}</span>
                </td>
                <td>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                    type="button"
                    onClick={() => handleProcesar(r.folio)}
                  >
                    Procesar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {folioToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-center mb-4">
              ¿Seguro que quieres procesar el folio <span className="text-blue-600">{folioToConfirm}</span>?
            </h2>
            <div className="flex justify-between mt-6">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setFolioToConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={confirmarProcesar}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}