import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { parseNumber, parseExcelDate } from '../../../helper/parse-number';

@Injectable({
  providedIn: 'root'
  
})
export class GraphicsService {
    
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

    const contador: Record<string, number> = {};
    placas.forEach(placa => {
      contador[placa] = (contador[placa] || 0) + 1;
    });

    const ordenado = Object.entries(contador)
      .sort((a, b) => b[1] - a[1]);

    const labels = ordenado.map(([placa]) => placa);
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { labels, data: valores };
  }
  
  async obtenerAcumulacionPorEscolta(fechaInicio?: string | Date,fechaFin?: string | Date): Promise<{ labels: string[], data: number[] }> {

    const response = await fetch('assets/Acompañamiento.xlsx');
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
      const escolta = row[1]; 
      if (!escolta) continue;
      
      if (inicio || fin) {
        const fechaObj = parseExcelDate(row[3]);
        if (!fechaObj) continue;
        if (inicio && fechaObj < inicio) continue;
        if (fin && fechaObj > fin) continue;
      }
      
      const valor = parseNumber(row[0]);
      if (isNaN(valor)) continue;
      acumulado.set(escolta, (acumulado.get(escolta) || 0) + valor);
    }
    
    const ordenado = Array.from(acumulado.entries()).sort((a, b) => b[1] - a[1]);

    return {
      labels: ordenado.map(([nombre]) => nombre),
      data: ordenado.map(([_, suma]) => suma)
    };
  }
  
 async obtenerTotalEmpalmePorEscolta(): Promise<{ labels: string[], data: number[] }> {
    const response = await fetch('assets/Empalme.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const dataRows = rows.slice(1);
    
    const escoltas: string[] = dataRows
      .map((row: any) => row[0])
      .filter((x: any) => !!x);

    const contador: Record<string, number> = {};
    escoltas.forEach(escolta => {
      contador[escolta] = (contador[escolta] || 0) + 1;
    });

    const ordenado = Object.entries(contador)
      .sort((a, b) => a[0].localeCompare(b[0]));

    const labels = ordenado.map(([escolta]) => escolta);
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { labels, data: valores };
  }


  async obtenerTotalAcompañamientoPorEscolta(): Promise<{ data: number[] }> {
    const response = await fetch('assets/Acompañamiento.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const dataRows = rows.slice(1);
    
    const escoltas: string[] = dataRows
      .map((row: any) => row[1])
      .filter((x: any) => !!x);

    const contador: Record<string, number> = {};
    escoltas.forEach(escolta => {
      contador[escolta] = (contador[escolta] || 0) + 1;
    });

    const ordenado = Object.entries(contador)
      .sort((a, b) => a[0].localeCompare(b[0]));
        
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { data: valores };
  }

  async obtenerTotalSitioPorEscolta(): Promise<{ data: number[] }> {
    const response = await fetch('assets/sitios.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const dataRows = rows.slice(1);
    
    const escoltas: string[] = dataRows
      .map((row: any) => row[1])
      .filter((x: any) => !!x);

    const contador: Record<string, number> = {};
    escoltas.forEach(escolta => {
      contador[escolta] = (contador[escolta] || 0) + 1;
    });

    const ordenado = Object.entries(contador)
      .sort((a, b) => a[0].localeCompare(b[0]));
        
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { data: valores };
  }


  async obtenerTotalMarcacionPorEscolta(): Promise<{ data: number[] }> {
    const response = await fetch('assets/marcacion.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const dataRows = rows.slice(1);
    
    const escoltas: string[] = dataRows
      .map((row: any) => row[0])
      .filter((x: any) => !!x);

    const contador: Record<string, number> = {};
    escoltas.forEach(escolta => {
      contador[escolta] = (contador[escolta] || 0) + 1;
    });

    const ordenado = Object.entries(contador)
      .sort((a, b) => a[0].localeCompare(b[0]));
        
    const valores = ordenado.map(([_, cantidad]) => cantidad);

    return { data: valores };
  }

}