package service

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/gclub/internal/domain"
	"github.com/gclub/internal/middleware"
	"github.com/gclub/internal/repository"
)

type CampaignService interface {
	CreateCampaign(campaign *domain.Campaign) error
	GetCampaignByID(id string) (*domain.Campaign, error)
	UpdateCampaign(campaign *domain.Campaign) error
	DeleteCampaign(id string) error
	ListActiveCampaigns() ([]*domain.Campaign, error)
	GetCampaignsByType(campaignType string) ([]*domain.Campaign, error)
	ApplyCampaign(campaignID string, userID string, purchaseAmount float64) (float64, error)
}

type campaignService struct {
	campaignRepo repository.CampaignRepository
}

func NewCampaignService(campaignRepo repository.CampaignRepository) CampaignService {
	return &campaignService{campaignRepo: campaignRepo}
}

func (s *campaignService) CreateCampaign(campaign *domain.Campaign) error {
	// Validate campaign dates
	if campaign.StartDate.After(campaign.EndDate) {
		return errors.New("start date must be before end date")
	}

	// Validate campaign type
	validTypes := map[string]bool{
		"points_multiplier": true,
		"special_offer":     true,
		"bonus_points":      true,
	}
	if !validTypes[campaign.Type] {
		return errors.New("invalid campaign type")
	}

	// Validate conditions JSON
	if campaign.Conditions != "" {
		var conditions map[string]interface{}
		if err := json.Unmarshal([]byte(campaign.Conditions), &conditions); err != nil {
			return errors.New("invalid conditions JSON")
		}
	}

	return s.campaignRepo.Create(campaign)
}

func (s *campaignService) GetCampaignByID(id string) (*domain.Campaign, error) {
	return s.campaignRepo.FindByID(id)
}

func (s *campaignService) UpdateCampaign(campaign *domain.Campaign) error {
	return s.campaignRepo.Update(campaign)
}

func (s *campaignService) DeleteCampaign(id string) error {
	return s.campaignRepo.Delete(id)
}

func (s *campaignService) ListActiveCampaigns() ([]*domain.Campaign, error) {
	return s.campaignRepo.ListActive()
}

func (s *campaignService) GetCampaignsByType(campaignType string) ([]*domain.Campaign, error) {
	return s.campaignRepo.FindByType(campaignType)
}

func (s *campaignService) ApplyCampaign(campaignID string, userID string, purchaseAmount float64) (float64, error) {
	campaign, err := s.campaignRepo.FindByID(campaignID)
	if err != nil {
		middleware.RecordCampaignUsage("unknown", "not_found")
		return 0, errors.New("campaign not found")
	}

	// Validate campaign status
	if !campaign.IsActive {
		middleware.RecordCampaignUsage(campaign.Type, "inactive")
		return 0, errors.New("campaign is not active")
	}

	// Validate dates
	now := time.Now()
	if now.Before(campaign.StartDate) || now.After(campaign.EndDate) {
		middleware.RecordCampaignUsage(campaign.Type, "expired")
		return 0, errors.New("campaign is not valid for current date")
	}

	// Parse and validate conditions
	var conditions map[string]interface{}
	if campaign.Conditions != "" {
		if err := json.Unmarshal([]byte(campaign.Conditions), &conditions); err != nil {
			middleware.RecordCampaignUsage(campaign.Type, "invalid_conditions")
			return 0, errors.New("invalid campaign conditions")
		}

		// Check minimum purchase amount if specified
		if minAmount, ok := conditions["min_purchase"].(float64); ok {
			if purchaseAmount < minAmount {
				middleware.RecordCampaignUsage(campaign.Type, "min_purchase_not_met")
				return 0, errors.New("purchase amount does not meet campaign requirements")
			}
		}
	}

	// Calculate points or discount based on campaign type
	var result float64
	switch campaign.Type {
	case "points_multiplier":
		result = purchaseAmount * campaign.Value
	case "special_offer":
		result = campaign.Value
	case "bonus_points":
		result = campaign.Value
	default:
		middleware.RecordCampaignUsage(campaign.Type, "invalid_type")
		return 0, errors.New("invalid campaign type")
	}

	middleware.RecordCampaignUsage(campaign.Type, "success")
	return result, nil
}
