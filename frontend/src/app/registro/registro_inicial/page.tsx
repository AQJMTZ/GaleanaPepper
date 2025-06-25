'use client';

import { useState } from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";

// Función para obtener el siguiente folio consecutivo
function getNextFolio(): string {
  // Trae el último folio de localStorage, si no hay inicia en 1
  const lastFolio = parseInt(localStorage.getItem("folio-producto") || "0", 10);
  const nextFolio = lastFolio + 1;
  // Guarda el nuevo folio en localStorage
  localStorage.setItem("folio-producto", nextFolio.toString());
  // Formatea el folio a 4 dígitos, ejemplo: 0001, 0002, etc.
  return nextFolio.toString().padStart(4, "0");
}

export default function RegistroCamionPage() {
  const [form, setForm] = useState({
    peso: '',
    placas: '',
    horaIngreso: '',
    fechaIngreso: '',
    numEconomico: ''
  });
  const [folio, setFolio] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const folioGenerado = getNextFolio();
    setFolio(folioGenerado);

    // Guardar localmente el registro con folio
    const folio = JSON.parse(localStorage.getItem("folio-producto") || "[]");
    folio.push({ ...form, folio: folioGenerado });
    localStorage.setItem("folio-producto", JSON.stringify(folio));
  };

  const handleCloseModal = () => {
    setFolio(null);
    setForm({
      peso: '',
      placas: '',
      horaIngreso: '',
      fechaIngreso: '',
      numEconomico: ''
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
      <form
        onSubmit={handleSubmit}
        className={`bg-black shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6 ${folio ? "pointer-events-none opacity-30" : ""}`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Registro Inicial</h1>

        <Input
          placeholder="Peso (kg)"
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
          placeholder="Placas del camión"
          id="placas"
          name="placas"
          type="text"
          required
          value={form.placas}
          onChange={handleChange}
        />

        <Input
          placeholder="Fecha de ingreso"
          id="fechaIngreso"
          name="fechaIngreso"
          type="date"
          required
          value={form.fechaIngreso}
          onChange={handleChange}
        />

        <Input
          placeholder="Hora de ingreso"
          id="horaIngreso"
          name="horaIngreso"
          type="time"
          required
          value={form.horaIngreso}
          onChange={handleChange}
        />

        <Input
          placeholder="Número económico proveedor"
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

      {/* Modal Pop-Up */}
      {folio && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative">
            <h2 className="text-lg font-bold mb-2 text-green-700">¡Registro exitoso!</h2>
            <p className="mb-4">
              <span className="font-semibold">Folio de registro:</span><br />
              <span className="text-lg text-green-800">{folio}</span>
            </p>
            <button
              onClick={handleCloseModal}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-bold shadow transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
