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
}