import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { CourtService, TimeSlot, CourtAvailability } from '../../../services/court';
import { Court, SportType, SurfaceType } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-court-detail',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './court-detail.html',
  styleUrl: './court-detail.css',
})
export class CourtDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private meta = inject(Meta);
  private title = inject(Title);

  court: Court | null = null;
  loading = true;
  selectedDate: string = '';
  availability: CourtAvailability | null = null;
  loadingSlots = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courtService.getCourtById(id).subscribe({
      next: (court: Court) => {
        this.court = court;
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
        this.loading = false;
        this.loadAvailability();
      },
      error: () => (this.loading = false),
    });

    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
  }

  loadAvailability() {
    if (!this.court) return;
    this.loadingSlots = true;
    this.courtService.getCourtAvailability(this.court.id, this.selectedDate).subscribe({
      next: (data: CourtAvailability) => {
        this.availability = data;
        this.loadingSlots = false;
      },
      error: () => (this.loadingSlots = false),
    });
  }

  onDateChange() {
    this.loadAvailability();
  }

  bookSlot(slot: TimeSlot) {
    if (!this.court || slot.status !== 'available') return;
    this.router.navigate(['/courts', this.court.id, 'book'], {
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
