# Cart Implementation

This document describes the cart functionality implementation for the product management system.

## Features Implemented

### Backend (FastAPI - `03_python_fastapi_project/`)

1. **Database Models** (`database.py`):
   - `Cart`: Represents a shopping cart
   - `CartItem`: Represents individual items in the cart with product reference and quantity

2. **API Endpoints** (`main.py`):
   - `GET /cart` - Get the current cart with all items and total
   - `POST /cart/items` - Add a product to the cart (decreases product stock)
   - `PUT /cart/items/{item_id}` - Update quantity of a cart item
   - `DELETE /cart/items/{item_id}` - Remove an item from cart (restores product stock)
   - `DELETE /cart` - Clear the entire cart (restores all product stock)

3. **Stock Management**:
   - Product stock is automatically decreased when items are added to cart
   - Stock is restored when items are removed or cart is cleared
   - Validation ensures sufficient stock before adding items

### Frontend (Angular - `05_design/`)

1. **Cart Service** (`services/cart.service.ts`):
   - Handles all cart API communications
   - Emits events when cart is updated to refresh UI
   - Methods: `getCart()`, `addToCart()`, `updateCartItem()`, `removeFromCart()`, `clearCart()`

2. **Cart Component** (`components/cart/`):
   - **Location**: Fixed position in bottom-left corner
   - **Features**:
     - Collapsible cart display with cart icon and item count badge
     - Shows all cart items with product name, price, and quantity
     - Quantity controls (+ / -) for each item
     - Remove button for individual items
     - Total price calculation
     - Clear cart button
     - Smooth animations and transitions
     - Custom scrollbar styling

3. **Product List Updates** (`components/product-list/`):
   - **Plus Button**: Added next to each product
   - Clicking Plus button adds 1 unit of the product to cart
   - Button is disabled when product is out of stock
   - Auto-refreshes product list after adding to cart to show updated stock

4. **Data Models** (`models/product.model.ts`):
   - Already included interfaces for `Cart`, `CartItem`, `AddToCart`, and `UpdateCartItem`

## How It Works

1. **Adding Products to Cart**:
   - User clicks the Plus button next to a product
   - Frontend sends `POST /cart/items` request with product_id and quantity
   - Backend validates stock availability
   - Backend decreases product stock and adds/updates cart item
   - Frontend refreshes to show updated stock and cart

2. **Viewing Cart**:
   - Cart component is always visible in bottom-left corner
   - Shows badge with total number of items
   - Click to expand and see full cart details
   - Real-time updates when items are added/removed

3. **Managing Cart Items**:
   - Use +/- buttons to adjust quantities
   - Click X to remove individual items
   - "Clear Cart" button removes all items at once
   - All actions automatically restore product stock as needed

4. **Stock Management**:
   - Product stock reflects items currently in cart
   - Stock is reserved when added to cart
   - Stock is returned when items are removed
   - Prevents overselling by checking stock before adding items

## Styling

- Cart component uses dark theme (#030213) to contrast with main interface
- Smooth animations for expand/collapse
- Responsive design
- Custom scrollbar for long item lists
- Badge for item count visualization
- Consistent with existing design system

## Testing

To test the implementation:

1. Start the backend: `cd 03_python_fastapi_project && python main.py`
2. Start the frontend: `cd 05_design && ng serve`
3. Add products to see stock decrease
4. View cart in bottom-left corner
5. Modify quantities and remove items to see stock restored

## Future Enhancements

- Multiple carts per user (currently uses a single cart with id=1)
- Checkout functionality
- Cart persistence across sessions
- Product images in cart
- Toast notifications for cart actions
