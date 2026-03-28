<<<<<<< HEAD
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
=======
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  role: string | null = null;
  username: string | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole;
    this.username = localStorage.getItem('username') || null;
  }
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
}