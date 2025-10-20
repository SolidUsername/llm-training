import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm!: FormGroup;
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(parseInt(id, 10));
      this.loadProduct(parseInt(id, 10));
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load product');
        this.loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.productForm.value;
    const productData = {
      name: formValue.name,
      price: parseFloat(formValue.price),
      description: formValue.description || null,
      stock: parseInt(formValue.stock, 10)
    };

    if (this.isEditMode() && this.productId() !== null) {
      this.productService.updateProduct(this.productId()!, productData).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error.set('Failed to update product');
          this.loading.set(false);
          console.error('Error updating product:', err);
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error.set('Failed to create product');
          this.loading.set(false);
          console.error('Error creating product:', err);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/products']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('min')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 0`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
    }
    return '';
  }
}
