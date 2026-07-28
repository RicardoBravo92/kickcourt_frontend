import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../../services/court';
import { CourtBlockService } from '../../../services/court-block';
import { ToastService } from '../../../services/toast';
import { Court, CourtBlock } from '../../../models/court';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-blocks',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-blocks.html',
  styleUrl: './admin-blocks.css',
})
export class AdminBlocks implements OnInit {
  private courtService = inject(CourtService);
  private blockService = inject(CourtBlockService);
  private toast = inject(ToastService);

  courts: Court[] = [];
  selectedCourtId: number | null = null;
  blocks: CourtBlock[] = [];
  loading = false;
  saving = false;
  error = '';

  newBlock: Partial<CourtBlock> = {
    date: '',
    start_time: '08:00',
    end_time: '22:00',
    reason: '',
  };

  ngOnInit() {
    this.courtService.getCourts().subscribe({
      next: (c) => (this.courts = c),
    });
  }

  onCourtChange() {
    if (!this.selectedCourtId) {
      this.blocks = [];
      return;
    }
    this.loading = true;
    this.blockService.getBlocks(this.selectedCourtId).subscribe({
      next: (b) => {
        this.blocks = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  addBlock() {
    if (
      !this.selectedCourtId ||
      !this.newBlock.date ||
      !this.newBlock.start_time ||
      !this.newBlock.end_time
    ) {
      return;
    }
    if (this.newBlock.end_time <= this.newBlock.start_time) {
      this.error = 'End time must be after start time';
      return;
    }
    this.saving = true;
    this.error = '';
    const block: Partial<CourtBlock> = {
      ...this.newBlock,
      court: this.selectedCourtId,
    };
    this.blockService.createBlock(block).subscribe({
      next: (b) => {
        this.blocks.unshift(b);
        this.newBlock = { date: '', start_time: '08:00', end_time: '22:00', reason: '' };
        this.saving = false;
        this.toast.success('toast.blockCreated');
      },
      error: () => {
        this.saving = false;
        this.error = 'Error creating block';
        this.toast.error('toast.blockError');
      },
    });
  }

  deleteBlock(id: number) {
    this.blockService.deleteBlock(id).subscribe({
      next: () => {
        this.blocks = this.blocks.filter((b) => b.id !== id);
        this.toast.success('toast.blockDeleted');
      },
      error: () => {
        this.error = 'Error deleting block';
        this.toast.error('toast.blockError');
      },
    });
  }
}
