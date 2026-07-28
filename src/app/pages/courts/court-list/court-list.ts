import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService, CourtFilters } from '../../../services/court';
import { AuthService } from '../../../services/auth';
import { Court, SportType, SurfaceType } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-court-list',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './court-list.html',
  styleUrl: './court-list.css',
})
export class CourtList implements OnInit {
  private courtService = inject(CourtService);
  public authService = inject(AuthService);

  courts: Court[] = [];
  loading = true;
  filters: CourtFilters = {};
  totalCount = 0;

  activeFaqIndex: number | null = null;

  sportTypes: { value: SportType; label: string }[] = [
    { value: 'FOOTBALL', label: 'Fútbol' },
    { value: 'PADEL', label: 'Pádel' },
    { value: 'TENNIS', label: 'Tenis' },
    { value: 'BASKETBALL', label: 'Básquet' },
    { value: 'VOLLEYBALL', label: 'Vóley' },
    { value: 'HOCKEY', label: 'Hockey' },
  ];

  surfaces: { value: string; label: string }[] = [
    { value: 'SYNTHETIC', label: 'Sintético' },
    { value: 'NATURAL', label: 'Natural' },
    { value: 'INDOOR', label: 'Indoor' },
    { value: 'CLAY', label: 'Polvo de ladrillo' },
    { value: 'GRASS', label: 'Césped' },
    { value: 'HARD', label: 'Dura' },
    { value: 'WOOD', label: 'Madera' },
    { value: 'SAND', label: 'Arena' },
  ];

  ngOnInit() {
    this.loadCourts();
  }

  loadCourts() {
    this.loading = true;
    this.courtService.getCourts(this.filters).subscribe({
      next: (courts: Court[]) => {
        this.courts = courts;
        this.totalCount = courts.length;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  applyFilters() {
    this.loadCourts();
    this.scrollToCatalog();
  }

  clearFilters() {
    this.filters = {};
    this.loadCourts();
  }

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  getSportName(sport: string): string {
    const map: Record<string, string> = {
      FOOTBALL: 'Fútbol', PADEL: 'Pádel', TENNIS: 'Tenis',
      BASKETBALL: 'Básquet', VOLLEYBALL: 'Vóley', HOCKEY: 'Hockey',
    };
    return map[sport] || sport;
  }

  getSportEmoji(sport: string): string {
    const map: Record<string, string> = {
      FOOTBALL: '⚽', PADEL: '🎾', TENNIS: '🎾',
      BASKETBALL: '🏀', VOLLEYBALL: '🏐', HOCKEY: '🏑',
    };
    return map[sport] || '⚽';
  }

  getSurfaceName(surface: string): string {
    const map: Record<string, string> = {
      SYNTHETIC: 'Sintético', NATURAL: 'Natural', INDOOR: 'Indoor',
      CLAY: 'Polvo de ladrillo', GRASS: 'Césped', HARD: 'Dura',
      WOOD: 'Madera', SAND: 'Arena',
    };
    return map[surface] || surface;
  }

  scrollToCatalog() {
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
