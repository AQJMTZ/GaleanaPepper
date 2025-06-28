'use client';

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

export default function AgregarProveedorPage() {
  const [form, setForm] = useState({
    nombre: "",
    segundoNombre: "",
    apellido: "",
    segundoApellido: "",
    numEconomico: "",
  });
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const { nombre, segundoNombre, apellido, segundoApellido, numEconomico } = form;

    if (!nombre || !segundoNombre || !apellido || !numEconomico) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }

    // Verificar si el proveedor ya existe
    const { data: existente, error: buscarError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .single();

    if (buscarError && buscarError.code !== "PGRST116") {
      setMensaje("Error al verificar proveedor existente." + buscarError.message);
      return;
    }

    if (existente) {
      setMensaje("Ese número económico ya existe.");
      return;
    }

    // Insertar nuevo proveedor
    const { error } = await supabase.from("Proveedor").insert([
      {
        Nombre: nombre,
        Segundo_Nombre: segundoNombre,
        Apellido : apellido,
        Apellido_Materno: segundoApellido,
        numero_economico: numEconomico,
      },
    ]);

    if (error) {
      setMensaje("Error al guardar el proveedor." + error.message);
      console.error(error);
    } else {
      setMensaje("¡Proveedor agregado correctamente!");
      setForm({ nombre: "", segundoNombre: "", apellido: "", segundoApellido: "", numEconomico: "" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Agregar Proveedor</h1>

        <Input placeholder="Nombre" name="nombre" type="text" required value={form.nombre} onChange={handleChange} />
        <Input placeholder="Segundo nombre" name="segundoNombre" type="text" required value={form.segundoNombre} onChange={handleChange} />
        <Input placeholder="Apellido" name="apellido" type="text" required value={form.apellido} onChange={handleChange} />
        <Input placeholder="Segundo Apellido" name="segundoApellido" type="text" required value={form.segundoApellido} onChange={handleChange} />
        <Input placeholder="Número económico" name="numEconomico" type="text" required value={form.numEconomico} onChange={handleChange} />

        <Button type="submit" className="w-full mt-4">Agregar Proveedor</Button>

        {mensaje && (
          <div className={`mt-4 p-2 rounded-lg text-center ${mensaje.startsWith("¡") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {mensaje}
          </div>
        )}
      </form>
    </main>
  );
}
