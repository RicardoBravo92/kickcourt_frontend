import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../../services/court';
import { CourtScheduleService } from '../../../services/court-schedule';
import { ToastService } from '../../../services/toast';
import { Court, CourtSchedule } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-schedules',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-schedules.html',
  styleUrl: './admin-schedules.css',
})
export class AdminSchedules implements OnInit {
  private courtService = inject(CourtService);
  private scheduleService = inject(CourtScheduleService);
  private toast = inject(ToastService);

  courts: Court[] = [];
  selectedCourtId: number | null = null;
  schedules: CourtSchedule[] = [];
  loading = false;
  saving = false;
  error = '';

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
    this.courtService.getCourts().subscribe({
      next: (c) => (this.courts = c),
    });
  }

  onCourtChange() {
    if (!this.selectedCourtId) {
      this.schedules = [];
      return;
    }
    this.loading = true;
    this.scheduleService.getSchedules(this.selectedCourtId).subscribe({
      next: (s) => {
        this.schedules = s;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getScheduleForDay(day: number): CourtSchedule | undefined {
    return this.schedules.find(s => s.day_of_week === day);
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
    this.scheduleService.createSchedule(newSchedule).subscribe({
      next: (s) => {
        this.schedules.push(s);
        this.toast.success('toast.scheduleCreated');
      },
      error: () => {
        this.error = 'Error creating schedule';
        this.toast.error('toast.scheduleError');
      },
    });
  }

  saveSchedule(schedule: CourtSchedule) {
    this.saving = true;
    this.scheduleService.updateSchedule(schedule.id, schedule).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('toast.scheduleUpdated');
      },
      error: () => {
        this.saving = false;
        this.error = 'Error saving schedule';
        this.toast.error('toast.scheduleError');
      },
    });
  }

  deleteSchedule(id: number) {
    this.scheduleService.deleteSchedule(id).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.toast.success('toast.scheduleDeleted');
      },
      error: () => {
        this.error = 'Error deleting schedule';
        this.toast.error('toast.scheduleError');
      },
    });
  }
}
