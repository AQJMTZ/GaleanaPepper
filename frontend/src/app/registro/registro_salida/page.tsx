"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

const tiposCamion = ["Trailer", "Líquidos", "Dompé", ""];

export default function RegistroSalidaPage() {
  const [folio, setFolio] = useState("");
  const [folioValido, setFolioValido] = useState<boolean | null>(null);
  const [horaSalida, setHoraSalida] = useState("");
  const [tipoCamion, setTipoCamion] = useState("");
  const [selloSuperior, setSelloSuperior] = useState("");
  const [selloInferior, setSelloInferior] = useState("");
  const [selloExtra, setSelloExtra] = useState("");

  const validarFolio = (f: string) => {
    try {
      const registros = JSON.parse(localStorage.getItem("folio_producto") || "[]");
      return registros.some((r: any) => r.folio === f);
    } catch {
      return false;
    }
  };

  const handleValidarFolio = () => {
    setFolioValido(validarFolio(folio));
  };

  const handleGuardar = () => {
    const registros = JSON.parse(localStorage.getItem("folio_producto") || "[]");
    const actualizados = registros.map((r: any) => {
      if (r.folio === folio) {
        return {
          ...r,
          horaSalida,
          tipoCamion,
          selloSuperior,
          selloInferior,
          selloExtra,
          estado: "embarque",
        };
      }
      return r;
    });
    localStorage.setItem("folio_producto", JSON.stringify(actualizados));
    alert("Registro de salida guardado");

    setFolio("");
    setFolioValido(null);
    setHoraSalida("");
    setTipoCamion("");
    setSelloSuperior("");
    setSelloInferior("");
    setSelloExtra("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (folioValido && horaSalida && tipoCamion) handleGuardar();
        }}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-lg w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Registro de Salida</h1>

        <div>
          <Input
            placeholder="Folio"
            value={folio}
            onChange={(e) => {
              setFolio(e.target.value);
              setFolioValido(null);
            }}
          />
          <Button
            type="button"
            className="mt-2 w-full"
            onClick={handleValidarFolio}
            disabled={!folio}
          >
            Validar folio
          </Button>
          {folioValido === true && <span className="text-green-600">✔ Folio válido</span>}
          {folioValido === false && <span className="text-red-600">✖ Folio no encontrado</span>}
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Hora de salida</label>
          <Input
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Tipo de camión</label>
          <select
            aria-placeholder="Seleccione tio"
            value={tipoCamion}
            onChange={(e) => setTipoCamion(e.target.value)}
            className="w-full p-2 rounded-md"
            required
          >
            <option value="">Seleccione tipo</option>
            {tiposCamion.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Sello Superior"
            value={selloSuperior}
            onChange={(e) => setSelloSuperior(e.target.value)}
          />
          <Input
            placeholder="Sello Inferior"
            value={selloInferior}
            onChange={(e) => setSelloInferior(e.target.value)}
          />
          <Input
            placeholder="Sello Extra"
            value={selloExtra}
            onChange={(e) => setSelloExtra(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!folioValido || !horaSalida || !tipoCamion}
        >
          Guardar salida
        </Button>
      </form>
    </main>
  );
}
