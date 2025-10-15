import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './pie-chart.html',
  styleUrls: ['./pie-chart.css']
})
export class PieChartComponent implements OnChanges, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = 'Pie Chart';

  pieChartType: ChartType = 'pie';
  
  chartPlugins = [ ChartDataLabels ];
  
  pieChartData: ChartConfiguration['data'] = {
    labels: this.labels && this.labels.length ? this.labels : ['A','B','C','D','E'],
    datasets: [
      {
        data: this.data.length ? this.data : [0,0,0,0,0],
        backgroundColor: [
          '#f8c99a',
          '#f8abbc',
          '#93caf0',
          '#bec4b3ff',
          '#e93e46ff'
        ],
        borderWidth: 1
      }
    ]
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
           
      datalabels: {
        color: '#fff',
        anchor: 'center',
        align: 'center',
        font: { weight: 600, size: 12 }, 
        formatter: (value, ctx) => {
          const data = ctx.chart.data.datasets?.[0].data as number[] || [];
          const sum = data.reduce((a,b) => a + (Number(b) || 0), 0);
          if (sum === 0) return '';          
          return `${value}` ;
        }
      }
    }
  };

  ngAfterViewInit(): void {    
    setTimeout(() => this.chart?.update(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['data'] || changes['labels']) {
    this.pieChartData = {
  labels: this.labels.length ? this.labels : ['Sin datos'],
  datasets: [
    {
      ...this.pieChartData.datasets[0],
      data: this.data.length ? this.data : [0]
    }
  ]
};

    setTimeout(() => this.chart?.update(), 0);
  }
}

}
