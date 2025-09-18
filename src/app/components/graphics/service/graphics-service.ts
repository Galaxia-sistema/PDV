import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
  
})
export class GraphicsService {

  
  // Método que lee el Excel quemado y retorna labels únicos + cantidad de repeticiones
  async leerPlacasDesdeExcel(): Promise<{ labels: string[], data: number[] }> {
    const response = await fetch('assets/Empalme.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const dataRows = rows.slice(1);
    
    const placas: string[] = dataRows
      .map((row: any) => row[3])
      .filter((x: any) => !!x);
    // contar repeticiones
    const contador: Record<string, number> = {};
    placas.forEach(placa => {
      contador[placa] = (contador[placa] || 0) + 1;
    });

    // ordenar de mayor a menor
    const ordenado = Object.entries(contador)
      .sort((a, b) => b[1] - a[1]);
    
    const labels = ordenado.map(([placa]) => placa);
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { labels, data: valores };
  }



  /**
   * Suma los valores de la columna 1 (index 0) agrupados por escolta (columna 2 - index 1).
   * Si se pasan fechaInicio/fechaFin, filtra las filas por la fecha en columna 4 (index 3).
   *
   * @param fechaInicio string o Date (opcional) — si no se pasa, incluye todas las filas (sin filtrar por fecha)
   * @param fechaFin string o Date (opcional)
   */
  async leerSumaColumna1PorEscolta(fechaInicio?: string | Date,fechaFin?: string | Date): Promise<{ labels: string[], data: number[] }> {

    const response = await fetch('assets/Acompañamiento.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    const dataRows = rows.slice(1); // omitimos cabecera

    const inicio = fechaInicio ? (fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio)) : null;
    const fin = fechaFin ? (fechaFin instanceof Date ? fechaFin : new Date(fechaFin)) : null;

    const acumulado = new Map<string, number>();

    for (const row of dataRows) {
      const escolta = row[1]; // columna 2 (index 1)
      if (!escolta) continue;

      // Si se pasaron filtros de fecha, la fila debe tener fecha válida en columna 4 (index 3)
      if (inicio || fin) {
        const fechaObj = parseExcelDate(row[3]);
        if (!fechaObj) continue; // fila sin fecha válida -> la saltamos cuando hay filtro
        if (inicio && fechaObj < inicio) continue;
        if (fin && fechaObj > fin) continue;
      }

      // Sumamos el valor de la columna 1 (index 0)
      const valor = parseNumber(row[0]);
      if (isNaN(valor)) continue; // omitimos filas sin número válido en columna 1
      acumulado.set(escolta, (acumulado.get(escolta) || 0) + valor);
    }

    // Ordenamos por acumulado descendente
    const ordenado = Array.from(acumulado.entries()).sort((a, b) => b[1] - a[1]);

    return {
      labels: ordenado.map(([nombre]) => nombre),
      data: ordenado.map(([_, suma]) => suma)
    };
  }
  
}
  function parseNumber(cell: any): number {
  if (cell === null || cell === undefined) return NaN;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return NaN;

  // Limpieza básica: quitar espacios y símbolos comunes (puedes ajustar según tu Excel)
  const s = cell.trim();

  // Si contiene tanto '.' como ',' asumimos que '.' es separador de miles y ',' decimal (ej: "1.234,56")
  if (s.indexOf('.') >= 0 && s.indexOf(',') >= 0) {
    const cleaned = s.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d\.-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  }

  // Si solo tiene ',' lo convertimos a punto decimal
  if (s.indexOf(',') >= 0 && s.indexOf('.') === -1) {
    const cleaned = s.replace(/,/g, '.').replace(/[^\d\.-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  }

  // Caso general: quitar símbolos no numéricos
  const cleaned = s.replace(/[^\d\.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

/**
 * Intenta convertir la celda de fecha (puede ser Date, número serial de Excel, o string) a Date.
 * Devuelve null si no se puede.
 */
function parseExcelDate(cell: any): Date | null {
  if (cell === null || cell === undefined || cell === '') return null;
  if (cell instanceof Date) return cell;
  if (typeof cell === 'number') {
    // Excel serial date -> JS Date
    // Nota: la conversión más común usa 25569 como offset (diferencia entre epoch Excel y JS)
    // Puede variar según tu archivo (si hay errores de día de base 1900/1904). Ajusta si es necesario.
    const jsDate = new Date(Math.round((cell - 25569) * 86400 * 1000));
    return isNaN(jsDate.getTime()) ? null : jsDate;
  }
  if (typeof cell === 'string') {
    const s = cell.trim();
    // Intento parse estándar
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;

    // Intento dd/mm/yyyy o dd-mm-yyyy
    const parts = s.split(/[\/\-.]/).map(p => p.trim());
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);

      // si el primer grupo tiene 4 dígitos, asumimos yyyy-mm-dd
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }

      const alt = new Date(year, month, day);
      if (!isNaN(alt.getTime())) return alt;
    }
  }
  return null;
}


