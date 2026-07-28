import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../../pipes/translate';
import { VendorService } from '../../../services/vendor';
import { ToastService } from '../../../services/toast';
import { Vendor } from '../../../models/vendor';

@Component({
  selector: 'app-admin-vendors',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-vendors.html',
  styleUrl: './admin-vendors.css',
})
export class AdminVendors implements OnInit {
  private vendorService = inject(VendorService);
  private toast = inject(ToastService);

  vendors: Vendor[] = [];
  loading = true;

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.loading = true;
    this.vendorService.getVendors().subscribe({
      next: (v) => {
        this.vendors = v;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  approveVendor(id: number) {
    this.vendorService.approveVendor(id).subscribe({
      next: () => {
        this.toast.success('toast.vendorApproved');
        this.loadVendors();
      },
      error: () => this.toast.error('toast.vendorError'),
    });
  }

  rejectVendor(id: number) {
    this.vendorService.rejectVendor(id).subscribe({
      next: () => {
        this.toast.success('toast.vendorRejected');
        this.loadVendors();
      },
      error: () => this.toast.error('toast.vendorError'),
    });
  }
}
