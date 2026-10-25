import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, CategoryScale, Filler, LineController, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

// Single-series line chart (no legend: the card title names the series)
@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `<div class="relative h-full w-full"><canvas #canvas [attr.aria-label]="label()" role="img"></canvas></div>`,
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  labels = input.required<string[]>();
  values = input.required<number[]>();
  label = input('');
  color = input('#0284c7');

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart<'line'>;

  constructor() {
    // Redraw when the data changes
    effect(() => {
      const labels = this.labels();
      const values = this.values();
      if (!this.chart) return;
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
    });
  }

  ngAfterViewInit() {
    const color = this.color();
    this.chart = new Chart(this.canvas().nativeElement, {
      type: 'line',
      data: {
        labels: this.labels(),
        datasets: [{
          label: this.label(),
          data: this.values(),
          borderColor: color,
          backgroundColor: color + '14',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          cubicInterpolationMode: 'monotone',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 8, displayColors: false },
        },
        scales: {
          y: { beginAtZero: true, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', precision: 0, font: { size: 11 } } },
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 11 } } },
        },
      },
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
