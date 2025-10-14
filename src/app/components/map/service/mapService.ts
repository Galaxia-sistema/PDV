import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

interface Coordenada {
  latitud: number;
  longitud: number;
}

interface Marcacion {
  escolta: string;
  coordenadas: Coordenada[];
}


@Injectable({
  providedIn: 'root'
})
export class MapService {


  private getInicioYFinDelMesActual(): { inicio: Date; fin: Date } {
    const ahora = new Date();
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    return { inicio, fin };
  }    

    public async agruparCoordenadasPorEscolta(archivo: string): Promise<any> {
        const response = await fetch(`assets/${archivo}.xlsx`);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const dataRows = rows.slice(1); // quitar encabezado

        const { inicio, fin } = this.getInicioYFinDelMesActual();
        console.log('Fechas de filtrado:', { inicio, fin });

        // 🔹 Estructura base
        const marcacion: {
            [escolta: string]: {
            coordenadas: { latitud: number; longitud: number }[];
            };
        } = {};

        // 🔹 Función para convertir número Excel → Date real
        const parseExcelDate = (excelDate: number): Date => {
            const epoch = new Date(Date.UTC(1899, 11, 30)); // base de Excel
            const fecha = new Date(epoch.getTime() + excelDate * 86400000);
            return fecha;
        };

        for (const row of dataRows) {
            const escolta = row[0];
            const coordStr = row[1];
            const fechaRaw = row[2];

            if (!escolta || !coordStr || !fechaRaw) continue;

            // 📅 Convertir fecha
            const fecha =
            typeof fechaRaw === 'number'
                ? parseExcelDate(fechaRaw)
                : new Date(fechaRaw);

            // 🔍 Filtrar si hay rango de fechas
            if (inicio && fecha < inicio) continue;
            if (fin && fecha > fin) continue;

            // 📍 Parsear coordenadas
            const [latStr, lonStr] = coordStr.split(',').map((v: string) => v.trim());
            const latitud = parseFloat(latStr);
            const longitud = parseFloat(lonStr);

            if (isNaN(latitud) || isNaN(longitud)) continue;

            if (!marcacion[escolta]) {
            marcacion[escolta] = { coordenadas: [] };
            }

            marcacion[escolta].coordenadas.push({ latitud, longitud });
        }

        console.log('RESULTADO FINAL:', marcacion);
        return { marcacion };
    }

}