import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../../services/field';
import { FieldScheduleService } from '../../../services/field-schedule';
import { Field, FieldSchedule } from '../../../models/field';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-schedules',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-schedules.html',
  styleUrl: './admin-schedules.css',
})
export class AdminSchedules implements OnInit {
  private fieldService = inject(FieldService);
  private scheduleService = inject(FieldScheduleService);

  fields: Field[] = [];
  selectedFieldId: number | null = null;
  schedules: FieldSchedule[] = [];
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
    this.fieldService.getFields().subscribe({
      next: (f) => (this.fields = f),
    });
  }

  onFieldChange() {
    if (!this.selectedFieldId) {
      this.schedules = [];
      return;
    }
    this.loading = true;
    this.scheduleService.getSchedules(this.selectedFieldId).subscribe({
      next: (s) => {
        this.schedules = s;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getScheduleForDay(day: number): FieldSchedule | undefined {
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
    if (!this.selectedFieldId) return;
    const newSchedule: Partial<FieldSchedule> = {
      field: this.selectedFieldId,
      day_of_week: day,
      open_time: '08:00',
      close_time: '22:00',
      is_active: true,
    };
    this.scheduleService.createSchedule(newSchedule).subscribe({
      next: (s) => {
        this.schedules.push(s);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error creating schedule';
      },
    });
  }

  saveSchedule(schedule: FieldSchedule) {
    this.saving = true;
    this.scheduleService.updateSchedule(schedule.id, schedule).subscribe({
      next: () => (this.saving = false),
      error: (err) => {
        this.saving = false;
        this.error = err.error?.detail || 'Error saving schedule';
      },
    });
  }

  deleteSchedule(id: number) {
    this.scheduleService.deleteSchedule(id).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s.id !== id);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error deleting schedule';
      },
    });
  }
}
