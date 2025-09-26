import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { parseNumber, parseExcelDate } from '../../../helper/parse-number';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {

 private async contarPorColumna(archivo: string,columna: number, devolverLabels: boolean = true, ordenar: boolean = true,
  fechaColumna?: number, fechaInicio?: string | Date | null, fechaFin?: string | Date | null, acumularNumerico: boolean = false): Promise<{ labels?: string[], data: number[] }> {

  const response = await fetch(`http://localhost:8000/api/excels/${archivo}.xlsx`);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const dataRows = rows.slice(1);

  const inicio = fechaInicio ? (fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio)) : null;
  const fin = fechaFin ? (fechaFin instanceof Date ? fechaFin : new Date(fechaFin)) : null;

  const acumulado = new Map<string, number>();

  for (const row of dataRows) {
    const clave = row[columna];
    if (!clave) continue;

    // ⬇️ Filtro por fecha si se pasa columna de fechas
    if (fechaColumna !== undefined && (inicio || fin)) {
      const fechaObj = parseExcelDate(row[fechaColumna]);
      if (!fechaObj) continue;
      if (inicio && fechaObj < inicio) continue;
      if (fin && fechaObj > fin) continue;
    }

    if (acumularNumerico) {
      const valor = parseNumber(row[0]); // suponiendo que el valor está en col 0
      if (isNaN(valor)) continue;
      acumulado.set(clave, (acumulado.get(clave) || 0) + valor);
    } else {
      acumulado.set(clave, (acumulado.get(clave) || 0) + 1);
    }
  }

  let ordenado: [string, number][];
  if (ordenar) {
    ordenado = Array.from(acumulado.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    ordenado = Array.from(acumulado.entries()).sort((a, b) => b[1] - a[1]);
  }

  const labels = ordenado.map(([clave]) => clave);
  const dataFinal = ordenado.map(([_, cantidad]) => cantidad);

  return devolverLabels ? { labels, data: dataFinal } : { data: dataFinal };
}

  // ---- Métodos públicos ----

  async obtenerPlacasDesdeExcel(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Empalme', 3, true, false,1, fechaInicio, fechaFin);
  }

  async obtenerTotalEmpalmePorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Empalme', 0, true, true,1, fechaInicio, fechaFin);
  }

  async obtenerTotalAcompañamientoPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Acompañamiento', 1, false, true, 3, fechaInicio, fechaFin);
  }

  async obtenerTotalSitioPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('sitios', 1, false, true, 5, fechaInicio, fechaFin);
  }

  async obtenerTotalMarcacionPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Marcaciones', 0, false, true, 3, fechaInicio, fechaFin);
  }

  async obtenerAcumulacionPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Acompañamiento', 7, true, false, 3, fechaInicio, fechaFin, true);
  }

}

