import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarChartComponent } from './bar-chart/bar-chart';
import { PieChartComponent } from './pie-chart/pie-chart';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [RouterOutlet, BarChartComponent,PieChartComponent, FormsModule],
  templateUrl: './graphics.html',
  styleUrls: ['./graphics.css']
})
export class Graphics {
  labels = ['Placa1', 'Placa2', 'Placa3', 'Placa4'];    
  placaSeleccionada: string = '';

 

  labelGeneral = ['Soldado 1','Soldado 2','Soldado 3','Soldado 4','Soldado 5'];  
  datosVentas = [30, 40, 30,90, 64];
  datosUsuarios = [50, 20, 30];  
  datosPlacas = [65, 59, 80, 81, 56,65, 59, 80, 81, 56,65, 59, 80, 81, 56,65];
  labelsPlacas = ['HUQ 52F','HUB 53F','HUC 54F','HUD 55F','HUE 56F','HUF 57F','HUG 58F','HUH 59F','HUI 60F','HUJ 61F','HUQ 61F','HUB 62F','HUC 63F','HUD 64F','HUE 65F','HUF 66F'];

 
  placaBusqueda: string = '';

  get datosFiltrados() {
    if (!this.placaBusqueda) return this.datosPlacas;
    const index = this.labels.findIndex(l => l.toLowerCase().includes(this.placaBusqueda.toLowerCase()));
    return index >= 0 ? [this.datosPlacas[index]] : [];
  }

  get labelsFiltrados() {
    if (!this.placaBusqueda) return this.labels;
    const match = this.labels.find(l => l.toLowerCase().includes(this.placaBusqueda.toLowerCase()));
    return match ? [match] : [];
  }
}