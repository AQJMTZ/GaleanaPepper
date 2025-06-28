"use client";
import { useState, useEffect } from "react";
// Asegurar importar/crear el cliente de Supabase apropiadamente.
// Por ejemplo, si se tiene un util para supabase:
// import { supabase } from "../utils/supabaseClient";
import { createClient } from "@supabase/supabase-js";

// Inicialización de Supabase (usar las variables de entorno del proyecto)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function DescargaProductos() {
  // Estado para la lista de espera y el producto activo
  const [waitingList, setWaitingList] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);

  // Estados para el cronómetro y flujo de finalización
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);   // indica si se pulsó "Finalizar"
  const [isRejecting, setIsRejecting] = useState(false);   // indica si se eligió "Rechazar"
  const [rejectComment, setRejectComment] = useState("");  // comentario de rechazo

  // Función auxiliar para formatear el tiempo transcurrido (hh:mm:ss o mm:ss)
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds
        .toString()
        .padStart(2, "0")}s`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Cargar lista de espera desde Supabase
  const fetchWaitingList = async () => {
    const { data, error } = await supabase
      .from("Producto")
      .select(`folio, peso_neto_kg, peso_neto_lb, hora_ingreso, Camion(tipo)`)
      .eq("estado", "descargar");
    if (error) {
      console.error("Error fetching waiting list:", error);
    } else {
      setWaitingList(data || []);
    }
  };

  // useEffect para cargar la lista al montar el componente
  useEffect(() => {
    fetchWaitingList();
    // Opcional: suscribirse a cambios en tiempo real de la tabla Producto si se desea actualizar la lista automáticamente.
    // (No implementado aquí por simplicidad; la lista se actualizará manualmente tras cada proceso).
  }, []);

  // useEffect para manejar el cronómetro en marcha (tick cada 1s y actualización en Supabase cada 10s)
  useEffect(() => {
    let intervalId;
    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newElapsed = prev + 1;
          // Actualizar en Supabase cada 10 segundos
          if (newElapsed % 10 === 0 && activeProduct) {
            supabase
              .from("Producto")
              .update({ tiempo_espera_descarga: newElapsed })
              .eq("folio", activeProduct.folio);
          }
          return newElapsed;
        });
      }, 1000);
    }
    // Cleanup del intervalo cuando se detenga el cronómetro
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, activeProduct]);

  // Manejar clic en "Aceptar" de la lista de espera
  const handleAccept = (product) => {
    if (activeProduct) return; // ya hay un proceso activo, no hacer nada
    setActiveProduct(product);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setIsFinishing(false);
    setIsRejecting(false);
    setRejectComment("");
    // Opcional: quitar el producto seleccionado de la lista de espera inmediata (para ocultarlo)
    // setWaitingList((prev) => prev.filter(item => item.folio !== product.folio));
  };

  // Iniciar la descarga (cronómetro)
  const handleStart = () => {
    if (!activeProduct) return;
    setIsTimerRunning(true);
    setIsFinishing(false);
    setIsRejecting(false);
    // (Podríamos aquí marcar en la BD algún indicador de inicio si se requiere)
  };

  // Finalizar la descarga: mostrar opciones de Aceptar/Rechazar
  const handleFinish = () => {
    if (!activeProduct) return;
    setIsTimerRunning(false);  // detener el cronómetro
    setIsFinishing(true);      // iniciar flujo de finalización
    setIsRejecting(false);
    // (El tiempo final en segundos queda en elapsedSeconds)
  };

  // Confirmar aceptación del producto
  const confirmAccept = async () => {
    if (!activeProduct) return;
    const totalTime = elapsedSeconds;
    // Actualizar estado a 'procesar' y guardar tiempo total de descarga
    const { error } = await supabase
      .from("Producto")
      .update({ estado: "procesar", tiempo_espera_descarga: totalTime })
      .eq("folio", activeProduct.folio);
    if (error) {
      console.error("Error updating product as accepted:", error);
    }
    // Reiniciar vista
    setActiveProduct(null);
    setIsFinishing(false);
    setIsRejecting(false);
    setRejectComment("");
    setElapsedSeconds(0);
    // Recargar la lista de espera para reflejar cambios
    fetchWaitingList();
  };

  // Confirmar rechazo del producto (requiere comentario)
  const confirmReject = async () => {
    if (!activeProduct) return;
    if (rejectComment.trim() === "") {
      // Asegurarse de que el comentario no esté vacío
      alert("Por favor ingrese un comentario de rechazo.");
      return;
    }
    const { error } = await supabase
      .from("Producto")
      .update({ estado: "rechazado", comentarios: rejectComment.trim() })
      .eq("folio", activeProduct.folio);
    if (error) {
      console.error("Error updating product as rejected:", error);
    }
    // Reiniciar vista
    setActiveProduct(null);
    setIsFinishing(false);
    setIsRejecting(false);
    setRejectComment("");
    setElapsedSeconds(0);
    fetchWaitingList();
  };

  return (
    <div className="p-4">
      {/* Sección superior: proceso de descarga activo */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        {activeProduct ? (
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Descarga en proceso – Folio {activeProduct.folio}
            </h2>

            {/* Detalles del producto activo, se podrían mostrar más info si se desea */}
            <p className="mb-2">
              <strong>Tipo de camión:</strong>{" "}
              {activeProduct.Camion ? activeProduct.Camion.tipo : "Desconocido"}
            </p>
            <p className="mb-4">
              <strong>Peso neto:</strong> {activeProduct.peso_neto_kg} kg (
              {activeProduct.peso_neto_lb} lb)
            </p>

            {/* Botón de iniciar o controles de cronómetro */}
            {!isTimerRunning && !isFinishing ? (
              // Mostrar botón "Iniciar descarga" si aún no se ha iniciado
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
              >
                Iniciar descarga
              </button>
            ) : (
              // Si está en marcha el cronómetro, mostrar el tiempo y el botón Finalizar/flujo finalización
              <div>
                <p className="mb-3 text-lg">
                  Tiempo transcurrido:{" "}
                  <span className="font-mono">{formatTime(elapsedSeconds)}</span>
                </p>

                {!isFinishing ? (
                  // Botón para finalizar (aún no se ha pulsado finalizar)
                  <button
                    onClick={handleFinish}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                  >
                    Finalizar descarga
                  </button>
                ) : (
                  // Si ya se pulsó finalizar, mostrar opciones Aceptar/Rechazar o campo de comentario
                  <div>
                    {!isRejecting ? (
                      // Preguntar si aceptado o rechazado
                      <div className="mb-3">
                        <p className="mb-2">
                          <strong>¿El producto fue aceptado o rechazado?</strong>
                        </p>
                        <button
                          onClick={confirmAccept}
                          className="mr-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => setIsRejecting(true)}
                          className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded hover:bg-yellow-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      // Si se eligió rechazar, pedir comentario y botón para confirmar rechazo
                      <div className="mb-3">
                        <label className="block font-medium mb-1">
                          Comentario de rechazo:
                        </label>
                        <textarea
                          className="w-full p-2 border rounded"
                          rows="3"
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          placeholder="Escriba la razón del rechazo..."
                        />
                        <button
                          onClick={confirmReject}
                          className="mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                        >
                          Confirmar rechazo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Si no hay producto activo
          <h2 className="text-xl">
            <em>No hay ninguna descarga en curso.</em>
          </h2>
        )}
      </div>

      {/* Tabla de lista de espera */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Lista de espera para descargar
        </h2>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="py-2 px-3 border">Folio</th>
              <th className="py-2 px-3 border">Peso Neto (kg)</th>
              <th className="py-2 px-3 border">Peso Neto (lb)</th>
              <th className="py-2 px-3 border">Tipo de Camión</th>
              <th className="py-2 px-3 border">Tiempo de Espera</th>
              <th className="py-2 px-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {waitingList.map((product) => {
              // Calcular tiempo de espera desde hora_ingreso hasta ahora (en minutos/horas)
              const ingreso = new Date(product.hora_ingreso);
              const now = new Date();
              const diffMs = now - ingreso;
              const diffMin = Math.floor(diffMs / 60000);
              const hours = Math.floor(diffMin / 60);
              const minutes = diffMin % 60;
              let tiempoEsperaStr;
              if (hours > 0) {
                tiempoEsperaStr = `${hours}h ${minutes}m`;
              } else {
                tiempoEsperaStr = `${minutes} min`;
              }
              return (
                <tr key={product.folio} className="border-b">
                  <td className="py-2 px-3 border">{product.folio}</td>
                  <td className="py-2 px-3 border">{product.peso_neto_kg}</td>
                  <td className="py-2 px-3 border">{product.peso_neto_lb}</td>
                  <td className="py-2 px-3 border">
                    {product.Camion ? product.Camion.tipo : "N/A"}
                  </td>
                  <td className="py-2 px-3 border">{tiempoEsperaStr}</td>
                  <td className="py-2 px-3 border">
                    <button
                      onClick={() => handleAccept(product)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!!activeProduct}  /* deshabilitar si hay un activo */
                    >
                      Aceptar
                    </button>
                  </td>
                </tr>
              );
            })}
            {waitingList.length === 0 && (
              <tr>
                <td colSpan="6" className="py-3 px-3 text-center text-gray-500">
                  (No hay productos pendientes de descarga)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DescargaProductos;
