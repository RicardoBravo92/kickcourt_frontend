import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CourtService, CourtFilters } from '../../../services/court';
import { AuthService } from '../../../services/auth';
import { Court, SportType, SurfaceType } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-court-list',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './court-list.html',
  styleUrl: './court-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtList implements OnInit {
  private courtService = inject(CourtService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  courts = signal<Court[]>([]);
  loading = signal(true);
  filters: CourtFilters = {};
  totalCount = signal(0);

  activeFaqIndex = signal<number | null>(null);

  user = this.authService.currentUser;
  isLoggedIn = computed(() => this.user() !== null);

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
    this.loading.set(true);
    this.courtService.getCourts(this.filters).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (courts: Court[]) => {
        this.courts.set(courts);
        this.totalCount.set(courts.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    this.activeFaqIndex.set(this.activeFaqIndex() === index ? null : index);
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