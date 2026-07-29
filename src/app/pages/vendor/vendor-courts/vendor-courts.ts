import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../../services/court';
import { AuthService } from '../../../services/auth';
import { Court } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';


@Component({
  selector: 'app-vendor-courts',
  imports: [RouterLink, FormsModule, TranslatePipe],
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
  activeFilters = { sport_type: '', surface: '', is_active: '' };

  ngOnInit() {
    this.loadCourts();
  }

  loadCourts() {
    this.loading = true;
    const filters: Record<string, string | boolean | undefined> = {};
    if (this.activeFilters['sport_type']) filters['sport_type'] = this.activeFilters['sport_type'];
    if (this.activeFilters['surface']) filters['surface'] = this.activeFilters['surface'];
    if (this.activeFilters['is_active'] !== '') {
      filters['is_active'] = this.activeFilters['is_active'] === 'true';
    }
    this.courtService.getCourts(filters).subscribe({
      next: (courts) => {
        this.courts = courts;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  clearFilters() {
    this.activeFilters['sport_type'] = '';
    this.activeFilters['surface'] = '';
    this.activeFilters['is_active'] = '';
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
