import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('Product ID is missing');
      return;
    }
    const id = parseInt(idParam, 10);
    this.loadProduct(id);
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProduct(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load product');
        this.loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  goToEdit() {
    if (this.product()) {
      this.router.navigate(['/products', this.product()!.id, 'edit']);
    }
  }

  deleteProduct() {
    if (!this.product()) return;
    const id = this.product()!.id;
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error.set('Failed to delete product');
          console.error('Error deleting product:', err);
        }
      });
    }
  }
}
