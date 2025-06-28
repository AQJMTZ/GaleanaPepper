'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/Accordion';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { SlidersHorizontal } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getStatusIcon = (status: string) => {
  if (status === 'procesado') {
    return <RiCheckboxCircleFill className="size-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />;
  }
  return <RiErrorWarningFill className="size-[18px] shrink-0 text-red-600 dark:text-red-400" />;
};

export default function AuditsPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const limit = 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count } = await supabase
        .from('Producto')
        .select('*', { count: 'exact' })
        .order('folio', { ascending: false })
        .range(from, to);

      setProductos(data || []);
      if (count) setTotalPages(Math.ceil(count / limit));
    }
    fetchData();
  }, [page]);

  const filtered = productos.filter((p) =>
    p.folio.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section aria-label="Audits overview">
      <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
        <Input
          type="search"
          placeholder="Buscar por folio..."
          className="sm:w-64 [&>input]:py-1.5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="secondary"
          className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
        >
          <SlidersHorizontal className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600" aria-hidden="true" />
          Filtros
        </Button>
      </div>

      <div className="border-t border-gray-200 px-6 pb-6 dark:border-gray-800">
        <Accordion type="multiple" className="mt-3">
          {filtered.map((item) => (
            <AccordionItem key={item.folio} value={item.folio.toString()}>
              <AccordionTrigger className="py-5">
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold text-base">Folio #{item.folio}</span>
                  <span className="flex items-center gap-x-2 text-sm">
                    {getStatusIcon(item.estado)}
                    {item.estado || 'pendiente'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
                  <div>
                    <p><strong>Fecha de ingreso:</strong> {item.fecha_ingreso || '--'}</p>
                    <p><strong>Hora de ingreso:</strong> {item.hora_ingreso || '--'}</p>
                    <p><strong># economico Camion:</strong> {item.numero_economico_camion || '--'}</p>
                  </div>
                  <div>
                    <p><strong>Peso (kg):</strong> {item.peso_neto_kg || '0'} kg</p>
                    <p><strong>Peso (lb):</strong> {(parseFloat(item.peso_neto_lb || '0'))} lb</p>
                    <p><strong>Proveedor:</strong> {item.numero_economico_proveedor || '--'}</p>
                    <p><strong>Tanque:</strong> {item.Tanque || '--'}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
          <span>Página {page} de {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
        </div>
      </div>
    </section>
  );
}
