package repository

import (
	"github.com/gclub/internal/domain"
	"gorm.io/gorm"
)

type CampaignRepository interface {
	Create(campaign *domain.Campaign) error
	FindByID(id string) (*domain.Campaign, error)
	Update(campaign *domain.Campaign) error
	Delete(id string) error
	ListActive() ([]*domain.Campaign, error)
	FindByType(campaignType string) ([]*domain.Campaign, error)
}

type campaignRepository struct {
	db *gorm.DB
}

func NewCampaignRepository(db *gorm.DB) CampaignRepository {
	return &campaignRepository{db: db}
}

func (r *campaignRepository) Create(campaign *domain.Campaign) error {
	return r.db.Create(campaign).Error
}

func (r *campaignRepository) FindByID(id string) (*domain.Campaign, error) {
	var campaign domain.Campaign
	err := r.db.Where("id = ?", id).First(&campaign).Error
	if err != nil {
		return nil, err
	}
	return &campaign, nil
}

func (r *campaignRepository) Update(campaign *domain.Campaign) error {
	return r.db.Save(campaign).Error
}

func (r *campaignRepository) Delete(id string) error {
	return r.db.Delete(&domain.Campaign{}, "id = ?", id).Error
}

func (r *campaignRepository) ListActive() ([]*domain.Campaign, error) {
	var campaigns []*domain.Campaign
	err := r.db.Where("is_active = ? AND end_date > NOW()", true).Find(&campaigns).Error
	if err != nil {
		return nil, err
	}
	return campaigns, nil
}

func (r *campaignRepository) FindByType(campaignType string) ([]*domain.Campaign, error) {
	var campaigns []*domain.Campaign
	err := r.db.Where("type = ? AND is_active = ? AND end_date > NOW()", campaignType, true).Find(&campaigns).Error
	if err != nil {
		return nil, err
	}
	return campaigns, nil
}
