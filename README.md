# POS System

A modern Point of Sale (POS) system built with Laravel backend and React frontend, designed for retail businesses to manage products, inventory, pricing, transactions, and analytics.

## Description

This POS system provides a comprehensive solution for retail operations, featuring real-time inventory management, dynamic pricing strategies, transaction processing, and business analytics. The system is built with a Laravel REST API backend and a responsive React frontend, offering a seamless user experience for both cashiers and administrators.

## Core Functionalities

### 1. Product Management
- **CRUD Operations**: Create, read, update, and delete products
- **Product Categories**: Organize products into hierarchical categories
- **Product Information**: Track SKU, name, description, cost, and pricing
- **Barcode Support**: Manage product barcodes for quick scanning

### 2. Inventory Management
- **Real-time Stock Tracking**: Monitor product quantities across the system
- **Low Stock Alerts**: Automatic notifications when inventory falls below threshold
- **Inventory Transactions**: Track all stock movements (additions, sales, adjustments)
- **Inventory Valuation**: Calculate total inventory value based on product costs
- **Stock Adjustments**: Manual inventory corrections with reason tracking

### 3. Pricing & Promotions
- **Dynamic Pricing**: Set and manage product prices with effective date ranges
- **Promotional Pricing**: Create time-based promotional prices
- **Price History**: Track all price changes with audit logs
- **Bulk Pricing**: Apply pricing strategies across multiple products
- **Discount Management**: Configure percentage or fixed-amount discounts

### 4. Transaction Processing
- **Point of Sale**: Fast and intuitive checkout interface
- **Multiple Payment Methods**: Support for cash and card payments
- **Tax Calculation**: Automatic tax computation on transactions
- **Receipt Generation**: Print-ready receipt format with transaction details
- **Transaction History**: Complete record of all sales transactions
- **Cart Management**: Add, remove, and modify items before checkout

### 5. Analytics & Reporting
- **Dashboard Overview**: Real-time business metrics and KPIs
- **Sales Analytics**: 
  - Daily, weekly, and monthly sales trends
  - Revenue and profit tracking
  - Transaction volume analysis
- **Top Products**: Identify best-selling products by revenue
- **Inventory Intelligence**: 
  - Low stock alerts and counts
  - Inventory valuation reports
- **Visual Charts**: Interactive bar charts for sales and profit trends
- **Daily Sales Summaries**: Automated aggregation of daily performance data

### 6. User Interface
- **Terminal View**: Dedicated POS interface for cashiers
- **Admin Dashboard**: Comprehensive management interface
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Keyboard Shortcuts**: Quick actions for faster operations
- **Modern UI**: Clean, intuitive interface with smooth animations

## Technology Stack

### Backend
- **Framework**: Laravel 11.x
- **Database**: MySQL
- **API**: RESTful API architecture
- **Authentication**: Laravel Sanctum (ready for implementation)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- MySQL 8.0 or higher

### Backend Setup
```bash
# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Configure database in .env file
# DB_DATABASE=pos_system
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate:fresh --seed

# Start development server
php artisan serve
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd pos-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Products
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{id}` - Get product details
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

### Categories
- `GET /api/v1/categories` - List all categories
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

### Inventory
- `GET /api/v1/inventory` - List inventory
- `POST /api/v1/inventory/adjust` - Adjust stock levels

### Pricing
- `GET /api/v1/pricing/products/{id}` - Get product pricing
- `POST /api/v1/pricing` - Create pricing rule
- `PUT /api/v1/pricing/{id}` - Update pricing
- `DELETE /api/v1/pricing/{id}` - Delete pricing

### Transactions
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/{id}` - Get transaction details

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/sales` - Sales trend data

## Database Schema

The system uses the following main tables:
- `tbl_products` - Product information
- `tbl_categories` - Product categories
- `tbl_inventories` - Stock levels and tracking
- `tbl_inventory_transactions` - Inventory movement history
- `tbl_prices` - Product pricing
- `tbl_price_logs` - Price change history
- `tbl_transactions` - Sales transactions
- `tbl_transaction_items` - Transaction line items
- `tbl_daily_sales_summaries` - Aggregated daily sales data

## Features in Development

- User authentication and role-based access control
- Multi-store support
- Customer management
- Loyalty programs
- Advanced reporting and exports
- Email notifications
- Backup and restore functionality

## License

This project is open-source software licensed under the MIT license.
