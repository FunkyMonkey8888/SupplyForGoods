import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  status = 500;
  title = 'Something went wrong';
  message = 'Please try again.';
  path = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state: any = nav?.extras?.state;

    if (state) {
      this.status = state.status ?? this.status;
      this.title = state.title ?? this.title;
      this.message = state.message ?? this.message;
      this.path = state.path ?? '';
    }
  }

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  retry(): void {
    // simplest retry behavior: go back
    window.history.back();
  }
}