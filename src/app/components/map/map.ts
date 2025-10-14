import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapService } from './service/mapService';


// Tipos explícitos
interface Coordenada {
  latitud: number;
  longitud: number;
}

interface MarcacionItem {
  coordenadas: Coordenada[];
}

interface MarcacionResponse {
  marcacion: Record<string, MarcacionItem>;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="flex">
      <!-- Panel de leyenda -->
      <div class="legend">
        <h3>Escoltas</h3>
        <ul>
          <li *ngFor="let escolta of legendData">
            <span
              class="color-box"
              [style.background]="escolta.color"
            ></span>
            {{ escolta.nombre }}
          </li>
        </ul>
      </div>

      <!-- Contenedor del mapa -->
      <div id="map" class="map"></div>
    </div>
  `,
  styles: [
    `
      .flex {
        display: flex;
      }

      .map {
        height: 500px;
        width: 100%;
      }

      .legend {
        width: 200px;
        background: #f8f9fa;
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        margin-right: 10px;
        font-family: sans-serif;
      }

      .legend h3 {
        margin-top: 0;
        font-size: 1.1rem;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }

      .legend ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .legend li {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .color-box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin-right: 8px;
      }
    `,
  ],
})

export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  legendData: { nombre: string; color: string }[] = [];


  constructor(private service: MapService) {}

  async ngAfterViewInit(): Promise<void> {
    this.map = L.map('map').setView([6.2442, -75.5812], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    await this.mostrarCoordenadasPorEscolta();
  }

  private async mostrarCoordenadasPorEscolta(): Promise<void> {
    const raw = await this.service.agruparCoordenadasPorEscolta('marcacion');

    const data = raw as MarcacionResponse;
    const marcacion = data.marcacion || {};

    const colores = ['red', 'blue', 'green', 'orange', 'purple', 'brown'];
    const escoltas = Object.keys(marcacion);

    this.legendData = []; // limpiar antes de volver a llenar

    escoltas.forEach((nombre, index) => {
      const color = colores[index % colores.length];
      const coordenadas: Coordenada[] = marcacion[nombre].coordenadas;

      // Agregamos a la leyenda
      this.legendData.push({ nombre, color });

      const group = L.layerGroup().addTo(this.map);

      coordenadas.forEach((coord: Coordenada) => {
        if (coord.latitud === 0 && coord.longitud === 0) return;

        L.circleMarker([coord.latitud, coord.longitud], {
          radius: 7,
          color,
          fillColor: color,
          fillOpacity: 0.8,
        })
          .addTo(group)
          .bindPopup(
            `<b>Escolta:</b> ${nombre}<br>Lat: ${coord.latitud}<br>Lng: ${coord.longitud}`
          );
      });
    });
  }
}