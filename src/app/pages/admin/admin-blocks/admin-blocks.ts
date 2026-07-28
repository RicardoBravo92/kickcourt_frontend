import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../../services/field';
import { FieldBlockService } from '../../../services/field-block';
import { Field, FieldBlock } from '../../../models/field';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-blocks',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-blocks.html',
  styleUrl: './admin-blocks.css',
})
export class AdminBlocks implements OnInit {
  private fieldService = inject(FieldService);
  private blockService = inject(FieldBlockService);

  fields: Field[] = [];
  selectedFieldId: number | null = null;
  blocks: FieldBlock[] = [];
  loading = false;
  saving = false;
  error = '';

  newBlock: Partial<FieldBlock> = {
    date: '',
    start_time: '08:00',
    end_time: '22:00',
    reason: '',
  };

  ngOnInit() {
    this.fieldService.getFields().subscribe({
      next: (f) => (this.fields = f),
    });
  }

  onFieldChange() {
    if (!this.selectedFieldId) {
      this.blocks = [];
      return;
    }
    this.loading = true;
    this.blockService.getBlocks(this.selectedFieldId).subscribe({
      next: (b) => {
        this.blocks = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  addBlock() {
    if (
      !this.selectedFieldId ||
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
    const block: Partial<FieldBlock> = {
      ...this.newBlock,
      field: this.selectedFieldId,
    };
    this.blockService.createBlock(block).subscribe({
      next: (b) => {
        this.blocks.unshift(b);
        this.newBlock = { date: '', start_time: '08:00', end_time: '22:00', reason: '' };
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.detail || 'Error creating block';
      },
    });
  }

  deleteBlock(id: number) {
    this.blockService.deleteBlock(id).subscribe({
      next: () => {
        this.blocks = this.blocks.filter((b) => b.id !== id);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error deleting block';
      },
    });
  }
}
