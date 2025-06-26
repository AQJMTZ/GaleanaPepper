"use client";

import { useState } from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";
 

function getNextFolio(): string {
  const lastFolio = parseInt(localStorage.getItem("folio_producto") || "0", 10);
  const nextFolio = lastFolio + 1;
  localStorage.setItem("folio_producto", nextFolio.toString());
  return nextFolio.toString().padStart(4, "0");
}

export default function RegistroInicialPage() {
  const [form, setForm] = useState({
    pesoKg: '',
    pesoLb: '',
    placas: '',
    horaIngreso: '',
    fechaIngreso: '',
    numEconomico: '',
    tipoCamion: ''
  });
  const [folio, setFolio] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "pesoKg") {
      const kg = parseFloat(value);
      if (!isNaN(kg)) {
        updatedForm.pesoLb = (kg * 2.20462).toFixed(2);
      } else {
        updatedForm.pesoLb = '';
      }
    }

    if (name === "pesoLb") {
      const lb = parseFloat(value);
      if (!isNaN(lb)) {
        updatedForm.pesoKg = (lb / 2.20462).toFixed(2);
      } else {
        updatedForm.pesoKg = '';
      }
    }

    setForm(updatedForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const folioGenerado = getNextFolio();
    setFolio(folioGenerado);

    let folios: any[] = [];
    try {
      const local = JSON.parse(localStorage.getItem("folio_producto") || "[]");
      folios = Array.isArray(local) ? local : [];
    } catch {
      folios = [];
    }

    folios.push({ ...form, folio: folioGenerado });
    localStorage.setItem("folio_producto", JSON.stringify(folios));
  };

  const handleCloseModal = () => {
    setFolio(null);
    setForm({
      pesoKg: '',
      pesoLb: '',
      placas: '',
      horaIngreso: '',
      fechaIngreso: '',
      numEconomico: '',
      tipoCamion: ''
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
      <form
        onSubmit={handleSubmit}
        className={`bg-black shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6 ${folio ? "pointer-events-none opacity-30" : ""}`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Registro Inicial</h1>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Peso (kg)"
            id="pesoKg"
            name="pesoKg"
            type="number"
            step="0.01"
            min="0"
            value={form.pesoKg}
            onChange={handleChange}
          />

          <Input
            placeholder="Peso (lb)"
            id="pesoLb"
            name="pesoLb"
            type="number"
            step="0.01"
            min="0"
            value={form.pesoLb}
            onChange={handleChange}
          />
        </div>

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

        <select
          name="tipoCamion"
          value={form.tipoCamion}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 p-2 text-sm text-gray-900"
          required
        >
          <option value="">Selecciona tipo de camión</option>
          <option value="trailer">Tráiler</option>
          <option value="liquidos">Líquidos</option>
        </select>

        <Button type="submit" className="w-full mt-4">
          Registrar
        </Button>
      </form>

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