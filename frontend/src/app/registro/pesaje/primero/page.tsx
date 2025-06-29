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
  estado: string;
};

export default function RegistroPesajePage() {
  const [folio, setFolio] = useState('');
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [espera, setEspera] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [inicioPesaje, setInicioPesaje] = useState<Date | null>(null);
  const [finPesaje, setFinPesaje] = useState<Date | null>(null);
  const [etapa, setEtapa] = useState<'seleccion' | 'pesaje' | 'finalizado'>('seleccion');
  const [productoPesando, setProductoPesando] = useState<Producto | null>(null);

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
    // Cargar solo productos en estado "espera_pesaje" (listos para pesar)
    const { data, error } = await supabase
      .from('Producto')
      .select('folio, numero_economico_proveedor, fecha_ingreso, hora_ingreso, estado')
      .eq('estado', 'espera_pesaje');

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
    
    const dias = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    
    if (dias > 0) {
      return `${dias}d ${h}h ${m}m`;
    } else {
      return `${h}h ${m}m`;
    }
  }

  const iniciarPesaje = () => {
    if (!productoPesando) return;
    setInicioPesaje(new Date());
    setEtapa('pesaje');
  };
  
  const finalizarPesaje = () => {
    setFinPesaje(new Date());
    return handleSubmit(null);
  };
  
  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!kg || !lb || !folio) {
      setError('Debes ingresar los valores de peso.');
      setLoading(false);
      return;
    }

    // Verificar si el folio existe y está en el estado correcto
    const { data, error: checkError } = await supabase
      .from('Producto')
      .select('estado, hora_ingreso, fecha_ingreso')
      .eq('folio', folio)
      .eq('estado', 'espera_pesaje')
      .single();

    if (checkError || !data) {
      setError('Folio no válido o no está en estado de espera para pesaje.');
      setLoading(false);
      return;
    }

    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().split(' ')[0].substring(0, 5);
    
    // Calcular tiempo de espera antes del pesaje
    const entrada = new Date(`${data.fecha_ingreso}T${data.hora_ingreso}`);
    const segundosEspera = Math.floor((inicioPesaje ? inicioPesaje.getTime() : ahora.getTime()) - entrada.getTime()) / 1000;
    const hEspera = Math.floor(segundosEspera / 3600).toString().padStart(2, '0');
    const mEspera = Math.floor((segundosEspera % 3600) / 60).toString().padStart(2, '0');
    const sEspera = Math.floor(segundosEspera % 60).toString().padStart(2, '0');
    const tiempo_espera = `${hEspera}:${mEspera}:${sEspera}`;
    
    // Calcular duración del pesaje
    let duracion_pesaje = '';
    if (inicioPesaje) {
      const segundosPesaje = Math.floor((finPesaje ? finPesaje.getTime() : ahora.getTime()) - inicioPesaje.getTime()) / 1000;
      const hPesaje = Math.floor(segundosPesaje / 3600).toString().padStart(2, '0');
      const mPesaje = Math.floor((segundosPesaje % 3600) / 60).toString().padStart(2, '0');
      const sPesaje = Math.floor(segundosPesaje % 60).toString().padStart(2, '0');
      duracion_pesaje = `${hPesaje}:${mPesaje}:${sPesaje}`;
    }

    // Guardar fechas de inicio y fin de pesaje
    const fechaInicioPesaje = inicioPesaje ? inicioPesaje.toISOString().split('T')[0] : fechaActual;
    const horaInicioPesaje = inicioPesaje ? inicioPesaje.toTimeString().split(' ')[0].substring(0, 5) : horaActual;
    const fechaFinPesaje = finPesaje ? finPesaje.toISOString().split('T')[0] : fechaActual;
    const horaFinPesaje = finPesaje ? finPesaje.toTimeString().split(' ')[0].substring(0, 5) : horaActual;

    // Actualizar el producto con los datos del pesaje
    const { error: updateError } = await supabase
      .from('Producto')
      .update({
        peso_bruto_kg: parseFloat(kg),
        peso_bruto_lb: parseFloat(lb),
        tiempo_antes_pesaje: tiempo_espera,
        tiempo_en_fila: segundosEspera, // Guardamos el tiempo de espera en segundos
        estado: 'segundo pesaje', // Siguiente estado en el flujo es el segundo pesaje
      })
      .eq('folio', folio);

    if (updateError) {
      setError('Error al actualizar el producto: ' + updateError.message);
    } else {
      setSuccess(true);
      setFolio('');
      setKg('');
      setLb('');
      setInicioPesaje(null);
      setFinPesaje(null);
      setEtapa('seleccion');
      setProductoPesando(null);
      cargarProductos();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="bg-black text-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Registro de Pesaje</h1>

        {etapa === 'seleccion' ? (
          <p className="text-center text-gray-300">
            Selecciona un folio de la lista para iniciar el pesaje
          </p>
        ) : (
          <>
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span>Folio:</span>
                <strong>{folio}</strong>
              </div>
              {productoPesando && (
                <div className="flex justify-between items-center">
                  <span>Proveedor:</span>
                  <strong>{productoPesando.numero_economico_proveedor}</strong>
                </div>
              )}
              {inicioPesaje && (
                <div className="flex justify-between items-center mt-2 text-green-400">
                  <span>Inicio de pesaje:</span>
                  <strong>{inicioPesaje.toLocaleTimeString()}</strong>
                </div>
              )}
            </div>
            
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

            <Button 
              type="button" 
              onClick={finalizarPesaje} 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading || !kg || !lb}
            >
              Pasar a Vaciado
            </Button>
            
            <Button 
              type="button" 
              onClick={() => {
                setEtapa('seleccion');
                setFolio('');
                setKg('');
                setLb('');
                setInicioPesaje(null);
                setFinPesaje(null);
                setProductoPesando(null);
              }} 
              className="w-full bg-gray-600 hover:bg-gray-700 mt-2"
            >
              Cancelar
            </Button>
          </>
        )}

        {success && (
          <p className="text-green-500 font-semibold text-center">
            Registro exitoso.
          </p>
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
                      onClick={() => {
                        setFolio(p.folio.toString());
                        setProductoPesando(p);
                        setInicioPesaje(new Date());
                        setEtapa('pesaje');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                    >
                      Pesar Entrada
                    </Button>
                  </td>
                </tr>
              ))}
              {espera.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-400">
                    No hay productos en espera para pesaje.
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
