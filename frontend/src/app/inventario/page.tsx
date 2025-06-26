"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/Table";
import { Badge } from "@/components/Badge";

function segundosAHHMMSS(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].join(":");
}

const obtenerProcesados = () => {
  try {
    const arr = JSON.parse(localStorage.getItem("folio_producto") || "[]");
    return Array.isArray(arr) ? arr.filter((p) => p.estado === "procesado") : [];
  } catch {
    return [];
  }
};

function descargarComoXML(datos: any[]) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<InventarioProcesado>",
    ...datos.map((p) => `
      <Producto>
        <Folio>${p.folio}</Folio>
        <Proveedor>${p.numEconomico}</Proveedor>
        <FechaIngreso>${p.fechaIngreso || ""}</FechaIngreso>
        <InicioProceso>${p.horaInicio || ""}</InicioProceso>
        <Duracion>${
          p.duracionSegundos !== undefined
            ? segundosAHHMMSS(Number(p.duracionSegundos))
            : ""
        }</Duracion>
        <PorcentajeSal>${p.porcentajeSal}</PorcentajeSal>
      </Producto>
    `),
    "</InventarioProcesado>",
  ].join("\n");

  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "inventario_procesado.xml";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InventarioProcesadoPage() {
  const [procesados, setProcesados] = useState<any[]>([]);

  useEffect(() => {
    setProcesados(obtenerProcesados());
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-5xl bg-black shadow-2xl rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Inventario Procesado</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow"
            onClick={() => descargarComoXML(procesados)}
            disabled={procesados.length === 0}
          >
            Descargar XML
          </button>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Proveedor</th>
              <th>Fecha Ingreso</th>
              <th>Inicio Proceso</th>
              <th>Duración</th>
              <th>% Sal</th>
            </tr>
          </thead>
          <tbody>
            {procesados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  No hay inventario procesado aún.
                </td>
              </tr>
            )}
            {procesados.map((p, idx) => (
              <tr key={idx} className="text-center">
                <td>
                  <Badge color="blue">{p.folio}</Badge>
                </td>
                <td>{p.numEconomico}</td>
                <td>
                  {p.fechaIngreso
                    ? new Date(p.fechaIngreso).toLocaleDateString()
                    : "--"}
                </td>
                <td>
                  {p.horaInicio
                    ? new Date(p.horaInicio).toLocaleString()
                    : "--"}
                </td>
                <td>
                  {p.duracionSegundos !== undefined
                    ? segundosAHHMMSS(Number(p.duracionSegundos))
                    : "--"}
                </td>
                <td>{p.porcentajeSal}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
