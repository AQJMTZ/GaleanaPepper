'use client';

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

function segundosAHHMMSS(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].join(":");
}

export default function ProcesoCamionPage() {
  const [folio, setFolio] = useState('');
  const [folioValido, setFolioValido] = useState(false);
  const [horaInicio, setHoraInicio] = useState(null);
  const [cronometro, setCronometro] = useState(0);
  const cronometroRef = useRef(null);
  const [porcentajeSal, setPorcentajeSal] = useState(0);
  const [mensaje, setMensaje] = useState(null);

  const validarFolio = async (f) => {
    const { data, error } = await supabase
      .from("Producto")
      .select("folio, estado")
      .eq("folio", f)
      .eq("estado", "procesar")
      .single();

    if (data && !error) {
      setFolioValido(true);
    } else {
      setFolioValido(false);
      setMensaje("Folio no encontrado o no está en estado 'procesar'.");
    }
  };

  const handleFolioChange = (e) => {
    setFolio(e.target.value);
    setFolioValido(false);
    setMensaje(null);
  };

  const handleIniciarProceso = () => {
    const now = new Date();
    setHoraInicio(now.toISOString());
    setCronometro(0);
    if (cronometroRef.current) clearInterval(cronometroRef.current);
    cronometroRef.current = setInterval(() => setCronometro(c => c + 1), 1000);
  };

  useEffect(() => {
    return () => {
      if (cronometroRef.current) clearInterval(cronometroRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folioValido) return;

    const duracion = segundosAHHMMSS(cronometro);

    const { error } = await supabase
      .from("Producto")
      .update({
        porcentaje_de_sal: porcentajeSal,
        tiempo_en_fila: duracion,
        estado: "procesado",
      })
      .eq("folio", folio);

    if (!error) {
      alert("¡Proceso guardado en la base de datos!");
      setFolio('');
      setFolioValido(false);
      setHoraInicio(null);
      setCronometro(0);
      setPorcentajeSal(0);
      setMensaje(null);
    } else {
      alert("Error al guardar: " + error.message);
    }
    if (cronometroRef.current) clearInterval(cronometroRef.current);
  };

  const formatTiempo = (segundos) => {
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

        <div>
          <Input
            placeholder="Folio"
            id="folio"
            name="folio"
            type="text"
            required
            value={folio}
            onChange={handleFolioChange}
            disabled={folioValido}
          />
          <Button
            type="button"
            className="mt-2 w-full"
            onClick={() => validarFolio(folio)}
            disabled={!folio || folioValido}
          >
            Validar folio
          </Button>
          {folioValido && <span className="text-green-700 text-sm font-medium block mt-1">✔ Folio válido</span>}
          {mensaje && <span className="text-red-600 text-sm font-medium block mt-1">{mensaje}</span>}
        </div>

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
              disabled={!folioValido}
            >
              Iniciar proceso
            </Button>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={!folioValido || !horaInicio}
        >
          Guardar proceso
        </Button>
      </form>
    </main>
  );
}
