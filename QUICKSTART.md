# Quick Start Guide - Product Market Application

This guide will help you run the complete Product Market application (FastAPI backend + Angular frontend).

## Prerequisites

### Backend (Python/FastAPI)
- Python 3.11 or higher
- pip

### Frontend (Angular)
- Node.js 18 or higher
- npm 9 or higher

## Step-by-Step Setup

### 1. Start the FastAPI Backend

Open a terminal and run:

```bash
cd 03_python_fastapi_project

# Install dependencies (first time only)
pip install fastapi sqlalchemy aiosqlite pydantic-settings

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

You can verify it's running by visiting `http://localhost:8000/docs` in your browser to see the API documentation.

### 2. Start the Angular Frontend

Open a **new terminal** (keep the backend running) and run:

```bash
cd 04_market

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

The Angular app will be available at `http://localhost:4200`

### 3. Use the Application

1. Open your browser and go to `http://localhost:4200`
2. You'll see the Product Market application
3. Click "Add Product" to create your first product
4. View all products in the product list
5. Edit or delete products as needed

## API Endpoints

The Angular frontend uses these API endpoints:

- `GET /products` - List all products
- `GET /products/{id}` - Get a specific product
- `POST /products` - Create a new product
- `PUT /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` for FastAPI or other dependencies
**Solution**: Make sure you've installed all dependencies:
```bash
pip install fastapi sqlalchemy aiosqlite pydantic-settings uvicorn
```

**Problem**: Port 8000 is already in use
**Solution**: Use a different port:
```bash
uvicorn main:app --reload --port 8001
```
Then update `04_market/src/environments/environment.ts` to use port 8001.

### Frontend Issues

**Problem**: `npm: command not found`
**Solution**: Install Node.js from https://nodejs.org/

**Problem**: Port 4200 is already in use
**Solution**: The Angular CLI will automatically suggest a different port, just answer 'Y' when prompted.

**Problem**: CORS errors in browser console
**Solution**: The FastAPI backend already has CORS enabled. Make sure it's running and accessible.

## Development Tips

### Hot Reload

Both the backend and frontend support hot reload:
- **Backend**: Changes to Python files will automatically reload the server
- **Frontend**: Changes to TypeScript/HTML/CSS files will automatically refresh the browser

### Database

The FastAPI backend uses SQLite with a file-based database. The database file is created automatically when you first run the application.

### Environment Configuration

You can change the API URL in:
- `04_market/src/environments/environment.ts` (development)
- `04_market/src/environments/environment.prod.ts` (production)

## Production Build

### Backend
```bash
cd 03_python_fastapi_project
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd 04_market
npm run build
# The built files will be in dist/04_market
```

## Features

### Product List
- Responsive grid layout
- Shows product name, price, description, and stock
- Color-coded stock levels (low stock warning)
- Edit and delete actions for each product

### Product Form
- Create new products
- Edit existing products
- Form validation
- Required fields: name, price, stock
- Optional field: description

### Navigation
- Header with logo and navigation links
- Route-based navigation
- Footer with copyright information
