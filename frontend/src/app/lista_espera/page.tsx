'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Button} from "@/components/Button";
import {Badge} from "@/components/Badge";

const getRegistrosPendientes = () => {
  try {
    const arr = JSON.parse(localStorage.getItem("folio-producto") || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

// Función para calcular tiempo transcurrido desde la hora y fecha de ingreso
function tiempoTranscurrido(fecha: string, hora: string) {
  if (!fecha || !hora) return "--:--:--";
  const fechaIngreso = new Date(`${fecha}T${hora}`);
  const ahora = new Date();
  const diff = Math.floor((ahora.getTime() - fechaIngreso.getTime()) / 1000); // segundos
  const horas = Math.floor(diff / 3600);
  const minutos = Math.floor((diff % 3600) / 60);
  const segundos = diff % 60;
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}

export default function ListaEsperaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [_, setTick] = useState(0); // para refrescar el tiempo cada segundo
  const router = useRouter();

  useEffect(() => {
    setRegistros(getRegistrosPendientes());
    // Refresca el tiempo en pantalla cada segundo
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

 const handleProcesar = (folio: string) => {
  // Elimina el registro de la lista de espera
  const registros = JSON.parse(localStorage.getItem("folio-producto") || "[]");
  const nuevosRegistros = registros.filter((r: any) => r.folio !== folio);
  localStorage.setItem("folio-producto", JSON.stringify(nuevosRegistros));

  // Redirigir a /procesar_producto/[folio]
  router.push(`/procesar_producto`);
};

//Refresca la lista de registros pendientes cada segundo y al cargar la pagina
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
    </main>
  );
}
