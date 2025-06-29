'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/Select";

// Funciones de validación modulares
const validaciones = {
  porcentaje: (valor: string): boolean => {
    // Si está vacío, permitir (para campos en proceso de edición)
    if (valor === '') {
      return true;
    }
    
    // Si es solo un punto decimal, permitir (para iniciar decimales)
    if (valor === '.') {
      return true;
    }

    // Convertir a número
    const num = parseFloat(valor);
    
    // Si no es un número válido, rechazar
    if (isNaN(num)) {
      return false;
    }
    
    // Si está fuera del rango permitido, rechazar
    if (num < 0 || num > 100) {
      return false;
    }
    
    // Permitir números decimales en proceso de escritura (ej: "12.")
    if (valor.endsWith('.')) {
      return true;
    }
    
    // En todos los demás casos (números válidos entre 0-100), permitir
    return true;
  }
};

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

  const handleValidarPorcentajes = (basura: string, verde: string, muerto: string): boolean => {
    return validaciones.porcentaje(basura) &&
           validaciones.porcentaje(verde) &&
           validaciones.porcentaje(muerto);
  };

  const handleAction = async (action: 'aceptar' | 'rechazar') => {
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

    // Validar que el proveedor exista
    const { data: proveedor, error: proveedorError } = await supabase
      .from("Proveedor")
      .select("numero_economico")
      .eq("numero_economico", numEconomico)
      .maybeSingle();

    if (!proveedor || proveedorError) {
      setError("El proveedor no está registrado.");
      return;
    }

    // Generar placas aleatorias si es necesario
    const placasAleatorias = `XYZ-${Math.floor(Math.random() * 10000)}`;

    // Insertar el camión sin placas explícitas (usando placas aleatorias)
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
    const fechaIngreso = now.toISOString().split("T")[0]; // yyyy-mm-dd
    const horaIngreso = now.toTimeString().slice(0, 5); // hh:mm

    // Estado según la acción
    const estado = action === 'aceptar' ? "espera_pesaje" : "rechazado";
    
    // Datos del producto a insertar
    const productoData: any = {
      numero_economico_proveedor: numEconomico,
      numero_economico_camion: camionData.numero_economico,
      fecha_ingreso: fechaIngreso,
      hora_ingreso: horaIngreso,
      estado,
      comentarios: comentario,
      porcentaje_basura: basura,
      porcentaje_chile_verde: verde,
      porcentaje_chile_muerto: muerto
    };

    // Insertar el producto
    const { data: insertedProducto, error: productoError } = await supabase
      .from("Producto")
      .insert([productoData])
      .select("folio");

    if (productoError) {
      setError("Error al guardar producto: " + productoError.message);
      return;
    }

    // Mostrar mensaje de éxito
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
    
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAceptar = () => handleAction('aceptar');
  const handleRechazar = () => handleAction('rechazar');
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form className="bg-black rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center text-white">Registro Inicial</h1>
        
        {proveedores.length > 0 ? (
          <Select 
            value={form.numEconomico} 
            onValueChange={(value) => setForm((prev) => ({ ...prev, numEconomico: value }))}
          >
            <SelectTrigger className="w-full py-1.5">
              <SelectValue placeholder="Selecciona un proveedor" />
            </SelectTrigger>
            <SelectContent align="end">
              {proveedores.map((num) => (
                <SelectItem key={num} value={num}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            name="numEconomico"
            value={form.numEconomico}
            onChange={handleChange}
            placeholder="Número Económico del Proveedor"
            required
          />
        )}

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

        <Select 
          value={form.tipoCamion} 
          onValueChange={(value) => setForm((prev) => ({ ...prev, tipoCamion: value }))}
        >
          <SelectTrigger className="w-full py-1.5">
            <SelectValue placeholder="Tipo de camión" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="tolva">Tolva</SelectItem>
            <SelectItem value="dompe">Dompe</SelectItem>
            <SelectItem value="trailer">Tráiler</SelectItem>
          </SelectContent>
        </Select>

        <textarea
          name="comentario"
          value={form.comentario}
          onChange={handleChange}
          placeholder="Comentarios de carga y/o transporte"
          className="w-full p-2 border border-black-300 rounded-md"
        />

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="success"
            onClick={handleAceptar} 
            className="w-full"
          >
            Continuar
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleRechazar} 
            className="w-full"
          >
            Rechazar
          </Button>
        </div>

        {success && (
          <p className="text-green-600 font-medium text-center">
            ¡Registro exitoso!
          </p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center">{error}</p>
        )}
      </form>
    </main>
  );
}
