import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div #mapContainer class="map"></div>`,
  styles: [`
    .map {
      height: 500px;
      width: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-74.072, 4.711], // Bogotá
      zoom: 6
    });

    new maplibregl.Marker().setLngLat([-74.072, 4.711]).setPopup(
      new maplibregl.Popup().setText("Bogotá")
    ).addTo(map);
  }
}
