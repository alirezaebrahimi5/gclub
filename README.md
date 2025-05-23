# GClub - Club Membership Management System

A micro-SaaS application for managing club memberships, coupons, campaigns, and user loyalty.

## Features

- User Management
  - Registration and authentication
  - JWT-based authentication
  - User profile management

- Coupon System
  - Create and manage coupons
  - Support for percentage and fixed discounts
  - Usage limits and expiration dates
  - Minimum purchase requirements

- Campaign System
  - Multiple campaign types (points multiplier, special offers, bonus points)
  - Time-based campaigns
  - Custom conditions and rules
  - Campaign analytics

- Security
  - JWT authentication
  - Rate limiting
  - Input validation
  - Secure password hashing

## Tech Stack

- Go 1.21+
- PostgreSQL
- Gin Web Framework
- GORM
- JWT for authentication
- Docker & Docker Compose

## Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gclub.git
cd gclub
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run with Docker Compose:
```bash
docker-compose up --build
```

4. Run locally:
```bash
go mod download
go run cmd/api/main.go
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

### Coupons

#### Create Coupon
```http
POST /api/coupons
Authorization: Bearer <token>
Content-Type: application/json

{
    "code": "SUMMER2024",
    "type": "percentage",
    "discount": 20,
    "start_date": "2024-06-01T00:00:00Z",
    "end_date": "2024-08-31T23:59:59Z",
    "min_purchase": 50,
    "max_discount": 100,
    "usage_limit": 1000
}
```

#### Validate Coupon
```http
POST /api/coupons/validate
Authorization: Bearer <token>
Content-Type: application/json

{
    "code": "SUMMER2024",
    "purchase_amount": 100
}
```

### Campaigns

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Summer Bonus",
    "type": "points_multiplier",
    "value": 2.0,
    "start_date": "2024-06-01T00:00:00Z",
    "end_date": "2024-08-31T23:59:59Z",
    "conditions": {
        "min_purchase": 100
    }
}
```

#### Apply Campaign
```http
POST /api/campaigns/apply
Authorization: Bearer <token>
Content-Type: application/json

{
    "campaign_id": "campaign-uuid",
    "user_id": "user-uuid",
    "purchase_amount": 150
}
```

## Development

### Project Structure
```
.
├── cmd/
│   └── api/            # Application entry point
├── internal/
│   ├── api/           # HTTP handlers
│   ├── config/        # Configuration
│   ├── domain/        # Domain models
│   ├── middleware/    # HTTP middleware
│   ├── repository/    # Data access layer
│   └── service/       # Business logic
├── pkg/               # Public packages
├── Dockerfile
├── docker-compose.yml
└── go.mod
```

### Running Tests
```bash
go test ./...
```

### Building
```bash
go build -o gclub cmd/api/main.go
```

## Monitoring

The application includes:
- Request rate limiting
- Request logging
- Error tracking
- Performance metrics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 