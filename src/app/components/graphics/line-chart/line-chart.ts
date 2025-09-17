import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.html',
  styleUrls: ['./line-chart.css'],
  standalone: true,
  imports: [BaseChartDirective],
})
export class LineChartComponent {
  // Datos con 2 series
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Ventas 2024',
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.3)',
        fill: 'origin',
      },
      {
        data: [28, 48, 40, 19, 86, 27, 90],
        label: 'Ventas 2025',
        borderColor: 'green',
        backgroundColor: 'rgba(0,255,0,0.3)',
        fill: 'origin',
      },
    ],
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
  };

  // Opciones del gráfico
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: { tension: 0.4 }, // suaviza las líneas
    },
    plugins: {
      legend: { display: true, position: 'top' },
    },
  };

  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
}
