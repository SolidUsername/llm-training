# Product Market - Angular Frontend

This is an Angular web application that provides a full CRUD (Create, Read, Update, Delete) interface for managing products through the FastAPI backend.

## Features

- **Product List**: View all products in a responsive grid layout
- **Create Product**: Add new products with name, price, description, and stock
- **Edit Product**: Update existing product information
- **Delete Product**: Remove products with confirmation
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Angular**: Uses Angular 20+ with standalone components and signals

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- FastAPI backend running on `http://localhost:8000`

## Installation

```bash
npm install
```

## Running the Application

1. Make sure the FastAPI backend is running:
   ```bash
   cd ../03_python_fastapi_project
   # Start your FastAPI server
   ```

2. Start the Angular development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── product-list/       # Product list component
│   │   └── product-form/       # Product create/edit form
│   ├── models/
│   │   └── product.model.ts    # Product interfaces
│   ├── services/
│   │   └── product.service.ts  # API service for product operations
│   ├── app.ts                  # Main app component
│   ├── app.html                # Main app template
│   ├── app.css                 # Main app styles
│   ├── app.config.ts           # App configuration
│   └── app.routes.ts           # Route definitions
├── styles.css                  # Global styles
└── main.ts                     # Application entry point
```

## API Endpoints Used

The application connects to these FastAPI endpoints:

- `GET /products` - Get all products
- `GET /products/{id}` - Get a single product
- `POST /products` - Create a new product
- `PUT /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- Angular 20.3
- TypeScript 5.9
- RxJS 7.8
- Angular Router
- Angular Forms (Reactive Forms)
- Angular HTTP Client
