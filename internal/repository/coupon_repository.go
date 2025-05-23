package repository

import (
	"github.com/gclub/internal/domain"
	"gorm.io/gorm"
)

type CouponRepository interface {
	Create(coupon *domain.Coupon) error
	FindByID(id string) (*domain.Coupon, error)
	FindByCode(code string) (*domain.Coupon, error)
	Update(coupon *domain.Coupon) error
	Delete(id string) error
	ListActive() ([]*domain.Coupon, error)
	IncrementUsageCount(id string) error
}

type couponRepository struct {
	db *gorm.DB
}

func NewCouponRepository(db *gorm.DB) CouponRepository {
	return &couponRepository{db: db}
}

func (r *couponRepository) Create(coupon *domain.Coupon) error {
	return r.db.Create(coupon).Error
}

func (r *couponRepository) FindByID(id string) (*domain.Coupon, error) {
	var coupon domain.Coupon
	err := r.db.Where("id = ?", id).First(&coupon).Error
	if err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (r *couponRepository) FindByCode(code string) (*domain.Coupon, error) {
	var coupon domain.Coupon
	err := r.db.Where("code = ?", code).First(&coupon).Error
	if err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (r *couponRepository) Update(coupon *domain.Coupon) error {
	return r.db.Save(coupon).Error
}

func (r *couponRepository) Delete(id string) error {
	return r.db.Delete(&domain.Coupon{}, "id = ?", id).Error
}

func (r *couponRepository) ListActive() ([]*domain.Coupon, error) {
	var coupons []*domain.Coupon
	err := r.db.Where("is_active = ? AND end_date > NOW()", true).Find(&coupons).Error
	if err != nil {
		return nil, err
	}
	return coupons, nil
}

func (r *couponRepository) IncrementUsageCount(id string) error {
	return r.db.Model(&domain.Coupon{}).Where("id = ?", id).
		UpdateColumn("used_count", gorm.Expr("used_count + ?", 1)).Error
}
