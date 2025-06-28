"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

const ESTADOS = ["verde", "amarillo", "rojo"];

export default function AsignarTanquePage() {
  const [folio, setFolio] = useState("");
  const [folioValido, setFolioValido] = useState<boolean | null>(null);
  const [tanques, setTanques] = useState<any[]>([]);
  const [tanqueSeleccionado, setTanqueSeleccionado] = useState<number | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [litros, setLitros] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar tanques al inicio y suscribirse a cambios
  useEffect(() => {
    const fetchTanques = async () => {
      const { data, error } = await supabase.from("Tanque").select("*");
      if (!error) setTanques(data);
    };

    fetchTanques();

    const channel = supabase
      .channel("tanque-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Tanque" },
        (payload) => {
          setTanques((prev) =>
            prev.map((t) => (t.id === payload.new.id ? payload.new : t))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleValidarFolio = async () => {
    setError(null);
    setSuccess(false);

    const { data, error } = await supabase
      .from("Producto")
      .select("folio")
      .eq("folio", folio)
      .eq("estado", "procesar")
      .maybeSingle();

    setFolioValido(!error && !!data);
  };

  const handleGuardar = async () => {
    if (!folio || !tanqueSeleccionado || !estado || !litros) {
      setError("Completa todos los campos.");
      return;
    }

    const updates = [
      supabase.from("Tanque_Producto").insert({
        folio_producto: folio,
        id_tanque: tanqueSeleccionado,
      }),

      supabase.from("Tanque").update({
        estado: estado,
        litros: parseFloat(litros),
      }).eq("id", tanqueSeleccionado),

      supabase.from("Producto").update({
        estado: "procesado",
      }).eq("folio", folio),
    ];

    const [r1, r2, r3] = await Promise.all(updates);
    if (r1.error || r2.error || r3.error) {
      setError("Error al guardar los datos.");
      return;
    }

    setSuccess(true);
    setFolio("");
    setFolioValido(null);
    setTanqueSeleccionado(null);
    setEstado(null);
    setLitros("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (folioValido && tanqueSeleccionado && estado && litros) handleGuardar();
        }}
        className="bg-black shadow-2xl rounded-2xl p-8 max-w-lg w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-white">Asignar Tanque</h1>

        <div>
          <Input
            placeholder="Folio"
            value={folio}
            onChange={(e) => {
              setFolio(e.target.value);
              setFolioValido(null);
              setSuccess(false);
              setError(null);
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
          {folioValido === false && (
            <span className="text-red-600">✖ Folio no encontrado o ya procesado</span>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium text-white">Seleccionar tanque: </label>
          <div className="grid grid-cols-3 gap-3">
            {tanques.map((tanque) => (
              <Button
                key={tanque.id}
                type="button"
                onClick={() => setTanqueSeleccionado(tanque.id)}
                className={`text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2 justify-center
                  ${tanqueSeleccionado === tanque.id ? "bg-blue-600" : "bg-gray-600"}`}
              >
                <span>{`Tanque ${tanque.id}`}</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    tanque.estado === "verde"
                      ? "bg-green-500"
                      : tanque.estado === "amarillo"
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                ></span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-white">Litros llenados:</label>
          <Input
            type="number"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
            placeholder="Litros"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-white">Estado del tanque:</label>
          <div className="flex gap-4 justify-center">
            {ESTADOS.map((color) => (
              <Button
                key={color}
                type="button"
                onClick={() => setEstado(color)}
                className={`w-8 h-8 rounded-full ${
                  color === "verde"
                    ? "bg-green-600"
                    : color === "amarillo"
                    ? "bg-yellow-500"
                    : "bg-red-600"
                } ${estado === color ? "ring-4 ring-white" : ""}`}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!folioValido || !tanqueSeleccionado || !estado || !litros}
        >
          Guardar Asignación
        </Button>

        {success && (
          <p className="text-green-500 text-center font-medium">
            ✔ Asignación guardada correctamente
          </p>
        )}
        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
      </form>
    </main>
  );
}
