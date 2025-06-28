'use client';

import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Category = "red" | "orange" | "emerald" | "gray";
type Metric = {
  label: string;
  value: number;
  percentage: string;
  fraction: string;
};

const getCategory = (value: number): Category => {
  if (value < 0.3) return "red";
  if (value < 0.7) return "orange";
  return "emerald";
};

const categoryConfig = {
  red: { activeClass: "bg-red-500 dark:bg-red-500", bars: 1 },
  orange: { activeClass: "bg-orange-500 dark:bg-orange-500", bars: 2 },
  emerald: { activeClass: "bg-emerald-500 dark:bg-emerald-500", bars: 3 },
  gray: { activeClass: "bg-gray-300 dark:bg-gray-800", bars: 0 },
} as const;

function Indicator({ number }: { number: number }) {
  const category = getCategory(number);
  const config = categoryConfig[category];
  const inactiveClass = "bg-gray-300 dark:bg-gray-800";

  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-3.5 w-1 rounded-sm ${
            index < config.bars ? config.activeClass : inactiveClass
          }`}
        />
      ))}
    </div>
  );
}

// ✅ Corrige parsing para yyyy/mm/dd
function esHoy(dateString: string) {
  const partes = dateString.split(/[\/\-]/);
  if (partes.length < 3) return false;

  const [yyyy, mm, dd] = partes.map(Number);
  const hoy = new Date();
  return (
    hoy.getFullYear() === yyyy &&
    hoy.getMonth() + 1 === mm &&
    hoy.getDate() === dd
  );
}

function segundosAHHMMSS(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].join(":");
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div>
      <dt className="text-sm text-gray-500 dark:text-gray-500">
        {metric.label}
      </dt>
      <dd className="mt-1.5 flex items-center gap-2">
        <Indicator number={metric.value} />
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {metric.percentage}{" "}
          <span className="font-medium text-gray-400 dark:text-gray-600">
            - {metric.fraction}
          </span>
        </p>
      </dd>
    </div>
  );
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    async function calcular() {
      const { data, error } = await supabase.from('Producto').select('*');
      if (error || !data) {
        console.error("Error al obtener datos de Supabase", error);
        return;
      }

      const registradosHoy = data.filter((r) =>
        r.fecha_ingreso && esHoy(r.fecha_ingreso)
      );

      const procesadosHoy = data.filter(
        (p) =>
          p.estado === 'procesado' &&
          p.hora_ingreso &&
          esHoy(p.hora_ingreso)
      );

      const sumaKg = procesadosHoy.reduce(
        (acc, p) => acc + (parseFloat(p.peso_neto_kg) || 0),
        0
      );
      const sumaLb = procesadosHoy.reduce(
        (acc, p) => acc + (parseFloat(p.peso_neto_lb) || 0),
        0
      );

      const sumDuracion = procesadosHoy.reduce(
        (acc, p) => acc + (parseFloat(p.duracionSegundos) || 0),
        0
      );
      const tiempoPromedio =
        procesadosHoy.length > 0 ? sumDuracion / procesadosHoy.length : 0;

      const cumplimiento =
        registradosHoy.length > 0
          ? procesadosHoy.length / registradosHoy.length
          : 0;

      setMetrics([
        {
          label: "Kilos procesados hoy",
          value: sumaKg / 1000,
          percentage: `${sumaKg.toFixed(0)} kg`,
          fraction: `${sumaLb.toFixed(0)} lb`,
        },
        {
          label: "Tiempo promedio de procesamiento",
          value: tiempoPromedio / 3600,
          percentage: segundosAHHMMSS(Math.round(tiempoPromedio)),
          fraction: `${procesadosHoy.length} proceso(s)`,
        },
        {
          label: "Porcentaje de cumplimiento",
          value: cumplimiento,
          percentage: `${(cumplimiento * 100).toFixed(1)}%`,
          fraction: `${procesadosHoy.length}/${registradosHoy.length}`,
        },
      ]);
    }

    calcular();
    const interval = setInterval(calcular, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        Visión General
      </h1>
      <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </dl>
    </>
  );
}
