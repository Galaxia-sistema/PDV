import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { parseNumber, parseExcelDate } from '../../../helper/parse-number';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {

 private async contarPorColumna(
  archivo: string,
  columnaClave: number,
  columnaValor?: number,              
  modo: 'contar' | 'sumar' = 'contar', 
  devolverLabels: boolean = true,
  ordenarAlfabeticamente: boolean = true,
  fechaColumna?: number,
  fechaInicio?: string | Date | null,
  fechaFin?: string | Date | null
): Promise<{ labels?: string[], data: number[] }> {
  const response = await fetch(`assets/${archivo}.xlsx`);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const dataRows = rows.slice(1);
  const inicio = fechaInicio ? new Date(fechaInicio) : null;
  const fin = fechaFin ? new Date(fechaFin) : null;

  const acumulado = new Map<string, number>();

  for (const row of dataRows) {
    const claveRaw = row[columnaClave];
    if (!claveRaw) continue;

    const clave = String(claveRaw).trim();

    // Filtro por fecha si aplica
    if (fechaColumna !== undefined && (inicio || fin)) {
      const fechaObj = parseExcelDate(row[fechaColumna]);
      if (!fechaObj) continue;
      if (inicio && fechaObj < inicio) continue;
      if (fin && fechaObj > fin) continue;
    }

    if (modo === 'sumar') {
      if (columnaValor === undefined) throw new Error("Debe especificar 'columnaValor' cuando el modo es 'sumar'.");
      const valor = Number(row[columnaValor]);
      if (isNaN(valor)) continue;
      acumulado.set(clave, (acumulado.get(clave) || 0) + valor);
    } else {
      acumulado.set(clave, (acumulado.get(clave) || 0) + 1);
    }
  }

  const ordenado = Array.from(acumulado.entries()).sort((a, b) =>
    ordenarAlfabeticamente ? a[0].localeCompare(b[0]) : b[1] - a[1]
  );

  const labels = ordenado.map(([clave]) => clave);
  const dataFinal = ordenado.map(([_, cantidad]) => cantidad);

  return devolverLabels ? { labels, data: dataFinal } : { data: dataFinal };
}


  // ---- Métodos públicos ----

  async obtenerPlacasDesdeExcel(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Empalme', 3, undefined, "contar", true, false, 1, fechaInicio, fechaFin);
  }

  async obtenerTotalEmpalmePorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Empalme', 0, undefined, "contar", true, true, 1, fechaInicio, fechaFin);
  }

  async obtenerTotalAcompañamientoPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('Acompañamiento', 1, undefined, "contar", true, true, 3, fechaInicio, fechaFin);
  }

  async obtenerTotalSitioPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('sitios', 1, undefined, "contar", false, true, 5, fechaInicio, fechaFin);
  }

  async obtenerTotalMarcacionPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {
    return this.contarPorColumna('marcacion', 0, undefined, "contar", false, true, 2, fechaInicio, fechaFin);
  }

  async obtenerAcumulacionPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {    
    return this.contarPorColumna('Acompañamiento', 1, 7, "sumar", true, true, 3, fechaInicio, fechaFin);
  }

  async obtenerAcumulacionPorFlota(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {    
    return this.contarPorColumna('Acompañamiento', 10, 7, "sumar", true, true, 3, fechaInicio, fechaFin);
  }

  async totalEnVehiculoPorEscolta(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {    
    return this.totalEnVehiculo('Acompañamiento', 1, 7, "sumar", true, true, 3, fechaInicio, fechaFin);
  }


async obtenerAcumulacionPorTipo(fechaInicio?: string | Date | null, fechaFin?: string | Date | null) {    
  return this.totalEnVehiculo('Acompañamiento', 1, 7, "sumar", true, true, 3, fechaInicio, fechaFin,6);
}


 private async totalEnVehiculo(
  archivo: string,
  columnaClave: number,
  columnaValor: number,
  modo = 'sumar',
  devolverLabels: boolean = true,
  ordenarAlfabeticamente: boolean = true,
  fechaColumna?: number,
  fechaInicio?: string | Date | null,
  fechaFin?: string | Date | null,
  columnaTipo: number = 6 
): Promise<{
  labels?: string[],
  enSitio?: number[],
  enVehiculo?: number[]
}> {
  const response = await fetch(`assets/${archivo}.xlsx`);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const dataRows = rows.slice(1);
  const inicio = fechaInicio ? new Date(fechaInicio) : null;
  const fin = fechaFin ? new Date(fechaFin) : null;
  
  const acumulado = new Map<string, { enSitio: number; enVehiculo: number }>();

  for (const row of dataRows) {
    const claveRaw = row[columnaClave];
    const tipoOperacion = String(row[columnaTipo] || '').toLowerCase().trim(); // “en sitio” o “en vehículo”

    if (!claveRaw || !tipoOperacion) continue;
    const clave = String(claveRaw).trim();

    // Filtrado por fecha
    if (fechaColumna !== undefined && (inicio || fin)) {
      const fechaObj = parseExcelDate(row[fechaColumna]);
      if (!fechaObj) continue;
      if (inicio && fechaObj < inicio) continue;
      if (fin && fechaObj > fin) continue;
    }

    const valor = Number(row[columnaValor]);
    if (isNaN(valor)) continue;

    if (!acumulado.has(clave)) {
      acumulado.set(clave, { enSitio: 0, enVehiculo: 0 });
    }

    const registro = acumulado.get(clave)!;
    if (tipoOperacion.includes('punto venta')) {
      registro.enSitio += valor;
    } else if (tipoOperacion.includes('vehiculo')) {
      registro.enVehiculo += valor;
    }
  }

  const ordenado = Array.from(acumulado.entries()).sort((a, b) =>
    ordenarAlfabeticamente ? a[0].localeCompare(b[0]) : (b[1].enSitio + b[1].enVehiculo) - (a[1].enSitio + a[1].enVehiculo)
  );

  const labels = ordenado.map(([clave]) => clave);
  const enSitio = ordenado.map(([_, valores]) => valores.enSitio);
  const enVehiculo = ordenado.map(([_, valores]) => valores.enVehiculo);

  return devolverLabels ? { labels, enSitio, enVehiculo } : { enSitio, enVehiculo };
}

}
