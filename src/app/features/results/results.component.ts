import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html'
})
export class ResultsComponent implements OnInit {
  result: any;

  ngOnInit() {
    const raw = sessionStorage.getItem('lastResult');
    if (raw) this.result = JSON.parse(raw);
  }
}
