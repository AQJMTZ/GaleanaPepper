'use client';

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    // Validar que el proveedor exista
    const { data: proveedor, error: proveedorError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .maybeSingle();

    if (!proveedor || proveedorError) {
      setError("El proveedor no está registrado.");
      return;
    }

    // Insertar el camión
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
    const fechaIngreso = now.toISOString().split("T")[0]; // yyyy-mm-dd
    const horaIngreso = now.toTimeString().slice(0, 5); // hh:mm

    const basura = parseFloat(porcentajeBasura);
    const verde = parseFloat(porcentajeChileVerde);
    const muerto = parseFloat(porcentajeChileMuerto);

    let estado = "ingreso";
    if (basura > 25 || verde > 35 || muerto > 15) {
      estado = "rechazado";
    }

    // Insertar el producto
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

    // Mostrar éxito y resetear formulario
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

    // Quitar mensaje después de 3 segundos
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black rounded-xl shadow-xl p-6 w-full max-w-md space-y-4"
      >
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
                <select
          name="tipoCamion"
          value={form.tipoCamion}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecciona tipo de camión</option>
          <option value="dompe">Dompe</option>
          <option value="trailer">Tráiler</option>
          <option value="tolva">Tolva</option>
        </select>

        <textarea
          name="comentario"
          value={form.comentario}
          onChange={handleChange}
          placeholder="Comentarios"
          className="w-full p-2 border border-black-300 rounded-md"
        />

        <Button type="submit" className="w-full">
          Registrar
        </Button>

        {success && (
          <p className="text-green-600 font-medium text-center">
            ¡Registro exitoso!
          </p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center">{error}</p>
        )}
      </form>
    </main>
  );
}
