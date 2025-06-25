'use client';

import { useState, useRef} from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";
import React from "react";

export default function ProcesoCamionPage() {
  const [folio, setFolio] = useState('');
  const [folioValido, setFolioValido] = useState<boolean | null>(null);

  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [cronometro, setCronometro] = useState<number>(0); // en segundos
  const cronometroRef = useRef<NodeJS.Timeout | null>(null);

  const [porcentajeSal, setPorcentajeSal] = useState<number>(0);

  // Validar que el folio exista
  const validarFolio = (f: string) => {
  let registros;
  try {
    registros = JSON.parse(localStorage.getItem("folio-producto") || "[]");
    // Si no es arreglo, lo forzamos a arreglo vacío
    if (!Array.isArray(registros)) registros = [];
  } catch {
    registros = [];
  }
  return registros.some((r: any) => r.folio === f);
};


  const handleFolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolio(e.target.value);
    setFolioValido(null);
  };

  const handleValidarFolio = () => {
    setFolioValido(validarFolio(folio));
  };

  // Iniciar el proceso
  const handleIniciarProceso = () => {
    const now = new Date();
    setHoraInicio(now.toISOString());
    setCronometro(0);

    if (cronometroRef.current) clearInterval(cronometroRef.current);
    cronometroRef.current = setInterval(() => {
      setCronometro(c => c + 1);
    }, 1000);
  };

  // Detener el cronómetro al salir del componente
  React.useEffect(() => {
    return () => {
      if (cronometroRef.current) clearInterval(cronometroRef.current);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folioValido) return;

    const procesos = JSON.parse(localStorage.getItem("folio-producto") || "[]");
    procesos.push({
      folio,
      horaInicio,
      duracionSegundos: cronometro,
      porcentajeSal
    });
    localStorage.setItem("folio-procuto", JSON.stringify(procesos));

    alert("¡Proceso guardado!");
    setFolio('');
    setFolioValido(null);
    setHoraInicio(null);
    setCronometro(0);
    setPorcentajeSal(0);
    if (cronometroRef.current) clearInterval(cronometroRef.current);
  };

  // Formatear el cronómetro
  const formatTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Registro de Proceso</h1>
        {/* Folio */}
        <div>
          <Input
            placeholder="Folio"
            id="folio"
            name="folio"
            type="text"
            required
            value={folio}
            onChange={handleFolioChange}
            disabled={folioValido === true}
          />
          <Button
            type="button"
            className="mt-2 w-full"
            onClick={handleValidarFolio}
            disabled={!folio || folioValido === true}
          >
            Validar folio
          </Button>
          {folioValido === true && (
            <span className="text-green-700 text-sm font-medium block mt-1">✔ Folio válido</span>
          )}
          {folioValido === false && (
            <span className="text-red-600 text-sm font-medium block mt-1">✖ Folio no encontrado</span>
          )}
        </div>
         {/* Porcentaje de sal */}
        <div>
          <label htmlFor="porcentajeSal" className="block font-medium mb-1">
            Porcentaje de sal: <span className="text-white-950 font-bold">{porcentajeSal} %</span>
          </label>
          <input
            type="range"
            id="porcentajeSal"
            name="porcentajeSal"
            min={0}
            max={22}
            value={porcentajeSal}
            step={0.1}
            onChange={e => setPorcentajeSal(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Hora inicio y cronómetro */}
        <div>
          <label className="block font-medium mb-1">Hora de inicio del proceso</label>
          {horaInicio ? (
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-bold">
                {new Date(horaInicio).toLocaleTimeString()}
              </span>
              <span className="text-gray-600">Tiempo transcurrido: <span className="font-mono">{formatTiempo(cronometro)}</span></span>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleIniciarProceso}
              disabled={folioValido !== true}
            >
              Iniciar proceso
            </Button>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={folioValido !== true || !horaInicio}
        >
          Guardar proceso
        </Button>
      </form>
    </main>
  );
}
