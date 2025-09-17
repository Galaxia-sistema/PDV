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
  
}