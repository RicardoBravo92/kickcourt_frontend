import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CourtService } from '../../../services/court';
import { CourtScheduleService } from '../../../services/court-schedule';
import { ToastService } from '../../../services/toast';
import { Court, CourtSchedule } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-vendor-schedules',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './vendor-schedules.html',
  styleUrl: './vendor-schedules.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorSchedules implements OnInit {
  private courtService = inject(CourtService);
  private scheduleService = inject(CourtScheduleService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  courts = signal<Court[]>([]);
  selectedCourtId: number | null = null;
  schedules = signal<CourtSchedule[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  daysOfWeek = [
    { value: 0, label: 'schedules.monday' },
    { value: 1, label: 'schedules.tuesday' },
    { value: 2, label: 'schedules.wednesday' },
    { value: 3, label: 'schedules.thursday' },
    { value: 4, label: 'schedules.friday' },
    { value: 5, label: 'schedules.saturday' },
    { value: 6, label: 'schedules.sunday' },
  ];

  ngOnInit() {
    this.courtService.getCourts({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (c) => this.courts.set(c),
    });
  }

  onCourtChange() {
    if (!this.selectedCourtId) {
      this.schedules.set([]);
      return;
    }
    this.loading.set(true);
    this.scheduleService.getSchedules(this.selectedCourtId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (s) => {
        this.schedules.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getScheduleForDay(day: number): CourtSchedule | undefined {
    return this.schedules().find(s => s.day_of_week === day);
  }

  updateScheduleTime(day: number, field: string, value: string) {
    const schedule = this.getScheduleForDay(day);
    if (schedule) {
      (schedule as any)[field] = value;
    }
  }

  updateScheduleActive(day: number, active: boolean) {
    const schedule = this.getScheduleForDay(day);
    if (schedule) {
      schedule.is_active = active;
    }
  }

  addSchedule(day: number) {
    if (!this.selectedCourtId) return;
    const newSchedule: Partial<CourtSchedule> = {
      court: this.selectedCourtId,
      day_of_week: day,
      open_time: '08:00',
      close_time: '22:00',
      is_active: true,
    };
    this.scheduleService.createSchedule(newSchedule).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (s) => {
        this.schedules.update(list => [...list, s]);
        this.toast.success('toast.scheduleCreated');
      },
      error: () => {
        this.error.set('Error creating schedule');
        this.toast.error('toast.scheduleError');
      },
    });
  }

  saveSchedule(schedule: CourtSchedule) {
    this.saving.set(true);
    this.scheduleService.updateSchedule(schedule.id, schedule).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('toast.scheduleUpdated');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Error saving schedule');
        this.toast.error('toast.scheduleError');
      },
    });
  }

  deleteSchedule(id: number) {
    this.scheduleService.deleteSchedule(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.schedules.update(list => list.filter(s => s.id !== id));
        this.toast.success('toast.scheduleDeleted');
      },
      error: () => {
        this.error.set('Error deleting schedule');
        this.toast.error('toast.scheduleError');
      },
    });
  }
}