import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cart, AddToCart, UpdateCartItem } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartUpdated = new Subject<void>();
  private cartCheckout = new Subject<void>();

  cartUpdated$ = this.cartUpdated.asObservable();
  cartCheckout$ = this.cartCheckout.asObservable();

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(() => this.cartUpdated.next())
    );
  }

  addToCart(item: AddToCart): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, item).pipe(
      tap(() => this.cartUpdated.next())
    );
  }

  updateCartItem(itemId: number, update: UpdateCartItem): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, update).pipe(
      tap(() => this.cartUpdated.next())
    );
  }

  removeFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(() => this.cartUpdated.next())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this.cartUpdated.next())
    );
  }

  checkout(): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/checkout`, {}).pipe(
      tap(() => {
        this.cartCheckout.next();
      })
    );
  }
}
