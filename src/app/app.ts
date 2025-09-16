import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Graphics } from './components/graphics/graphics';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mac-indicadores');
}
