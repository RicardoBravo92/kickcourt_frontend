import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate';
import { VendorService } from '../../../services/vendor';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [RouterLink, TranslatePipe, DecimalPipe],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorDashboard implements OnInit {
  private vendorService = inject(VendorService);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private title = inject(Title);

  stats = signal<any | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.title.setTitle('Vendor Dashboard - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Manage your soccer courts, view bookings and analytics from the vendor dashboard.' });
    this.meta.updateTag({ property: 'og:title', content: 'Vendor Dashboard - KickCourt' });
    this.meta.updateTag({ property: 'og:description', content: 'Manage your soccer courts, view bookings and analytics from the vendor dashboard.' });
    this.meta.updateTag({ property: 'og:url', content: 'https://kickcourt.com/dashboard' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Vendor Dashboard - KickCourt' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Manage your soccer courts, view bookings and analytics from the vendor dashboard.' });
    this.vendorService.getDashboard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}