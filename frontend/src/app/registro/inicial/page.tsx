// Versión actualizada con selector de foto integrado y vista previa
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

const validaciones = {
  porcentaje: (valor: string): boolean => {
    if (valor === '' || valor === '.') return true;
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0 || num > 100) return false;
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

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<string[]>([]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('porcentaje')) {
      if (validaciones.porcentaje(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  // Fragmento para debug en subirFotoASupabase()
const subirFotoASupabase = async (): Promise<string | null> => {
  if (!foto) {
    console.warn("No se seleccionó ninguna foto para subir.");
    return null;
  }

  const extension = foto.name.split('.').pop();
  const nombreArchivo = `producto_${Date.now()}.${extension}`;

  console.log("Subiendo archivo:", nombreArchivo);

  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from("fotos-producto")
    .upload(nombreArchivo, foto);

  if (uploadError) {
    console.error("Error al subir la foto:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("fotos-producto").getPublicUrl(nombreArchivo);

  if (!urlData?.publicUrl) {
    console.error("No se pudo obtener la URL pública de la foto.");
    return null;
  }

  console.log("URL pública obtenida:", urlData.publicUrl);

  return urlData.publicUrl;
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

    if (!numEconomico || !tipoCamion || porcentajeBasura === "" || porcentajeChileVerde === "" || porcentajeChileMuerto === "") {
      setError("Todos los campos marcados son obligatorios.");
      return;
    }
    if (!validaciones.porcentaje(porcentajeBasura) || !validaciones.porcentaje(porcentajeChileVerde) || !validaciones.porcentaje(porcentajeChileMuerto)) {
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

    const placasAleatorias = `XYZ-${Math.floor(Math.random() * 10000)}`;
    const { data: camionData, error: camionError } = await supabase
      .from("Camion")
      .insert([{ placas: placasAleatorias, tipo_de_vehiculo: tipoCamion, proveedor: numEconomico }])
      .select("numero_economico")
      .single();

    if (camionError || !camionData) {
      setError("Error al guardar camión: " + (camionError?.message || "Error desconocido"));
      return;
    }

    const now = new Date();
    const fechaIngreso = now.toISOString().split("T")[0];
    const horaIngreso = now.toTimeString().slice(0, 5);
    const estado = action === 'aceptar' ? "espera_pesaje" : "rechazado";

    const fotoUrl = await subirFotoASupabase();

    const productoData: any = {
      numero_economico_proveedor: numEconomico,
      numero_economico_camion: camionData.numero_economico,
      fecha_ingreso: fechaIngreso,
      hora_ingreso: horaIngreso,
      estado,
      comentarios: comentario,
      porcentaje_basura: basura,
      porcentaje_chile_verde: verde,
      porcentaje_chile_muerto: muerto,
      foto: fotoUrl || null
    };

    const { data: insertedProducto, error: productoError } = await supabase
      .from("Producto")
      .insert([productoData])
      .select("folio");

    if (productoError) {
      setError("Error al guardar producto: " + productoError.message);
      return;
    }

    setSuccess(true);
    alert(action === 'aceptar' ? `Registro exitoso. Folio: ${insertedProducto?.[0]?.folio}` : "Producto rechazado.");
    setForm({ numEconomico: "", comentario: "", tipoCamion: "", porcentajeBasura: "", porcentajeChileVerde: "", porcentajeChileMuerto: "" });
    setFoto(null);
    setFotoPreview(null);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form className="bg-black rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center text-white">Registro Inicial</h1>

        {proveedores.length > 0 ? (
          <Select value={form.numEconomico} onValueChange={(value) => setForm((prev) => ({ ...prev, numEconomico: value }))}>
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
          <Input type="text" name="numEconomico" value={form.numEconomico} onChange={handleChange} placeholder="Número Económico del Proveedor" required />
        )}

        <Input type="number" name="porcentajeBasura" value={form.porcentajeBasura} onChange={handleChange} placeholder="Porcentaje de basura (%)" min="0" max="100" step="0.01" required />
        <Input type="number" name="porcentajeChileVerde" value={form.porcentajeChileVerde} onChange={handleChange} placeholder="Porcentaje de chile verde (%)" min="0" max="100" step="0.01" required />
        <Input type="number" name="porcentajeChileMuerto" value={form.porcentajeChileMuerto} onChange={handleChange} placeholder="Porcentaje de chile muerto (%)" min="0" max="100" step="0.01" required />

        <Select value={form.tipoCamion} onValueChange={(value) => setForm((prev) => ({ ...prev, tipoCamion: value }))}>
          <SelectTrigger className="w-full py-1.5">
            <SelectValue placeholder="Tipo de camión" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="tolva">Tolva</SelectItem>
            <SelectItem value="dompe">Dompe</SelectItem>
            <SelectItem value="trailer">Tráiler</SelectItem>
          </SelectContent>
        </Select>

        <textarea name="comentario" value={form.comentario} onChange={handleChange} placeholder="Comentarios de carga y/o transporte" className="w-full p-2 border border-black-300 rounded-md" />

        <div className="space-y-2">
          <label className="block text-white font-semibold">Agregar Foto</label>
          <input type="file" accept="image/*" capture="environment" onChange={handleFotoChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50" />
          {fotoPreview && <img src={fotoPreview} alt="Vista previa" className="w-300 rounded-md mt-1" />}
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="success" onClick={() => handleAction('aceptar')} className="w-full">Continuar</Button>
          <Button type="button" variant="destructive" onClick={() => handleAction('rechazar')} className="w-full">Rechazar</Button>
        </div>

        {success && <p className="text-green-600 font-medium text-center">¡Registro exitoso!</p>}
        {error && <p className="text-red-600 font-medium text-center">{error}</p>}
      </form>
    </main>
  );
}
