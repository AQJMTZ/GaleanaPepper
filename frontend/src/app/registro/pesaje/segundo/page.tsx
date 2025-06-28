'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/Badge';

type Producto = {
  folio: number;
  numero_economico_proveedor: string;
  fecha_ingreso: string;
  hora_ingreso: string;
};

export default function RegistroPesajePage() {
  const [folio, setFolio] = useState('');
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');
  const [pesoNetoKg, setPesoNetoKg] = useState<number | null>(null);
  const [pesoNetoLb, setPesoNetoLb] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [espera, setEspera] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Conversión automática
  useEffect(() => {
    if (document.activeElement?.id === 'kg' && kg) {
      const lbValue = (parseFloat(kg) * 2.20462).toFixed(2);
      setLb(lbValue);
    }
  }, [kg]);

  useEffect(() => {
    if (document.activeElement?.id === 'lb' && lb) {
      const kgValue = (parseFloat(lb) / 2.20462).toFixed(2);
      setKg(kgValue);
    }
  }, [lb]);

  // Cargar lista de espera
  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from('Producto')
      .select('folio, numero_economico_proveedor, fecha_ingreso, hora_ingreso')
      .eq('estado', 'segundo pesaje');

    if (!error && data) {
      setEspera(data as Producto[]);
    }
  };

  useEffect(() => {
    cargarProductos();
    intervalRef.current = setInterval(cargarProductos, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function tiempoTranscurrido(fecha: string, hora: string) {
    const entrada = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - entrada.getTime()) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);
  setLoading(true);
  setPesoNetoKg(null);
  setPesoNetoLb(null);

  const { data: original, error: fetchError } = await supabase
    .from('Producto')
    .select('hora_ingreso, fecha_ingreso, peso_bruto_kg, peso_bruto_lb')
    .eq('folio', folio)
    .eq('estado', 'segundo pesaje')
    .single();

  if (fetchError || !original) {
    setError('Folio no válido o no está en estado segundo pesaje.');
    setLoading(false);
    return;
  }

  const entrada = new Date(`${original.fecha_ingreso}T${original.hora_ingreso}`);
  const ahora = new Date();
  const segundos = Math.floor((ahora.getTime() - entrada.getTime()) / 1000);
  const h = Math.floor(segundos / 3600).toString().padStart(2, '0');
  const m = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0');
  const s = (segundos % 60).toString().padStart(2, '0');
  const tiempo_espera = `${h}:${m}:${s}`;

  const pesoFinalKg = parseFloat(kg);
  const pesoFinalLb = parseFloat(lb);
  const pesoNetoKgCalc = (original.peso_bruto_kg ?? 0) - pesoFinalKg;
  const pesoNetoLbCalc = (original.peso_bruto_lb ?? 0) - pesoFinalLb;

  const { error: updateError } = await supabase
    .from('Producto')
    .update({
      peso_neto_kg: pesoNetoKgCalc,
      peso_neto_lb: pesoNetoLbCalc,
      tiempo_antes_pesaje: tiempo_espera,
      estado: 'descargar',
    })
    .eq('folio', folio);

  if (updateError) {
    setError('Error al actualizar el producto: ' + updateError.message);
  } else {
    setSuccess(true);
    setPesoNetoKg(pesoNetoKgCalc);
    setPesoNetoLb(pesoNetoLbCalc);
    cargarProductos();
    setTimeout(() => {
      setFolio('');
      setKg('');
      setLb('');
      setSuccess(false);
      setPesoNetoKg(null);
      setPesoNetoLb(null);
    }, 3000);
  }

  setLoading(false);
};

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black text-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Segundo Pesaje</h1>

        <Input
          placeholder="Folio"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          required
        />
        <Input
          id="kg"
          placeholder="Peso bruto (kg)"
          type="number"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          required
        />
        <Input
          id="lb"
          placeholder="Peso bruto (lb)"
          type="number"
          value={lb}
          onChange={(e) => setLb(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          Registrar
        </Button>

        {success && pesoNetoKg !== null && pesoNetoLb !== null && (
          <div className="text-center text-green-500 font-semibold">
            Peso neto registrado:<br />
            {pesoNetoKg.toFixed(2)} kg / {pesoNetoLb.toFixed(2)} lb
          </div>
        )}
        {error && (
          <p className="text-red-500 font-semibold text-center">{error}</p>
        )}
      </form>

      <div className="mt-10 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-center mb-4">Lista de Espera</h2>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Folio</th>
                <th className="p-2">Proveedor</th>
                <th className="p-2">Tiempo en espera</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {espera.map((p) => (
                <tr key={p.folio} className="border-t">
                  <td className="p-2">
                    <Badge color="blue">{p.folio}</Badge>
                  </td>
                  <td className="p-2">{p.numero_economico_proveedor}</td>
                  <td className="p-2 font-mono">
                    {tiempoTranscurrido(p.fecha_ingreso, p.hora_ingreso)}
                  </td>
                  <td className="p-2">
                    <Button
                      type="button"
                      onClick={() => setFolio(p.folio.toString())}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                    >
                      Aceptar
                    </Button>
                  </td>
                </tr>
              ))}
              {espera.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-400">
                    No hay productos en espera.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
