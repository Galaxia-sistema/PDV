import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  urlActual: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.urlActual = this.router.url;
    });
  }

  irAlMapa() {
    this.router.navigate(['/map']);
  }

  irAlDashBoard() {
    this.router.navigate(['/dashboard']);
  }
}
