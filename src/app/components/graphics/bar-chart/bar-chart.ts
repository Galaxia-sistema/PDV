import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [
    provideCharts(withDefaultRegisterables([ChartDataLabels]))
  ],
  templateUrl: './bar-chart.html',
  styleUrls: ['./bar-chart.css']
})
export class BarChartComponent implements OnChanges {
  @Input() value: boolean = true;
  @Input() orientation: 'x' | 'y' = 'x';
  @Input() title: string = '';
  @Input() data: number[] = []; // única serie (opcional)
  @Input() labels: string[] = [];
  @Input() datasets?: ChartConfiguration['data']['datasets']; // pasar varias series si se desea
  @Input() height: string = '400px';
  @Input() filter: string = ''; // texto para filtrar etiquetas (live)

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  barChartType: ChartType = 'bar';
  barChartLegend = true;

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // importante

    indexAxis: 'x',
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: { anchor: 'end', align: 'end', color: '#000', font: { weight: 'bold', size: 12 } }
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } },
      y: { ticks: { autoSkip: false } }
    }
  };

  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  // datos por defecto (fallback)
  private defaultLabels = ['Soldado 1', 'Soldado 2', 'Soldado 3', 'Soldado 4', 'Soldado 5'];
  private defaultDatasets3: ChartConfiguration['data']['datasets'] = [
    { data: [65, 59, 80, 81, 56], label: 'Empalmes' },
    { data: [28, 48, 40, 19, 86], label: 'Puntos de venta' },
    { data: [2, 48, 40, 19, 86], label: 'Acompañamientos' }
  ];
  private defaultDataset1: ChartConfiguration['data']['datasets'] = [
    { data: [28, 48, 40, 19, 86], label: 'Consignación' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChartData();
  }

  private updateChartData(): void {
    // aplicar orientación
    this.barChartOptions = { ...this.barChartOptions, indexAxis: this.orientation };

    // labels base
    const baseLabels = (this.labels && this.labels.length) ? this.labels : this.defaultLabels;

    // indices que coinciden con el filter (si hay)
    let indices: number[] = [];
    if (this.filter && this.filter.trim()) {
      const s = this.filter.trim().toLowerCase();
      indices = baseLabels
        .map((lab, i) => ({ lab: String(lab || ''), i }))
        .filter(x => x.lab.toLowerCase().includes(s))
        .map(x => x.i);
    } else {
      indices = baseLabels.map((_, i) => i);
    }

    // labels filtradas (puede quedar vacío si no hay coincidencias)
    const labelsFiltered = indices.map(i => baseLabels[i]);

    // decidir datasets finales (prioridad: datasets prop > data (single) > fallback por value)
    let finalDatasets: ChartConfiguration['data']['datasets'] = [];

    if (this.datasets && this.datasets.length) {
      // filtrar cada dataset por los indices
      finalDatasets = this.datasets.map(ds => {
        const dsData = (ds.data as number[]) ?? [];
        const filtered = indices.map(i => dsData[i] ?? 0);
        return { ...ds, data: filtered };
      });
    } else if (this.data && this.data.length) {
      // single serie (filtrada)
      const filtered = indices.map(i => this.data[i] ?? 0);
      finalDatasets = [{ data: filtered, label: this.title || 'Datos' }];
    } else {
      // fallback por value
      if (this.value) {
        finalDatasets = this.defaultDatasets3.map(ds => ({
          ...ds,
          data: indices.map(i => ((ds.data as number[])[i] ?? 0))
        }));
      } else {
        finalDatasets = this.defaultDataset1.map(ds => ({
          ...ds,
          data: indices.map(i => ((ds.data as number[])[i] ?? 0))
        }));
      }
    }

    // asignar al chart
    this.barChartData = {
      labels: labelsFiltered,
      datasets: finalDatasets
    };

    // forzar update si existe la referencia
    setTimeout(() => this.chart?.update(), 0);
  }
}
