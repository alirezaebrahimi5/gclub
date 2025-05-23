package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Coupon struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	Code        string         `gorm:"uniqueIndex;not null" json:"code"`
	Description string         `json:"description"`
	Discount    float64        `gorm:"not null" json:"discount"`
	Type        string         `gorm:"not null" json:"type"` // percentage or fixed
	MinPurchase float64        `json:"min_purchase"`
	MaxDiscount float64        `json:"max_discount"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
	UsageLimit  int            `json:"usage_limit"`
	UsedCount   int            `gorm:"default:0" json:"used_count"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Coupon) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
