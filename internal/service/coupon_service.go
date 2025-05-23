package service

import (
	"errors"
	"time"

	"github.com/gclub/internal/domain"
	"github.com/gclub/internal/middleware"
	"github.com/gclub/internal/repository"
)

type CouponService interface {
	CreateCoupon(coupon *domain.Coupon) error
	GetCouponByID(id string) (*domain.Coupon, error)
	GetCouponByCode(code string) (*domain.Coupon, error)
	UpdateCoupon(coupon *domain.Coupon) error
	DeleteCoupon(id string) error
	ListActiveCoupons() ([]*domain.Coupon, error)
	ValidateAndApplyCoupon(code string, purchaseAmount float64) (*domain.Coupon, error)
}

type couponService struct {
	couponRepo repository.CouponRepository
}

func NewCouponService(couponRepo repository.CouponRepository) CouponService {
	return &couponService{couponRepo: couponRepo}
}

func (s *couponService) CreateCoupon(coupon *domain.Coupon) error {
	// Validate coupon dates
	if coupon.StartDate.After(coupon.EndDate) {
		return errors.New("start date must be before end date")
	}

	// Validate coupon type
	if coupon.Type != "percentage" && coupon.Type != "fixed" {
		return errors.New("invalid coupon type")
	}

	// Validate discount value
	if coupon.Type == "percentage" && (coupon.Discount <= 0 || coupon.Discount > 100) {
		return errors.New("percentage discount must be between 0 and 100")
	}

	return s.couponRepo.Create(coupon)
}

func (s *couponService) GetCouponByID(id string) (*domain.Coupon, error) {
	return s.couponRepo.FindByID(id)
}

func (s *couponService) GetCouponByCode(code string) (*domain.Coupon, error) {
	return s.couponRepo.FindByCode(code)
}

func (s *couponService) UpdateCoupon(coupon *domain.Coupon) error {
	return s.couponRepo.Update(coupon)
}

func (s *couponService) DeleteCoupon(id string) error {
	return s.couponRepo.Delete(id)
}

func (s *couponService) ListActiveCoupons() ([]*domain.Coupon, error) {
	return s.couponRepo.ListActive()
}

func (s *couponService) ValidateAndApplyCoupon(code string, purchaseAmount float64) (*domain.Coupon, error) {
	coupon, err := s.couponRepo.FindByCode(code)
	if err != nil {
		middleware.RecordCouponUsage(code, "invalid_code")
		return nil, errors.New("invalid coupon code")
	}

	// Validate coupon status
	if !coupon.IsActive {
		middleware.RecordCouponUsage(code, "inactive")
		return nil, errors.New("coupon is not active")
	}

	// Validate dates
	now := time.Now()
	if now.Before(coupon.StartDate) || now.After(coupon.EndDate) {
		middleware.RecordCouponUsage(code, "expired")
		return nil, errors.New("coupon is not valid for current date")
	}

	// Validate usage limit
	if coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit {
		middleware.RecordCouponUsage(code, "limit_reached")
		return nil, errors.New("coupon usage limit reached")
	}

	// Validate minimum purchase
	if purchaseAmount < coupon.MinPurchase {
		middleware.RecordCouponUsage(code, "min_purchase_not_met")
		return nil, errors.New("purchase amount does not meet minimum requirement")
	}

	// Calculate discount
	var discount float64
	if coupon.Type == "percentage" {
		discount = purchaseAmount * (coupon.Discount / 100)
		if discount > coupon.MaxDiscount {
			discount = coupon.MaxDiscount
		}
	} else {
		discount = coupon.Discount
	}

	// Increment usage count
	if err := s.couponRepo.IncrementUsageCount(coupon.ID.String()); err != nil {
		middleware.RecordCouponUsage(code, "error")
		return nil, err
	}

	middleware.RecordCouponUsage(code, "success")
	return coupon, nil
}
