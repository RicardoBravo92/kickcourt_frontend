import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CourtService } from '../../../services/court';
import { CourtBlockService } from '../../../services/court-block';
import { ToastService } from '../../../services/toast';
import { Court, CourtBlock } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-vendor-blocks',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './vendor-blocks.html',
  styleUrl: './vendor-blocks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorBlocks implements OnInit {
  private courtService = inject(CourtService);
  private blockService = inject(CourtBlockService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  courts = signal<Court[]>([]);
  selectedCourtId: number | null = null;
  blocks = signal<CourtBlock[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  newBlock: Partial<CourtBlock> = {
    date: '',
    start_time: '08:00',
    end_time: '22:00',
    reason: '',
  };

  ngOnInit() {
    this.courtService.getCourts({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (c) => this.courts.set(c),
    });
  }

  onCourtChange() {
    if (!this.selectedCourtId) {
      this.blocks.set([]);
      return;
    }
    this.loading.set(true);
    this.blockService.getBlocks(this.selectedCourtId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b) => {
        this.blocks.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addBlock() {
    if (!this.selectedCourtId || !this.newBlock.date || !this.newBlock.start_time || !this.newBlock.end_time) {
      return;
    }
    if (this.newBlock.end_time <= this.newBlock.start_time) {
      this.error.set('End time must be after start time');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const block: Partial<CourtBlock> = { ...this.newBlock, court: this.selectedCourtId };
    this.blockService.createBlock(block).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b) => {
        this.blocks.update(list => [b, ...list]);
        this.newBlock = { date: '', start_time: '08:00', end_time: '22:00', reason: '' };
        this.saving.set(false);
        this.toast.success('toast.blockCreated');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Error creating block');
        this.toast.error('toast.blockError');
      },
    });
  }

  deleteBlock(id: number) {
    this.blockService.deleteBlock(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.blocks.update(list => list.filter((b) => b.id !== id));
        this.toast.success('toast.blockDeleted');
      },
      error: () => {
        this.error.set('Error deleting block');
        this.toast.error('toast.blockError');
      },
    });
  }
}