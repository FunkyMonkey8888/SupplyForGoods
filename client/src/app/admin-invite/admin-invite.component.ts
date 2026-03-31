import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-admin-invite',
  templateUrl: './admin-invite.component.html'
})
export class AdminInviteComponent {

  selectedRole: 'MANUFACTURER' | 'WHOLESALER' = 'MANUFACTURER';
  generatedCode: string | null = null;
  errorMessage = '';

  constructor(private http: HttpService) {}

  generateInvite(): void {
    this.generatedCode = null;
    this.errorMessage = '';

    this.http.generateInviteCode(this.selectedRole).subscribe({
      next: (res: any) => {
        this.generatedCode = res.code;
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to generate invite code';
      }
    });
  }
}
``