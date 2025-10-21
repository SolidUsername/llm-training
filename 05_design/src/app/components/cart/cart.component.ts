import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  
  cart = signal<Cart | null>(null);
  isExpanded = signal(false);

  ngOnInit() {
    this.loadCart();
    
    // Subscribe to cart updates
    this.cartService.cartUpdated$.subscribe(() => {
      this.loadCart();
    });
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  toggleCart() {
    this.isExpanded.update(value => !value);
  }

  removeItem(itemId: number) {
    this.cartService.removeFromCart(itemId).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Error removing item:', err);
      }
    });
  }

  updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) {
      this.removeItem(itemId);
      return;
    }

    this.cartService.updateCartItem(itemId, { quantity }).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
      }
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      }
    });
  }

  checkout() {
    this.cartService.checkout().subscribe({
      next: (cart) => {
        // cart should now be empty
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Error during checkout:', err);
      }
    });
  }

  getTotalItems(): number {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}
