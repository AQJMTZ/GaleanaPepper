'use client';

import { useEffect, useState } from "react";
import { Table } from "@/components/Table";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProductoProcesado = {
  folio: string;
  tipo_producto?: string;
  numero_economico_proveedor: string;
  numero_economico_camion?: string;
  fecha_ingreso?: string;
  hora_ingreso?: string;
  porcentaje_de_sal: number;
  peso_neto_kg?: number;
  peso_neto_lb?: number;
  peso_bruto_kg?: number;
  peso_bruto_lb?: number;
  tiempo_en_fila?: string;
  tiempo_antes_pesaje?: string;
  tiempo_espera_procesar?: string;
  proveedor?: {
    Nombre: string;
    Segundo_Nombre?: string;
    Apellido: string;
    Apellido_Materno?: string;
  }
};

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

function descargarComoExcel(datos: ProductoProcesado[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    datos.map((p) => ({
      Folio: p.folio,
      TipoProducto: p.tipo_producto ?? '',
      Proveedor: p.numero_economico_proveedor,
      Camion: p.numero_economico_camion ?? '',
      NombreProveedor: p.proveedor?.Nombre ?? '',
      SegundoNombre: p.proveedor?.Segundo_Nombre ?? '',
      Apellido: p.proveedor?.Apellido ?? '',
      ApellidoMaterno: p.proveedor?.Apellido_Materno ?? '',
      FechaIngreso: p.fecha_ingreso ?? '',
      HoraIngreso: p.hora_ingreso ?? '',
      PorcentajeSal: p.porcentaje_de_sal,
      PesoKg: p.peso_neto_kg ?? '',
      PesoLb: p.peso_neto_lb ?? '',
      PesoBrutoKg: p.peso_bruto_kg ?? '',
      PesoBrutoLb: p.peso_bruto_lb ?? '',
      TiempoFila: p.tiempo_en_fila ?? '',
      TiempoAntesPesaje: p.tiempo_antes_pesaje ?? '',
      TiempoEsperaProcesar: p.tiempo_espera_procesar ?? '',
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Procesados");
  XLSX.writeFile(workbook, "inventario_procesado.xlsx");
}

export default function InventarioProcesadoPage() {
  const [procesados, setProcesados] = useState<ProductoProcesado[]>([]);

  useEffect(() => {
    const fetchProcesados = async () => {
      const { data, error } = await supabase
        .from('Producto')
        .select(`*, proveedor:Proveedor(numero_economico, Nombre, Segundo_Nombre, Apellido, Apellido_Materno)`)
        .eq('estado', 'procesado');

      if (error) {
        console.error("Error al cargar procesados:", error);
      } else {
        setProcesados(data as ProductoProcesado[]);
      }
    };

    fetchProcesados();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-7xl bg-black shadow-2xl rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center text-white">Inventario Procesado</h1>
          <div className="flex gap-4">
            <Button onClick={() => descargarComoExcel(procesados)} disabled={procesados.length === 0}>
              Descargar Excel
            </Button>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Proveedor</th>
              <th>Nombre</th>
              <th>Fecha Ingreso</th>
              <th>Inicio Proceso</th>
              <th>Duración</th>
              <th>% Sal</th>
              <th>Peso (kg)</th>
              <th>Peso (lb)</th>
            </tr>
          </thead>
          <tbody>
            {procesados.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6">
                  No hay inventario procesado aún.
                </td>
              </tr>
            )}
            {procesados.map((p, idx) => (
              <tr key={idx} className="text-center">
                <td><Badge color="blue">{p.folio}</Badge></td>
                <td>{p.numero_economico_proveedor}</td>
                <td>{[p.proveedor?.Nombre, p.proveedor?.Segundo_Nombre, p.proveedor?.Apellido, p.proveedor?.Apellido_Materno].filter(Boolean).join(" ")}</td>
                <td>{p.fecha_ingreso ? new Date(p.fecha_ingreso).toLocaleDateString() : "--"}</td>
                <td>{p.hora_ingreso ?? "--"}</td>
                <td>{p.porcentaje_de_sal}%</td>
                <td>{p.peso_neto_kg ?? "--"}</td>
                <td>{p.peso_neto_lb ?? "--"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
