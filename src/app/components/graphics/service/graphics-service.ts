import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {
  constructor() { }

  saludar(): string {
    return `Hola,  desde el servicio!`;
  }
}
