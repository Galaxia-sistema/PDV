import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarChartComponent } from './bar-chart/bar-chart';
import { PieChartComponent } from './pie-chart/pie-chart';
import { GraphicsService } from './service/graphics-service';
import { BaseChartDirective } from 'ng2-charts';
import { formatValue } from '../../helper/formatter-number'

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

  labels = ['Placa1', 'Placa2', 'Placa3', 'Placa4'];    
  placaSeleccionada: string = '';

  multiSeries = [
    { data: [1, 2, 3, 4, 5], label: 'Empalmes' },
    { data: [6, 7, 8, 9, 10], label: 'Puntos de venta' },
    { data: [11, 12, 13, 14, 15], label: 'Acompañamientos' }
  ];

  datosVentas = [30, 40, 30, 90, 64];
  datosUsuarios = [50, 20, 30];  
  datosConsignacion = [2500];
  labelsEscolta = [''];

  placaBusqueda: string = '';
  //-----------------------------------------
  labelsPlacas: string[] = [];
  datosPlacas: number[] = [];

  labelsPlacasPaginadas: string[] = [];
  datosPlacasPaginados: number[] = [];

  pageSize = 10;
  currentPage = 0;
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';

  private onSearchDataForDate(): void {
    const fechaInicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
    const fechaFin = this.fechaFin ? new Date(this.fechaFin) : null;
  }

  async ngOnInit() {
    const resultado = await this.service.leerPlacasDesdeExcel();

    this.labelsPlacas = resultado.labels;
    this.datosPlacas = resultado.data;

    this.actualizarPagina();

    this.labelsEscolta = (await this.service.leerSumaColumna1PorEscolta()).labels;
    this.datosConsignacion = (await this.service.leerSumaColumna1PorEscolta()).data;
    this.totalConsignacion();
 
    console.log("datos "+(await this.service.leerSumaColumna1PorEscolta()).data);
    console.log("Titulo "+(await this.service.leerSumaColumna1PorEscolta()).labels); 
  }


  totalConsignacionValue: String = '0';

  private totalConsignacion(): void {
    let total: number = 0;
    for (let i = 0; i < this.datosConsignacion.length; i++) {
      total += this.datosConsignacion[i];
    }
    this.totalConsignacionValue = formatValue(total);
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
