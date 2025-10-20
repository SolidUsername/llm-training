import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = '';
  
  // Dialog states
  showDetailDialog = signal(false);
  showDeleteDialog = signal(false);
  showFormDialog = signal(false);
  selectedProduct = signal<Product | null>(null);
  isEditMode = signal(false);
  
  // Form
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  filterProducts() {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredProducts.set(this.products());
      return;
    }
    
    const filtered = this.products().filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
    this.filteredProducts.set(filtered);
  }

  openDetailDialog(product: Product) {
    this.selectedProduct.set(product);
    this.showDetailDialog.set(true);
  }

  closeDetailDialog() {
    this.showDetailDialog.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300);
  }

  confirmDelete(product: Product) {
    this.selectedProduct.set(product);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog() {
    this.showDeleteDialog.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300);
  }

  deleteProduct() {
    const product = this.selectedProduct();
    if (!product) return;

    this.loading.set(true);
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.closeDeleteDialog();
        this.loadProducts();
      },
      error: (err) => {
        this.error.set('Failed to delete product');
        this.loading.set(false);
        console.error('Error deleting product:', err);
      }
    });
  }

  openAddDialog() {
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0
    });
    this.showFormDialog.set(true);
  }

  openEditDialog(product: Product) {
    this.isEditMode.set(true);
    this.selectedProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock
    });
    this.showFormDialog.set(true);
  }

  closeFormDialog() {
    this.showFormDialog.set(false);
    setTimeout(() => {
      this.selectedProduct.set(null);
      this.isEditMode.set(false);
      this.productForm.reset();
    }, 300);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.loading.set(true);
    const formValue = this.productForm.value;

    if (this.isEditMode() && this.selectedProduct()) {
      const product: Product = {
        ...this.selectedProduct()!,
        ...formValue
      };
      
      this.productService.updateProduct(product.id, product).subscribe({
        next: () => {
          this.closeFormDialog();
          this.loadProducts();
        },
        error: (err) => {
          this.error.set('Failed to update product');
          this.loading.set(false);
          console.error('Error updating product:', err);
        }
      });
    } else {
      this.productService.addProduct(formValue).subscribe({
        next: () => {
          this.closeFormDialog();
          this.loadProducts();
        },
        error: (err) => {
          this.error.set('Failed to add product');
          this.loading.set(false);
          console.error('Error adding product:', err);
        }
      });
    }
  }
}
