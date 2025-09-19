import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { parseNumber, parseExcelDate } from '../../../helper/parse-number';

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

    // leer la primera hoja
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    // convertir a JSON (array de arrays)
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // ⬇️ saltar la primera fila (encabezado)
    const dataRows = rows.slice(1);

    // placas en la columna 3 (índice 3)
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
      .sort((a, b) => b[1] - a[1]); // compara por la cantidad

    // separar en labels y data
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