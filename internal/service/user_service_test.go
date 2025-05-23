package service

import (
	"testing"

	"github.com/gclub/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *domain.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(id string) (*domain.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(email string) (*domain.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) Update(user *domain.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func TestUserService_Register(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	tests := []struct {
		name    string
		user    *domain.User
		mock    func()
		wantErr bool
	}{
		{
			name: "successful registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Name:     "Test User",
			},
			mock: func() {
				mockRepo.On("FindByEmail", "test@example.com").Return(nil, nil)
				mockRepo.On("Create", mock.AnythingOfType("*domain.User")).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "user already exists",
			user: &domain.User{
				Email:    "existing@example.com",
				Password: "password123",
				Name:     "Existing User",
			},
			mock: func() {
				mockRepo.On("FindByEmail", "existing@example.com").Return(&domain.User{}, nil)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mock()
			err := service.Register(tt.user)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUserService_Login(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Create a test user with hashed password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	testUser := &domain.User{
		Email:    "test@example.com",
		Password: string(hashedPassword),
		Name:     "Test User",
	}

	tests := []struct {
		name     string
		email    string
		password string
		mock     func()
		wantErr  bool
	}{
		{
			name:     "successful login",
			email:    "test@example.com",
			password: "password123",
			mock: func() {
				mockRepo.On("FindByEmail", "test@example.com").Return(testUser, nil)
			},
			wantErr: false,
		},
		{
			name:     "invalid credentials",
			email:    "test@example.com",
			password: "wrongpassword",
			mock: func() {
				mockRepo.On("FindByEmail", "test@example.com").Return(testUser, nil)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mock()
			user, err := service.Login(tt.email, tt.password)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, user)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
			}
		})
	}
}
