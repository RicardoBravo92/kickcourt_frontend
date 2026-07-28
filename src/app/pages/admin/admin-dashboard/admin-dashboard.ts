import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate';
import { DashboardService, DashboardStats } from '../../../services/dashboard';
import { CourtService } from '../../../services/court';
import { ToastService } from '../../../services/toast';
import { Court } from '../../../models/court';
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
  private courtService = inject(CourtService);
  private toast = inject(ToastService);

  stats: DashboardStats | null = null;
  courts: Court[] = [];
  loading = true;
  exportDateFrom = '';
  exportDateTo = '';
  exportStatus = '';

  bookingsChartRef = viewChild<ElementRef>('bookingsChart');
  statusChartRef = viewChild<ElementRef>('statusChart');

  private charts: Chart[] = [];

  statusOptions = [
    { value: '', label: 'dashboard.allStatuses' },
    { value: 'PENDING', label: 'dashboard.pending' },
    { value: 'CONFIRMED', label: 'dashboard.confirmed' },
    { value: 'CANCELLED', label: 'dashboard.cancelled' },
    { value: 'COMPLETED', label: 'dashboard.completed' },
  ];

  ngOnInit() {
    this.courtService.getCourts().subscribe({
      next: (c) => (this.courts = c),
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
    this.renderBookingsByMonthChart();
    this.renderStatusChart();
  }

  renderBookingsByMonthChart() {
    const el = this.bookingsChartRef();
    if (!el) return;
    const data = this.stats!.bookings_by_month;
    const labels = data.map(d => d.month);
    const values = data.map(d => d.count);

    this.charts.push(new Chart(el.nativeElement, {
      type: 'line',
      data: {
        labels,
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
    const data = this.stats!.booking_stats;
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
        plugins: { legend: { position: 'bottom' } },
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
    return this.stats?.booking_stats?.[status] || 0;
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }
}
