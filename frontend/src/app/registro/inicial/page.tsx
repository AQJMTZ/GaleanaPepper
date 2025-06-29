'use client';

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/Select";

export default function RegistroInicialPage() {
  const [form, setForm] = useState({
    numEconomico: "",
    placas: "",
    comentario: "",
    tipoCamion: "",
    porcentajeBasura: "",
    porcentajeChileVerde: "",
    porcentajeChileMuerto: ""
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAceptar = async () => {
    setError(null);
    setSuccess(false);

    const {
      numEconomico,
      placas,
      comentario,
      tipoCamion,
      porcentajeBasura,
      porcentajeChileVerde,
      porcentajeChileMuerto
    } = form;

    const { data: proveedor, error: proveedorError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .maybeSingle();

    if (!proveedor || proveedorError) {
      setError("El proveedor no está registrado.");
      return;
    }

    const { data: camionData, error: camionError } = await supabase
      .from("Camion")
      .insert([
        {
          placas,
          tipo_de_vehiculo: tipoCamion,
          proveedor: numEconomico
        }
      ])
      .select("numero_economico")
      .single();

    if (camionError || !camionData) {
      setError("Error al guardar camión: " + camionError.message);
      return;
    }

    const now = new Date();
    const fechaIngreso = now.toISOString().split("T")[0];
    const horaIngreso = now.toTimeString().slice(0, 5);

    const basura = parseFloat(porcentajeBasura);
    const verde = parseFloat(porcentajeChileVerde);
    const muerto = parseFloat(porcentajeChileMuerto);

    const estado = "pesaje";

    const { error: productoError } = await supabase.from("Producto").insert([
      {
        numero_economico_proveedor: numEconomico,
        numero_economico_camion: camionData.numero_economico,
        fecha_ingreso: fechaIngreso,
        hora_ingreso: horaIngreso,
        estado,
        comentarios: comentario,
        porcentaje_basura: basura,
        porcentaje_chile_verde: verde,
        porcentaje_chile_muerto: muerto
      }
    ]);

    if (productoError) {
      setError("Error al guardar producto: " + productoError.message);
      return;
    }

    setSuccess(true);
    setForm({
      numEconomico: "",
      placas: "",
      comentario: "",
      tipoCamion: "",
      porcentajeBasura: "",
      porcentajeChileVerde: "",
      porcentajeChileMuerto: ""
    });
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRechazar = async () => {
    const {
      numEconomico,
      placas,
      comentario,
      tipoCamion,
      porcentajeBasura,
      porcentajeChileVerde,
      porcentajeChileMuerto
    } = form;

    const { data: proveedor, error: proveedorError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .maybeSingle();

    if (!proveedor || proveedorError) {
      setError("El proveedor no está registrado.");
      return;
    }

    const now = new Date();
    const fechaIngreso = now.toISOString().split("T")[0];
    const horaIngreso = now.toTimeString().slice(0, 5);

    const basura = parseFloat(porcentajeBasura);
    const verde = parseFloat(porcentajeChileVerde);
    const muerto = parseFloat(porcentajeChileMuerto);

    const estado = "rechazada";

    const { data: camionData, error: camionError } = await supabase
      .from("Camion")
      .insert([
        {
          placas,
          tipo_de_vehiculo: tipoCamion,
          proveedor: numEconomico
        }
      ])
      .select("numero_economico")
      .single();

    if (camionError || !camionData) {
      setError("Error al guardar camión: " + camionError.message);
      return;
    }

    const { error: productoError } = await supabase.from("Producto").insert([
      {
        numero_economico_proveedor: numEconomico,
        numero_economico_camion: camionData.numero_economico,
        fecha_ingreso: fechaIngreso,
        hora_ingreso: horaIngreso,
        estado,
        comentarios: comentario,
        porcentaje_basura: basura,
        porcentaje_chile_verde: verde,
        porcentaje_chile_muerto: muerto
      }
    ]);

    if (productoError) {
      setError("Error al guardar producto: " + productoError.message);
      return;
    }

    setSuccess(true);
    setForm({
      numEconomico: "",
      placas: "",
      comentario: "",
      tipoCamion: "",
      porcentajeBasura: "",
      porcentajeChileVerde: "",
      porcentajeChileMuerto: ""
    });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form className="bg-black rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center text-white">Registro Inicial</h1>

        <Input
          type="text"
          name="numEconomico"
          value={form.numEconomico}
          onChange={handleChange}
          placeholder="Número Económico del Proveedor"
          required
        />

        <Input
          type="text"
          name="placas"
          value={form.placas}
          onChange={handleChange}
          placeholder="Placas del camión"
          required
        />

        <Input
          type="number"
          name="porcentajeBasura"
          value={form.porcentajeBasura}
          onChange={handleChange}
          placeholder="Porcentaje de basura (%)"
          required
        />
        <Input
          type="number"
          name="porcentajeChileVerde"
          value={form.porcentajeChileVerde}
          onChange={handleChange}
          placeholder="Porcentaje de chile verde (%)"
          required
        />
        <Input
          type="number"
          name="porcentajeChileMuerto"
          value={form.porcentajeChileMuerto}
          onChange={handleChange}
          placeholder="Porcentaje de chile muerto (%)"
          required
        />

        <Select value={form.tipoCamion} onValueChange={(value) => setForm((prev) => ({ ...prev, tipoCamion: value }))}>
          <SelectTrigger className="w-full py-1.5 sm:w-44">
            <SelectValue placeholder="Tipo de camión" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="tolva">Tolva</SelectItem>
            <SelectItem value="dompe">Dompe</SelectItem>
            <SelectItem value="trailer">Tráiler</SelectItem>
          </SelectContent>
        </Select>

        <textarea
          name="comentario"
          value={form.comentario}
          onChange={handleChange}
          placeholder="Comentarios de producto y/o camion"
          className="w-full p-2 border border-black-300 rounded-md"
        />

        <div className="flex gap-4">
          <Button type="button" onClick={handleAceptar} className="w-full bg-green-600 hover:bg-green-700">
            Aceptar
          </Button>
          <Button type="button" onClick={handleRechazar} className="w-full bg-red-600 hover:bg-red-700">
            Rechazar
          </Button>
        </div>

        {success && (
          <p className="text-green-600 font-medium text-center">Registro exitoso</p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center">{error}</p>
        )}
      </form>
    </main>
  );
}
