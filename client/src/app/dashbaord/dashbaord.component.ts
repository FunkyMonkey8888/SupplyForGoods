import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.css']
})
export class DashboardComponent {

  roleName: string | null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.roleName = this.authService.getRole();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    window.location.reload();
  }
}