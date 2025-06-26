'use client';

import { useState } from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Recuperar y asegurar array en localStorage
    let proveedores: any[] = [];
    try {
      const local = JSON.parse(localStorage.getItem("proveedores") || "[]");
      proveedores = Array.isArray(local) ? local : [];
    } catch {
      proveedores = [];
    }

    // Puedes agregar validaciones aquí
    if (
      !form.nombre.trim() ||
      !form.segundoNombre.trim() ||
      !form.apellido.trim() ||
      !form.numEconomico.trim()
    ) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }

    // Verifica que no se repita el número económico
    if (proveedores.some((p) => p.numEconomico === form.numEconomico)) {
      setMensaje("Ese número económico ya existe.");
      return;
    }

    proveedores.push({ ...form });
    localStorage.setItem("proveedores", JSON.stringify(proveedores));
    setMensaje("¡Proveedor agregado correctamente!");
    setForm({ nombre: "", segundoNombre: "", apellido: "", segundoApellido: "", numEconomico: "" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Proveedor</h1>

        <Input
          placeholder="Nombre"
          id="nombre"
          name="nombre"
          type="text"
          required
          value={form.nombre}
          onChange={handleChange}
        />

         <Input
          placeholder="Segundo nombre"
          id="segundoNombre"
          name="segundoNombre"
          type="text"
          required
          value={form.segundoNombre}
          onChange={handleChange}
        />

        <Input
          placeholder="Apellido"
          id="apellido"
          name="apellido"
          type="text"
          required
          value={form.apellido}
          onChange={handleChange}
        />
         <Input
          placeholder="Segundo Apellido"
          id="segundoApellido"
          name="segundoApellido"
          type="text"
          required
          value={form.segundoApellido}
          onChange={handleChange}
        />

        <Input
          placeholder="Número económico"
          id="numEconomico"
          name="numEconomico"
          type="text"
          required
          value={form.numEconomico}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full mt-4">
          Agregar Proveedor
        </Button>

        {mensaje && (
          <div
            className={`mt-4 p-2 rounded-lg text-center ${
              mensaje.startsWith("¡") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}
      </form>
    </main>
  );
}
