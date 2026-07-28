import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../../services/court';
import { AuthService } from '../../../services/auth';
import { Court } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';


@Component({
  selector: 'app-vendor-courts',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './vendor-courts.html',
  styleUrl: './vendor-courts.css',
})
export class VendorCourts implements OnInit {
  private courtService = inject(CourtService);
  public authService = inject(AuthService);

  courts: Court[] = [];
  loading = true;

  sportTypes = ['FOOTBALL', 'PADEL', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL', 'HOCKEY'];
  surfaces = ['SYNTHETIC', 'NATURAL', 'INDOOR', 'CLAY', 'GRASS', 'HARD', 'WOOD', 'SAND'];
  activeFilters: Record<string, string> = { sport_type: '', surface: '', is_active: '' };

  ngOnInit() {
    this.loadCourts();
  }

  loadCourts() {
    this.loading = true;
    this.courtService.getCourts(this.activeFilters).subscribe({
      next: (courts) => {
        this.courts = courts;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  clearFilters() {
    this.activeFilters = { sport_type: '', surface: '', is_active: '' };
    this.loadCourts();
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
