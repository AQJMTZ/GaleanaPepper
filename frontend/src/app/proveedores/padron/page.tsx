'use client';

import { useEffect, useState } from "react";
import { Table } from "@/components/Table";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Proveedor = {
  numero_economico: string;
  Nombre: string;
  Segundo_Nombre?: string;
  Apellido: string;
  Apellido_Materno?: string;
};

export default function PadronProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<string | null>(null);
  const [proveedorAModificar, setProveedorAModificar] = useState<string | null>(null);
  const [formEdit, setFormEdit] = useState<Proveedor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = async () => {
    const { data, error } = await supabase.from("Proveedor").select("*");
    if (data) setProveedores(data);
    if (error) console.error("Error cargando proveedores:", error);
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleEliminar = (num: string) => setProveedorAEliminar(num);

  const confirmarEliminar = async () => {
    if (!proveedorAEliminar) return;
    const { error } = await supabase
      .from("Proveedor")
      .delete()
      .eq("numero_economico", proveedorAEliminar);

    if (!error) {
      await fetchProveedores();
    } else {
      console.error("Error al eliminar proveedor:", error);
    }
    setProveedorAEliminar(null);
  };

  const cancelarEliminar = () => setProveedorAEliminar(null);

  const handleEditar = (num: string) => {
    const proveedor = proveedores.find(p => p.numero_economico === num);
    if (proveedor) {
      setProveedorAModificar(num);
      setFormEdit({ ...proveedor });
      setError(null);
    }
  };

  const cancelarEditar = () => {
    setProveedorAModificar(null);
    setFormEdit(null);
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formEdit) return;
    setFormEdit({ ...formEdit, [e.target.name]: e.target.value });
  };

  const confirmarEditar = async () => {
    if (!formEdit || !proveedorAModificar) return;

    if (!formEdit.Nombre.trim() || !formEdit.Apellido.trim() || !formEdit.numero_economico.trim()) {
      setError("Nombre, apellido y número económico son obligatorios.");
      return;
    }

    const duplicado = proveedores.some(
      (p) => p.numero_economico !== proveedorAModificar && p.numero_economico === formEdit.numero_economico
    );
    if (duplicado) {
      setError("Ese número económico ya existe.");
      return;
    }

    const { error } = await supabase
      .from("Proveedor")
      .update(formEdit)
      .eq("numero_economico", proveedorAModificar);

    if (!error) {
      await fetchProveedores();
      cancelarEditar();
    } else {
      console.error("Error al actualizar proveedor:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl bg-black shadow-2xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Padrón de Proveedores</h1>
        <Table>
          <thead>
            <tr>
              <th>Nombre(s)</th>
              <th>Apellido(s)</th>
              <th>Número Económico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-6">
                  No hay proveedores registrados.
                </td>
              </tr>
            )}
            {proveedores.map((p) => (
              <tr key={p.numero_economico} className="text-center">
                <td>{p.Nombre}{p.Segundo_Nombre ? ` ${p.Segundo_Nombre}` : ""}</td>
                <td>{p.Apellido}{p.Apellido_Materno ? ` ${p.Apellido_Materno}` : ""}</td>
                <td><Badge color="blue">{p.numero_economico}</Badge></td>
                <td className="flex flex-row gap-2 justify-center">
                  <Button type="button" className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded" onClick={() => handleEditar(p.numero_economico)}>Modificar</Button>
                  <Button type="button" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={() => handleEliminar(p.numero_economico)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal Eliminar */}
        {proveedorAEliminar && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-black p-6 rounded shadow-lg text-center">
              <p className="mb-4">¿Estás seguro de eliminar este proveedor?</p>
              <div className="flex justify-center gap-4">
                <Button className="bg-red-600 text-white" onClick={confirmarEliminar}>Sí, eliminar</Button>
                <Button className="bg-gray-300" onClick={cancelarEliminar}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {formEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-black p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-center">Editar proveedor</h2>
              <form onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }} className="space-y-3">
                <input type="text" name="Nombre" placeholder="Nombre" value={formEdit.Nombre} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                <input type="text" name="Segundo_Nombre" placeholder="Segundo Nombre" value={formEdit.Segundo_Nombre || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                <input type="text" name="Apellido" placeholder="Apellido" value={formEdit.Apellido} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                <input type="text" name="Apellido_Materno" placeholder="Apellido Materno" value={formEdit.Apellido_Materno || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                <input type="text" name="numero_economico" placeholder="Número Económico" value={formEdit.numero_economico} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex justify-center gap-4 mt-4">
                  <Button type="submit" className="bg-blue-600 text-white">Guardar</Button>
                  <Button type="button" className="bg-gray-300" onClick={cancelarEditar}>Cancelar</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
