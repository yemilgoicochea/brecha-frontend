import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClassificationService {
  // TODO: replace with actual backend base URL
  private baseUrl = 'http://localhost:3000/api';

  async classify(file: File | undefined, text: string) {
    // Mock implementation until backend is ready
    if (file) {
      return Promise.resolve({ source: 'file', gap: 'demo', score: 0.82, name: file.name });
    }
    return Promise.resolve({ source: 'text', gap: 'demo', score: 0.74, length: text.length });
  }
}
