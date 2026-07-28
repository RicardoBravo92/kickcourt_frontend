import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate';
import { DashboardService, DashboardStats } from '../../../services/dashboard';
import { FieldService } from '../../../services/field';
import { ToastService } from '../../../services/toast';
import { Field } from '../../../models/field';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TranslatePipe, DecimalPipe, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, AfterViewInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private fieldService = inject(FieldService);
  private toast = inject(ToastService);

  stats: DashboardStats | null = null;
  fields: Field[] = [];
  loading = true;
  exportDateFrom = '';
  exportDateTo = '';
  exportStatus = '';

  bookingsChartRef = viewChild<ElementRef>('bookingsChart');
  statusChartRef = viewChild<ElementRef>('statusChart');
  hourChartRef = viewChild<ElementRef>('hourChart');
  fieldsChartRef = viewChild<ElementRef>('fieldsChart');

  private charts: Chart[] = [];

  statusOptions = [
    { value: '', label: 'dashboard.allStatuses' },
    { value: 'PENDING', label: 'dashboard.pending' },
    { value: 'CONFIRMED', label: 'dashboard.confirmed' },
    { value: 'CANCELLED', label: 'dashboard.cancelled' },
    { value: 'COMPLETED', label: 'dashboard.completed' },
  ];

  ngOnInit() {
    this.fieldService.getFields().subscribe({
      next: (f) => (this.fields = f),
    });
  }

  ngAfterViewInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => (this.loading = false),
    });
  }

  renderCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    if (!this.stats) return;

    this.renderBookingsByDayChart();
    this.renderStatusChart();
    this.renderHourChart();
    this.renderTopFieldsChart();
  }

  renderBookingsByDayChart() {
    const el = this.bookingsChartRef();
    if (!el) return;
    const data = this.stats!.bookings_by_day;
    const labels = Object.keys(data).reverse();
    const values = Object.values(data).reverse();

    this.charts.push(new Chart(el.nativeElement, {
      type: 'line',
      data: {
        labels: labels.map(d => d.substring(5)),
        datasets: [{
          label: 'Bookings',
          data: values,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    }));
  }

  renderStatusChart() {
    const el = this.statusChartRef();
    if (!el) return;
    const data = this.stats!.bookings_by_status;
    const colorMap: Record<string, string> = {
      PENDING: '#facc15',
      CONFIRMED: '#22c55e',
      CANCELLED: '#ef4444',
      COMPLETED: '#6b7280',
    };

    this.charts.push(new Chart(el.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(k => colorMap[k] || '#9ca3af'),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    }));
  }

  renderHourChart() {
    const el = this.hourChartRef();
    if (!el) return;
    const data = this.stats!.bookings_by_hour;
    const labels = Object.keys(data);
    const values = Object.values(data);

    this.charts.push(new Chart(el.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Bookings',
          data: values,
          backgroundColor: '#3b82f6',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    }));
  }

  renderTopFieldsChart() {
    const el = this.fieldsChartRef();
    if (!el) return;
    const data = this.stats!.top_fields;

    this.charts.push(new Chart(el.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(f => f.field__name),
        datasets: [{
          label: 'Bookings',
          data: data.map(f => f.booking_count),
          backgroundColor: '#8b5cf6',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    }));
  }

  exportCsv() {
    const url = this.dashboardService.exportCsv({
      status: this.exportStatus,
      date_from: this.exportDateFrom,
      date_to: this.exportDateTo,
    });
    window.open(url, '_blank');
    this.toast.success('toast.csvExported');
  }

  getStatusCount(status: string): number {
    return this.stats?.bookings_by_status?.[status] || 0;
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }
}
