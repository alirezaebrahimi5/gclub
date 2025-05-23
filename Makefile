.PHONY: build run test clean deps

# Build the application
build:
	go build -o bin/api cmd/api/main.go

# Run the application
run:
	go run cmd/api/main.go

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Install dependencies
deps:
	go mod download
	go mod tidy

# Generate mocks
mocks:
	mockgen -source=internal/repository/user_repository.go -destination=internal/mocks/user_repository_mock.go
	mockgen -source=internal/service/user_service.go -destination=internal/mocks/user_service_mock.go

# Run linter
lint:
	golangci-lint run

# Run in development mode
dev:
	go run cmd/api/main.go 