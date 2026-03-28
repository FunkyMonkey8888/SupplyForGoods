import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {

  itemForm!: FormGroup;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      stockQuantity: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = "Please fill all fields correctly.";
      return;
    }

    const productId = this.itemForm.value.productId;

    const payload = {
      stockQuantity: this.itemForm.value.stockQuantity
    };

    this.http.addInventory(payload, productId).subscribe({
      next: () => {
        this.message = "";
        this.router.navigate(['/get-orders']);
      },
      error: () => {
        this.message = "Failed to add inventory.";
      }
    });
  }
}