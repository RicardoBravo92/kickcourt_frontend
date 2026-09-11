import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CourtService, TimeSlot, CourtAvailability } from '../../../services/court';
import { todayLocalISO } from '../../../services/dates';
import { Court, SportType, SurfaceType } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-court-detail',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './court-detail.html',
  styleUrl: './court-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private title = inject(Title);

  court = signal<Court | null>(null);
  loading = signal(true);
  selectedDate: string = '';
  availability = signal<CourtAvailability | null>(null);
  loadingSlots = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.selectedDate = todayLocalISO();
    this.courtService.getCourtById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (court: Court) => {
        this.court.set(court);
        this.title.setTitle(`${court.name} - KickCourt`);
        this.meta.updateTag({ name: 'description', content: court.description || `Book ${court.name} - ${this.getSportName(court.sport_type)} court on ${this.getSurfaceName(court.surface)}` });
        this.meta.updateTag({ property: 'og:title', content: court.name });
        this.meta.updateTag({ property: 'og:description', content: court.description || `Book ${court.name} - ${this.getSportName(court.sport_type)} court on ${this.getSurfaceName(court.surface)}` });
        this.meta.updateTag({ property: 'og:image', content: court.photo || 'https://kickcourt.com/assets/img/og-default.png' });
        this.meta.updateTag({ property: 'og:url', content: `https://kickcourt.com/courts/${court.id}` });
        this.meta.updateTag({ property: 'og:type', content: 'article' });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: court.name });
        this.meta.updateTag({ name: 'twitter:description', content: court.description || `Book ${court.name} - ${this.getSportName(court.sport_type)} court on ${this.getSurfaceName(court.surface)}` });
        this.loading.set(false);
        this.loadAvailability();
      },
      error: () => this.loading.set(false),
    });
  }

  loadAvailability() {
    const court = this.court();
    if (!court) return;
    this.loadingSlots.set(true);
    this.courtService.getCourtAvailability(court.id, this.selectedDate).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: CourtAvailability) => {
        this.availability.set(data);
        this.loadingSlots.set(false);
      },
      error: () => this.loadingSlots.set(false),
    });
  }

  onDateChange() {
    this.loadAvailability();
  }

  bookSlot(slot: TimeSlot) {
    const court = this.court();
    if (!court || slot.status !== 'available') return;
    this.router.navigate(['/courts', court.id, 'book'], {
      queryParams: { date: this.selectedDate, start: slot.time, end: slot.end_time },
    });
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
}