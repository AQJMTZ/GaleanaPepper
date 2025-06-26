'use client';

import { useEffect, useState } from "react";
import { Table } from "@/components/Table";
import { Badge } from "@/components/Badge";
import {Button} from "@/components/Button";

const obtenerProveedores = () => {
  try {
    const arr = JSON.parse(localStorage.getItem("proveedores") || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

type Proveedor = {
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  numEconomico: string;
};

export default function PadronProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<number | null>(null);
  const [proveedorAModificar, setProveedorAModificar] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<Proveedor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProveedores(obtenerProveedores());
  }, []);

  // Eliminar proveedor
  const handleEliminar = (idx: number) => setProveedorAEliminar(idx);

  const confirmarEliminar = () => {
    if (proveedorAEliminar === null) return;
    const nuevos = [...proveedores];
    nuevos.splice(proveedorAEliminar, 1);
    localStorage.setItem("proveedores", JSON.stringify(nuevos));
    setProveedores(nuevos);
    setProveedorAEliminar(null);
  };

  const cancelarEliminar = () => setProveedorAEliminar(null);

  // Editar proveedor
  const handleEditar = (idx: number) => {
    setProveedorAModificar(idx);
    setFormEdit({ ...proveedores[idx] });
    setError(null);
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

  const confirmarEditar = () => {
    if (!formEdit || proveedorAModificar === null) return;

    // Validación simple
    if (!formEdit.nombre.trim() || !formEdit.apellido.trim() || !formEdit.numEconomico.trim()) {
      setError("Nombre, apellido y número económico son obligatorios.");
      return;
    }

    // Verifica duplicados de número económico (excepto el mismo)
    if (proveedores.some(
      (p, idx) => idx !== proveedorAModificar && p.numEconomico === formEdit.numEconomico
    )) {
      setError("Ese número económico ya existe.");
      return;
    }

    const nuevos = [...proveedores];
    nuevos[proveedorAModificar] = formEdit;
    localStorage.setItem("proveedores", JSON.stringify(nuevos));
    setProveedores(nuevos);
    setProveedorAModificar(null);
    setFormEdit(null);
    setError(null);
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
            {proveedores.map((p, idx) => (
              <tr key={idx} className="text-center">
                <td>
                  {p.nombre}
                  {p.segundoNombre ? ` ${p.segundoNombre}` : ""}
                </td>
                <td>
                  {p.apellido}
                  {p.segundoApellido ? ` ${p.segundoApellido}` : ""}
                </td>
                <td>
                  <Badge color="blue">{p.numEconomico}</Badge>
                </td>
                <td className="flex flex-row gap-2 justify-center">
                  <Button
                    type="button"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                    onClick={() => handleEditar(idx)}
                  >
                    Modificar
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => handleEliminar(idx)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pop-up de confirmación de eliminación */}
        {proveedorAEliminar !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
              <h2 className="text-lg font-bold mb-4 text-gray-900">¿Eliminar proveedor?</h2>
              <p className="mb-6 text-gray-700">
                ¿Seguro que deseas eliminar este proveedor? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  onClick={confirmarEliminar}
                >
                  Sí, eliminar
                </Button>
                <Button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded"
                  onClick={cancelarEliminar}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pop-up de modificación */}
        {proveedorAModificar !== null && formEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Modificar proveedor</h2>
              <form
                onSubmit={e => { e.preventDefault(); confirmarEditar(); }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formEdit.nombre}
                    onChange={handleEditChange}
                    className="w-1/2 rounded border px-2 py-1"
                    required
                  />
                  <input
                    type="text"
                    name="segundoNombre"
                    placeholder="Segundo nombre"
                    value={formEdit.segundoNombre || ""}
                    onChange={handleEditChange}
                    className="w-1/2 rounded border px-2 py-1"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    value={formEdit.apellido}
                    onChange={handleEditChange}
                    className="w-1/2 rounded border px-2 py-1"
                    required
                  />
                  <input
                    type="text"
                    name="segundoApellido"
                    placeholder="Segundo apellido"
                    value={formEdit.segundoApellido || ""}
                    onChange={handleEditChange}
                    className="w-1/2 rounded border px-2 py-1"
                  />
                </div>
                <input
                  type="text"
                  name="numEconomico"
                  placeholder="Número económico"
                  value={formEdit.numEconomico}
                  onChange={handleEditChange}
                  className="w-full rounded border px-2 py-1"
                  required
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex gap-4 justify-center mt-4">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded"
                    onClick={cancelarEditar}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
