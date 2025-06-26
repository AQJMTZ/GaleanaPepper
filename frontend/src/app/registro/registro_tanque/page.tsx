"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

const tanques = ["Tanque A", "Tanque B", "Tanque C", "Tanque D"];

type Estado = "verde" | "amarillo" | "rojo";

export default function AsignarTanquePage() {
  const [folio, setFolio] = useState("");
  const [folioValido, setFolioValido] = useState<boolean | null>(null);
  const [tanqueSeleccionado, setTanqueSeleccionado] = useState<string>("");
  const [estado, setEstado] = useState<Estado | null>(null);

  const validarFolio = (f: string) => {
    let registros;
    try {
      registros = JSON.parse(localStorage.getItem("folio_producto") || "[]");
      if (!Array.isArray(registros)) registros = [];
    } catch {
      registros = [];
    }
    return registros.some((r: any) => r.folio === f);
  };

  const handleValidarFolio = () => {
    setFolioValido(validarFolio(folio));
  };

  const handleGuardar = () => {
    const registros = JSON.parse(localStorage.getItem("folio_producto") || "[]");
    const actualizado = registros.map((r: any) => {
      if (r.folio === folio) {
        return {
          ...r,
          tanque: tanqueSeleccionado,
          estadoTanque: estado,
        };
      }
      return r;
    });
    localStorage.setItem("folio_producto", JSON.stringify(actualizado));
    alert("Asignación guardada");
    setFolio("");
    setFolioValido(null);
    setTanqueSeleccionado("");
    setEstado(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (folioValido && tanqueSeleccionado && estado) handleGuardar();
        }}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-lg w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Asignar Tanque</h1>
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
          <label className="block mb-2 font-medium text-white">Seleccionar tanque:</label>
          <div className="grid grid-cols-2 gap-4">
            {tanques.map((tanque) => (
              <Button
                key={tanque}
                type="button"
                className={`py-2 px-4 rounded-xl font-semibold text-white ${
                  tanqueSeleccionado === tanque ? "bg-blue-600" : "bg-gray-600"
                }`}
                onClick={() => setTanqueSeleccionado(tanque)}
              >
                {tanque}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium text-white">Estado del tanque:</label>
          <div className="flex gap-4 justify-center">
            <Button
              type="button"
              className={`w-8 h-8 rounded-full ${estado === "verde" ? "bg-green-600" : "bg-green-300"}`}
              onClick={() => setEstado("verde")}
              aria-label="Listo"
            />
            <Button
              type="button"
              className={`w-8 h-8 rounded-full ${estado === "amarillo" ? "bg-yellow-500" : "bg-yellow-300"}`}
              onClick={() => setEstado("amarillo")}
              aria-label="Inspección"
            />
            <Button
              type="button"
              className={`w-8 h-8 rounded-full ${estado === "rojo" ? "bg-red-600" : "bg-red-300"}`}
              onClick={() => setEstado("rojo")}
              aria-label="Retrabajo"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!folioValido || !tanqueSeleccionado || !estado}
        >
          Guardar Asignación
        </Button>
      </form>
    </main>
  );
}
