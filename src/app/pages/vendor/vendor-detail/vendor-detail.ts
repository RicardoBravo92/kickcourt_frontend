import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VendorService } from '../../../services/vendor';
import { CourtService } from '../../../services/court';
import { Vendor } from '../../../models/vendor';
import { Court } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-vendor-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './vendor-detail.html',
  styleUrl: './vendor-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private vendorService = inject(VendorService);
  private courtService = inject(CourtService);
  private meta = inject(Meta);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  vendor = signal<Vendor | null>(null);
  courts = signal<Court[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vendorService.getVendor(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v) => {
        this.vendor.set(v);
        this.title.setTitle(`${v.business_name} - KickCourt`);
        this.meta.updateTag({ name: 'description', content: v.description || `${v.business_name} - Soccer court vendor` });
        this.meta.updateTag({ property: 'og:title', content: v.business_name });
        this.meta.updateTag({ property: 'og:description', content: v.description || `${v.business_name} - Soccer court vendor` });
        this.meta.updateTag({ property: 'og:image', content: 'https://kickcourt.com/assets/img/og-default.png' });
        this.meta.updateTag({ property: 'og:url', content: `https://kickcourt.com/dashboard/vendors/${v.id}` });
        this.meta.updateTag({ property: 'og:type', content: 'profile' });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: v.business_name });
        this.meta.updateTag({ name: 'twitter:description', content: v.description || `${v.business_name} - Soccer court vendor` });
        this.loadCourts();
      },
      error: () => this.loading.set(false),
    });
  }

  loadCourts() {
    this.courtService.getCourts({ vendor: this.vendor()?.id || 0 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (courts) => {
        this.courts.set(courts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getSportName(sport: string): string {
    const map: Record<string, string> = {
      FOOTBALL: 'Fútbol', PADEL: 'Pádel', TENNIS: 'Tenis',
      BASKETBALL: 'Básquet', VOLLEYBALL: 'Vóley', HOCKEY: 'Hockey',
    };
    return map[sport] || sport;
  }

  getSurfaceName(surface: string): string {
    const map: Record<string, string> = {
      SYNTHETIC: 'Sintético', NATURAL: 'Natural', INDOOR: 'Indoor',
      CLAY: 'Polvo de ladrillo', GRASS: 'Césped', HARD: 'Dura',
      WOOD: 'Madera', SAND: 'Arena',
    };
    return map[surface] || surface;
  }
}