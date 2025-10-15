import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapService } from './service/mapService';


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
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})

export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  legendData: { nombre: string; color: string }[] = [];


  constructor(private service: MapService) {}

  async ngAfterViewInit(): Promise<void> {
    this.map = L.map('map').setView([6.2442, -75.5812], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    await this.mostrarCoordenadasPorEscolta();
  }

  private async mostrarCoordenadasPorEscolta(): Promise<void> {
    const raw = await this.service.agruparCoordenadasPorEscolta('marcacion');

    const data = raw as MarcacionResponse;
    const marcacion = data.marcacion || {};

    const colores = ['red', 'blue', 'green', 'orange'];
    const escoltas = Object.keys(marcacion);

    this.legendData = [];

    escoltas.forEach((nombre, index) => {
      const color = colores[index % colores.length];
      const coordenadas: Coordenada[] = marcacion[nombre].coordenadas;

      
      this.legendData.push({ nombre, color });

      const group = L.layerGroup().addTo(this.map);

      coordenadas.forEach((coord: Coordenada) => {
        if (coord.latitud === 0 && coord.longitud === 0) return;

        L.circleMarker([coord.latitud, coord.longitud], {
          radius: 4,
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