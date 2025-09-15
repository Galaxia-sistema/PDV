import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Graphics } from './components/graphics/graphics';
import { BarChartComponent } from './components/bar-chart/bar-chart';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, Graphics,BarChartComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mac-indicadores');
}
