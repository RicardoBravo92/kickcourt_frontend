import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate';
import { VendorService } from '../../../services/vendor';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [RouterLink, TranslatePipe, DecimalPipe],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
})
export class VendorDashboard implements OnInit {
  private vendorService = inject(VendorService);

  stats: any = null;
  loading = true;

  ngOnInit() {
    this.vendorService.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
