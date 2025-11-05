import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClassificationService } from './classification.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-classifier',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './classifier.component.html'
})
export class ClassifierComponent {
  manualText = '';
  file?: File;
  loading = false;
  error = '';
  result: any;

  constructor(private classification: ClassificationService) {}

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0];
  }

  async classify() {
    this.error = '';
    this.result = null;
    if (!this.file && !this.manualText.trim()) {
      this.error = 'Provide a file or text.';
      return;
    }
    this.loading = true;
    try {
      this.result = await this.classification.classify(this.file, this.manualText);
      sessionStorage.setItem('lastResult', JSON.stringify(this.result));
    } catch (e: any) {
      this.error = e.message || 'Classification error';
    } finally {
      this.loading = false;
    }
  }
}
