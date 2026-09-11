import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate';
import { VendorService } from '../../../services/vendor';
import { ToastService } from '../../../services/toast';
import { Vendor } from '../../../models/vendor';

@Component({
  selector: 'app-admin-vendors',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-vendors.html',
  styleUrl: './admin-vendors.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminVendors implements OnInit {
  private vendorService = inject(VendorService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  vendors = signal<Vendor[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.loading.set(true);
    this.vendorService.getVendors().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v) => {
        this.vendors.set(v);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  approveVendor(id: number) {
    this.vendorService.approveVendor(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.vendorApproved');
        this.loadVendors();
      },
      error: () => this.toast.error('toast.vendorError'),
    });
  }

  rejectVendor(id: number) {
    this.vendorService.rejectVendor(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.vendorRejected');
        this.loadVendors();
      },
      error: () => this.toast.error('toast.vendorError'),
    });
  }
}