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
  
  multiSeries: any[] = []; 
  
  placaBusqueda: string = '';
  datosConsignacion = [0];
  labelsEscolta = [''];

  labelsPlacas: string[] = [];
  datosPlacas: number[] = [];

  labelsPlacasPaginadas: string[] = [];
  datosPlacasPaginados: number[] = [];

  pageSize = 10;
  currentPage = 0;
    
  totalConsignacionValue: String = '0';
  totalEmpalmesValue: String = '0';
  totalAcompValue: String = '0';
  totalSitiosValue: String = '0';

  datosSitio = [0];
  datosAcomp = [0];  
  datosEmpalmes = [0];
  datosMarcaciones = [0];
  //-----------------------------------------
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';

  private onSearchDataForDate(): void {
    const fechaInicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
    const fechaFin = this.fechaFin ? new Date(this.fechaFin) : null;
  }

  async ngOnInit() {
    const resultado = await this.service.leerPlacasDesdeExcel();
    const resultadoEmpalmes = await this.service.obtenerTotalEmpalmePorEscolta();
    const resultadoAcomp = await this.service.obtenerTotalAcompañamientoPorEscolta();
    const resultadoSitios = await this.service.obtenerTotalSitioPorEscolta();

    //REVISAR ESOS RESULTADOS
    this.multiSeries = [
      { data: resultadoEmpalmes.data, label: 'Empalmes' },
      { data: resultadoSitios.data, label: 'Puntos de venta' },
      { data: resultadoAcomp.data, label: 'Acompañamientos' }
    ];

    this.datosSitio = resultadoSitios.data;
    this.datosAcomp = resultadoAcomp.data;
    this.datosEmpalmes = resultadoEmpalmes.data;
    this.labelsPlacas = resultado.labels;
    this.datosPlacas = resultado.data;
    this.datosMarcaciones = (await this.service.obtenerTotalMarcacionPorEscolta()).data;

    this.actualizarPagina();
    this.labelsEscolta = (await this.service.obtenerTotalEmpalmePorEscolta()).labels;

    //muestra la acumulacion de todos los escoltas
    this.totalConsignacion(); 
    this.calcularTotalEmpalmes(resultadoEmpalmes);
    this.calcularTotalAcompañamiento(resultadoAcomp);
    this.calcularTotalSitios(resultadoSitios);
  }

  private async calcularTotalSitios(resultadoSitios: { data: number[] }): Promise<void> {
    let total: number = 0;
    for (let i = 0; i < resultadoSitios.data.length; i++) {
      total += resultadoSitios.data[i];
    }
    this.totalSitiosValue = total.toString();    
  }


  private async calcularTotalEmpalmes(resultadoEmpalme: { data: number[] }): Promise<void> {
    let total: number = 0;
    for (let i = 0; i < resultadoEmpalme.data.length; i++) {
      total += resultadoEmpalme.data[i];
    }
    this.totalEmpalmesValue = total.toString();    
  }

  private async calcularTotalAcompañamiento(resultadoAcomp: { data: number[] }): Promise<void> {
    let total: number = 0;
    for (let i = 0; i < resultadoAcomp.data.length; i++) {
      total += resultadoAcomp.data[i];
    }
    this.totalAcompValue = total.toString();
  }

  private async totalConsignacion(): Promise<void> {
    let total: number = 0;
    this.datosConsignacion = (await this.service.obtenerAcumulacionPorEscolta()).data;
    for (let i = 0; i < this.datosConsignacion.length; i++) {
      total += this.datosConsignacion[i];
    }
    //Es el valor total que vemos en la tarjeta
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

}