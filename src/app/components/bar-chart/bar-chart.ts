import { Component } from '@angular/core';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [
    // 👇 Aquí se pasa como parte de los "registerables"
    provideCharts(withDefaultRegisterables([ChartDataLabels]))
  ],
  templateUrl: './bar-chart.html',
  styleUrls: ['./bar-chart.css']
})
export class BarChartComponent {
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  };

  barChartType: ChartType = 'bar';
  barChartLegend = true;

  barChartData: ChartConfiguration['data'] = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      { data: [65, 59, 80, 81, 56], label: 'Ventas 2025' },
      { data: [28, 48, 40, 19, 86], label: 'Gastos 2025' }
    ]
  };
}
