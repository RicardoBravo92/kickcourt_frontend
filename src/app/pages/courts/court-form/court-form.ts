import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../../services/court';
import { ToastService } from '../../../services/toast';
import { Court, SportType, SurfaceType } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-court-form',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './court-form.html',
  styleUrl: './court-form.css',
})
export class CourtForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private toast = inject(ToastService);

  court: Partial<Court> = {
    name: '',
    sport_type: 'FOOTBALL',
    surface: 'SYNTHETIC',
    players_per_side: 5,
    price_per_hour: 0,
    is_active: true,
    description: '',
  };
  isEdit = false;
  courtId = 0;
  error = '';
  loading = false;

  sportTypes: { value: SportType; label: string }[] = [
    { value: 'FOOTBALL', label: 'Fútbol' },
    { value: 'PADEL', label: 'Pádel' },
    { value: 'TENNIS', label: 'Tenis' },
    { value: 'BASKETBALL', label: 'Básquet' },
    { value: 'VOLLEYBALL', label: 'Vóley' },
    { value: 'HOCKEY', label: 'Hockey' },
  ];

  playerOptions: { value: number; label: string }[] = [
    { value: 1, label: '1 vs 1' },
    { value: 2, label: '2 vs 2' },
    { value: 4, label: '4 vs 4' },
    { value: 5, label: '5 vs 5' },
    { value: 6, label: '6 vs 6' },
    { value: 7, label: '7 vs 7' },
    { value: 11, label: '11 vs 11' },
  ];

  surfaces: { value: SurfaceType; label: string; sports: SportType[] }[] = [
    { value: 'SYNTHETIC', label: 'Sintético', sports: ['FOOTBALL', 'PADEL', 'HOCKEY'] },
    { value: 'NATURAL', label: 'Natural', sports: ['FOOTBALL', 'HOCKEY'] },
    { value: 'INDOOR', label: 'Indoor', sports: ['FOOTBALL', 'PADEL', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL', 'HOCKEY'] },
    { value: 'CLAY', label: 'Polvo de ladrillo', sports: ['TENNIS'] },
    { value: 'GRASS', label: 'Césped', sports: ['TENNIS', 'HOCKEY'] },
    { value: 'HARD', label: 'Dura', sports: ['TENNIS', 'BASKETBALL', 'VOLLEYBALL'] },
    { value: 'WOOD', label: 'Madera', sports: ['BASKETBALL'] },
    { value: 'SAND', label: 'Arena', sports: ['VOLLEYBALL'] },
  ];

  ngOnInit() {
    this.courtId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.courtId) {
      this.isEdit = true;
      this.courtService.getCourtById(this.courtId).subscribe({
        next: (c: Court) => (this.court = c),
        error: () => {
          const returnPath = this.route.snapshot.url[0]?.path === 'vendor' ? '/vendor/courts' : '/admin';
          this.router.navigate([returnPath]);
        },
      });
    }
  }

  get filteredSurfaces() {
    return this.surfaces.filter(s => s.sports.includes(this.court.sport_type as SportType));
  }

  get availablePlayers() {
    const options: Record<SportType, number[]> = {
      FOOTBALL: [5, 7, 11],
      PADEL: [2, 4],
      TENNIS: [1, 2],
      BASKETBALL: [5],
      VOLLEYBALL: [6],
      HOCKEY: [5, 6, 11],
    };
    const valid = options[this.court.sport_type as SportType] || [5];
    const surfaceSport = this.filteredSurfaces.find(s => s.value === this.court.surface);
    if (!surfaceSport) {
      this.court.surface = this.filteredSurfaces[0]?.value || 'SYNTHETIC';
    }
    return this.playerOptions.filter(p => valid.includes(p.value));
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const obs = this.isEdit
      ? this.courtService.updateCourt(this.courtId, this.court)
      : this.courtService.createCourt(this.court);

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'toast.courtUpdated' : 'toast.courtCreated');
        const returnPath = this.route.snapshot.url[0]?.path === 'vendor' ? '/vendor/courts' : '/admin';
        this.router.navigate([returnPath]);
      },
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
        this.toast.error('toast.courtError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.error = Object.values(errors).flat().join(' ');
        } else {
          this.error = 'courts.saveError';
        }
      },
    });
  }
}
