import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
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
  @Input() data: number[] = []; 
  @Input() labels: string[] = []; 
  @Input() datasets?: ChartConfiguration['data']['datasets']; 
  @Input() height: string = '400px';
  @Input() placa: boolean = false; 
  @Input() escolta: boolean = true; 
  @Input() filter: string = '';    
  @Input() showDecimals: boolean = false;
  @Input() formartterDiner: boolean = false;
  
  @Output() filterChange = new EventEmitter<string>();

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  searchText: string = '';

  barChartType: ChartType = 'bar';
  barChartLegend = true;

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      },
      datalabels: {
        formatter: (value: any) => this.formatValue(Number(value)), 
        offset: 4,
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: { 
          weight: 'bold',
          size: 12
        }
      }
    },
    scales: {
      x: { 
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 0,
          
        }
      },
      y: { ticks: { autoSkip: false ,                

      } }
    }
  }



  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

 

  ngOnChanges(changes: SimpleChanges): void {
    // si el padre actualiza filter, sincronizamos el input local
    if (changes['filter'] && changes['filter'].currentValue !== undefined) {
      this.searchText = changes['filter'].currentValue ?? '';
    }
    // recomponer gráfico
    this.updateChartData();
  }

  // cuando el usuario escribe en el input del hijo...
  onSearchChange(): void {
    // actualizamos el filter local y notificamos al padre
    this.filter = this.searchText;
    this.filterChange.emit(this.searchText);
    // actualizamos inmediatamente para dar feedback instantáneo
    this.updateChartData();
  }

 // fallback data
  private defaultLabels = ['Soldado 1', 'Soldado 2', 'Soldado 3', 'Soldado 4', 'Soldado 5'];
  private defaultDatasets3: ChartConfiguration['data']['datasets'] = [
    { data: [65, 59, 80, 81, 56], label: 'Empalmes' },
    { data: [28, 48, 40, 19, 86], label: 'Puntos de venta' },
    { data: [2, 48, 40, 19, 86], label: 'Acompañamientos' }
  ];
  private defaultDataset1: ChartConfiguration['data']['datasets'] = [
    { data: [28, 48, 40, 19, 86], label: 'Consignación' }
  ];

  private updateChartData(): void {
    // aplicar orientación
    this.barChartOptions = { ...this.barChartOptions, indexAxis: this.orientation };

    // labels base (si no vienen, usar fallback)
    const baseLabels = (this.labels && this.labels.length) ? this.labels : this.defaultLabels;

    // calcular índices que coinciden con el filtro actual (filter)
    const search = (this.filter ?? '').toString().trim().toLowerCase();
    let indices: number[] = [];
    if (search) {
      indices = baseLabels
        .map((lab, i) => ({ lab: String(lab || ''), i }))
        .filter(x => x.lab.toLowerCase().includes(search))
        .map(x => x.i);
    } else {
      indices = baseLabels.map((_, i) => i);
    }

    // crear labels filtradas
    const labelsFiltered = indices.map(i => baseLabels[i]);

    let finalDatasets: ChartConfiguration['data']['datasets'] = [];

    if (this.datasets && this.datasets.length) {
      finalDatasets = this.datasets.map(ds => {
        const dsData = (ds.data as number[]) ?? [];
        const filtered = indices.map(i => dsData[i] ?? 0);
        return { ...ds, data: filtered };
      });
    } else if (this.data && this.data.length) {
      const filtered = indices.map(i => this.data[i] ?? 0);
      finalDatasets = [{ data: filtered, label: this.title || 'Datos'}];
    } else {
      // fallback según value
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
    
    this.barChartData = {
      labels: labelsFiltered,
      datasets: finalDatasets
    };

    setTimeout(() => this.chart?.update(), 0);
  }

  private formatValue(value: number): string {
    if (this.formartterDiner) {
      // formato moneda (redondeado sin decimales)
      return Number(value).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    }

    if (this.showDecimals) {
      // con decimales (2 cifras)
      return Number(value).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // redondeado sin decimales
    return Math.round(Number(value)).toLocaleString('es-CO');
  }

}


