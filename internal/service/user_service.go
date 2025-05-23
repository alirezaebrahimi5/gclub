package service

import (
	"errors"

	"github.com/gclub/internal/domain"
	"github.com/gclub/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Register(user *domain.User) error
	Login(email, password string) (*domain.User, error)
	GetUserByID(id string) (*domain.User, error)
	UpdateUser(user *domain.User) error
	DeleteUser(id string) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(user *domain.User) error {
	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(user.Email)
	if err == nil && existingUser != nil {
		return errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// Create user
	return s.userRepo.Create(user)
}

func (s *userService) Login(email, password string) (*domain.User, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (s *userService) GetUserByID(id string) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *userService) UpdateUser(user *domain.User) error {
	return s.userRepo.Update(user)
}

func (s *userService) DeleteUser(id string) error {
	return s.userRepo.Delete(id)
}
