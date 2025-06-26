'use client';

import { useEffect, useState } from "react";

// ... Indicator y helpers igual que en tu código ...

type Category = "red" | "orange" | "emerald" | "gray";
type Metric = {
  label: string
  value: number
  percentage: string
  fraction: string
};

const getCategory = (value: number): Category => {
  if (value < 0.3) return "red";
  if (value < 0.7) return "orange";
  return "emerald";
};

const categoryConfig = {
  red: {
    activeClass: "bg-red-500 dark:bg-red-500",
    bars: 1,
  },
  orange: {
    activeClass: "bg-orange-500 dark:bg-orange-500",
    bars: 2,
  },
  emerald: {
    activeClass: "bg-emerald-500 dark:bg-emerald-500",
    bars: 3,
  },
  gray: {
    activeClass: "bg-gray-300 dark:bg-gray-800",
    bars: 0,
  },
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

// Utilidades para comparar fechas (solo año-mes-día)
function esHoy(dateString: string) {
  const hoy = new Date();
  const d = new Date(dateString);
  return (
    hoy.getFullYear() === d.getFullYear() &&
    hoy.getMonth() === d.getMonth() &&
    hoy.getDate() === d.getDate()
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

  // Actualiza cada segundo para visión en tiempo real
  useEffect(() => {
    function calcular() {
      // Datos procesados (productos que sí se procesaron)
      const procesados = (() => {
        try {
          const arr = JSON.parse(localStorage.getItem("folio_producto") || "[]");
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })();

      // Datos registrados (todos los que entraron hoy)
      const registrados = (() => {
        try {
          const arr = JSON.parse(localStorage.getItem("folio_producto") || "[]");
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })();

      // --- FILTROS DEL DÍA ---
      const procesadosHoy = procesados.filter(
        (p: any) =>
          p.horaInicio && esHoy(p.horaInicio)
      );
      const registradosHoy = registrados.filter(
        (r: any) =>
          r.fechaIngreso && esHoy(r.fechaIngreso)
      );

      // --- 1. Toneladas procesadas hoy ---
      // Suma el peso de cada procesado del día
      const sumaPesos = procesadosHoy.reduce(
        (acc: number, p: any) => acc + (parseFloat(p.peso) || 0),
        0
      );
      // Para presentación: toneladas si son muchos kg
      const toneladas = sumaPesos / 1000;

      // --- 2. Tiempo promedio de procesamiento hoy ---
      const sumDuracion = procesadosHoy.reduce(
        (acc: number, p: any) => acc + (parseFloat(p.duracionSegundos) || 0),
        0
      );
      const tiempoPromedio =
        procesadosHoy.length > 0 ? sumDuracion / procesadosHoy.length : 0;

      // --- 3. Porcentaje de cumplimiento hoy ---
      // (cuántos registrados hoy SÍ llegaron a procesarse)
      const cumplimiento =
        registradosHoy.length > 0
          ? procesadosHoy.length / registradosHoy.length
          : 0;

      setMetrics([
        {
          label: "Toneladas procesadas",
          value: toneladas > 1 ? 1 : toneladas, // indicador (para color, puedes ajustar)
          percentage: `${toneladas.toFixed(2)} t`,
          fraction: `${sumaPesos} kg`,
        },
        {
          label: "Tiempo promedio de procesamiento",
          value: tiempoPromedio / 3600, // escala para el indicador
          percentage: segundosAHHMMSS(Math.round(tiempoPromedio)),
          fraction: procesadosHoy.length
            ? `${procesadosHoy.length} proceso(s)`
            : "0",
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
    const interval = setInterval(calcular, 1000);
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
