// File: /frontend/src/app/registro/page.tsx
'use client';

import { useState } from "react";
import {Input} from "@/components/Input"
import {Button} from "@/components/Button";

export default function RegistroCamionPage() {
  const [form, setForm] = useState({
    peso: '',
    placas: '',
    horaIngreso: '',
    fechaIngreso: '',
    numEconomico: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí va la lógica para enviar el formulario a backend o API
    alert(`Datos capturados:\n${JSON.stringify(form, null, 2)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Registro de Camión</h1>

        <Input
          label="Peso (kg)"
          id="peso"
          name="peso"
          type="number"
          step="0.01"
          min="0"
          required
          value={form.peso}
          onChange={handleChange}
        />

        <Input
          label="Placas del camión"
          id="placas"
          name="placas"
          type="text"
          required
          value={form.placas}
          onChange={handleChange}
        />

        <Input
          label="Fecha de ingreso"
          id="fechaIngreso"
          name="fechaIngreso"
          type="date"
          required
          value={form.fechaIngreso}
          onChange={handleChange}
        />

        <Input
          label="Hora de ingreso"
          id="horaIngreso"
          name="horaIngreso"
          type="time"
          required
          value={form.horaIngreso}
          onChange={handleChange}
        />

        <Input
          label="Número económico proveedor"
          id="numEconomico"
          name="numEconomico"
          type="text"
          required
          value={form.numEconomico}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full mt-4">
          Registrar
        </Button>
      </form>
    </main>
  );
}
