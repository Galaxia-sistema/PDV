import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarChartComponent } from './bar-chart/bar-chart';
import { PieChartComponent } from './pie-chart/pie-chart';
import { GraphicsService } from './service/graphics-service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [RouterOutlet, BarChartComponent, PieChartComponent, FormsModule],
  templateUrl: './graphics.html',
  styleUrls: ['./graphics.css']
})
export class Graphics implements OnInit {
  constructor(private service: GraphicsService) {}

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Datos dinámicos desde Excel
  labelsPlacas: string[] = [];
  datosPlacas: number[] = [];

  // Datos que se mostrarán en el gráfico (paginados)
  labelsPlacasPaginadas: string[] = [];
  datosPlacasPaginados: number[] = [];

  // Configuración de paginación
  pageSize = 10;
  currentPage = 0;

  async ngOnInit() {
    const resultado = await this.service.leerPlacasDesdeExcel();

    this.labelsPlacas = resultado.labels;
    console.log("placas excel:"+this.labelsPlacas);
    this.datosPlacas = resultado.data;

    // Inicializar primera página
    this.actualizarPagina();

    console.log('Placas únicas:', this.labelsPlacas);
    console.log('Cantidad por placa:', this.datosPlacas);
  }

  actualizarPagina() {
    const start = this.currentPage * this.pageSize;
    this.labelsPlacasPaginadas = this.labelsPlacas.slice(start, start + this.pageSize);
    this.datosPlacasPaginados = this.datosPlacas.slice(start, start + this.pageSize);
    
    this.chart?.update();
  }

  get totalPages() {
    return Math.ceil(this.labelsPlacas.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.actualizarPagina();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.actualizarPagina();
    }
  }

  // 🔹 Lo demás que ya tenías
  labels = ['Placa1', 'Placa2', 'Placa3', 'Placa4'];    
  placaSeleccionada: string = '';

  multiSeries = [
    { data: [1, 2, 3, 4, 5], label: 'Empalmes' },
    { data: [6, 7, 8, 9, 10], label: 'Puntos de venta' },
    { data: [11, 12, 13, 14, 15], label: 'Acompañamientos' }
  ];

  labelGeneral = ['Soldado 1','Soldado 2','Soldado 3','Soldado 4','Soldado 5'];  
  datosVentas = [30, 40, 30, 90, 64];
  datosUsuarios = [50, 20, 30];  
  datosConsignacion = [2500];
  labelsConsignacion = ['Total consignación mensual'];

  placaBusqueda: string = '';

  get datosFiltrados() {
    if (!this.placaBusqueda) return this.datosPlacas;
    const index = this.labelsPlacas.findIndex(l =>
      l.toLowerCase().includes(this.placaBusqueda.toLowerCase())
    );
    return index >= 0 ? [this.datosPlacas[index]] : [];
  }

  get labelsFiltrados() {
    if (!this.placaBusqueda) return this.labelsPlacas;
    const match = this.labelsPlacas.find(l =>
      l.toLowerCase().includes(this.placaBusqueda.toLowerCase())
    );
    return match ? [match] : [];
  }

  markers = [
    { lat: 4.711, lng: -74.072, label: 'Bogotá' },
    { lat: 6.244, lng: -75.581, label: 'Medellín' },
    { lat: 3.451, lng: -76.532, label: 'Cali' }
  ];
}
