'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

export default function RegistroInicialPage() {
  const [form, setForm] = useState({
    numEconomico: "",
    comentario: "",
    tipoCamion: "",
    porcentajeBasura: "",
    porcentajeChileVerde: "",
    porcentajeChileMuerto: ""
  });
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<string[]>([]);
  
  // Cargar proveedores al iniciar
  useEffect(() => {
    const cargarProveedores = async () => {
      const { data, error } = await supabase
        .from("Proveedor")
        .select("numero_economico");
        
      if (!error && data) {
        setProveedores(data.map((p) => p.numero_economico));
      } else {
        setError("Error al cargar proveedores.");
      }
    };
    
    cargarProveedores();
  }, []);

  // Aplicar validaciones modulares para diferentes tipos de campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validar campos de porcentaje
    if (name.startsWith('porcentaje')) {
      if (validaciones.porcentaje(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      // Para campos que no son porcentajes, actualizar normalmente
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    const {
      numEconomico,
      comentario,
      tipoCamion,
      porcentajeBasura,
      porcentajeChileVerde,
      porcentajeChileMuerto
    } = form;

    // Validar que todos los campos obligatorios estén llenos
    if (!numEconomico || !tipoCamion || porcentajeBasura === "" || porcentajeChileVerde === "" || porcentajeChileMuerto === "") {
      setError("Todos los campos marcados son obligatorios.");
      return;
    }

    // Validar que los porcentajes estén entre 0 y 100
    if (!handleValidarPorcentajes(porcentajeBasura, porcentajeChileVerde, porcentajeChileMuerto)) {
      setError("Los porcentajes deben estar entre 0 y 100.");
      return;
    }

    const basura = parseFloat(porcentajeBasura);
    const verde = parseFloat(porcentajeChileVerde);
    const muerto = parseFloat(porcentajeChileMuerto);

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
          placas: placasAleatorias,
          tipo_de_vehiculo: tipoCamion,
          proveedor: numEconomico
        }
      ])
      .select("numero_economico")
      .single();

    if (camionError || !camionData) {
      setError("Error al guardar camión: " + (camionError?.message || "Error desconocido"));
      return;
    }

    const now = new Date();
    const fechaIngreso = now.toISOString().split("T")[0];
    const horaIngreso = now.toTimeString().slice(0, 5);

    const basura = parseFloat(porcentajeBasura);
    const verde = parseFloat(porcentajeChileVerde);
    const muerto = parseFloat(porcentajeChileMuerto);

    const estado = "pesaje";

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
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRechazar = async () => {
    const {
      numEconomico,
      placas,
      comentario,
      tipoCamion,
      porcentajeBasura,
      porcentajeChileVerde,
      porcentajeChileMuerto
    } = form;

    const { data: proveedor, error: proveedorError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .maybeSingle();

    if (!proveedor || proveedorError) {
      setError("El proveedor no está registrado.");
      return;
    }

    const now = new Date();
    const fechaIngreso = now.toISOString().split("T")[0];
    const horaIngreso = now.toTimeString().slice(0, 5);

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
    if (action === 'aceptar') {
      alert(`Registro exitoso. Folio: ${insertedProducto?.[0]?.folio}`);
    } else {
      alert("Producto rechazado correctamente.");
    }
    
    // Limpiar formulario
    setForm({
      numEconomico: "",
      comentario: "",
      tipoCamion: "",
      porcentajeBasura: "",
      porcentajeChileVerde: "",
      porcentajeChileMuerto: ""
    });

    // Quitar mensaje después de 3 segundos
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAceptar = () => handleAction('aceptar');
  const handleRechazar = () => handleAction('rechazar');
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form className="bg-black rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
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
          min="0"
          max="100"
          step="0.01"
          required
        />
        
        <Input
          type="number"
          name="porcentajeChileVerde"
          value={form.porcentajeChileVerde}
          onChange={handleChange}
          placeholder="Porcentaje de chile verde (%)"
          min="0"
          max="100"
          step="0.01"
          required
        />
        
        <Input
          type="number"
          name="porcentajeChileMuerto"
          value={form.porcentajeChileMuerto}
          onChange={handleChange}
          placeholder="Porcentaje de chile muerto (%)"
          min="0"
          max="100"
          step="0.01"
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
          <p className="text-green-600 font-medium text-center">Registro exitoso</p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center">{error}</p>
        )}
      </form>
    </main>
  );
}
