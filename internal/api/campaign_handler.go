package api

import (
	"net/http"

	"github.com/gclub/internal/domain"
	"github.com/gclub/internal/service"
	"github.com/gin-gonic/gin"
)

type CampaignHandler struct {
	campaignService service.CampaignService
}

func NewCampaignHandler(campaignService service.CampaignService) *CampaignHandler {
	return &CampaignHandler{campaignService: campaignService}
}

func (h *CampaignHandler) CreateCampaign(c *gin.Context) {
	var campaign domain.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.campaignService.CreateCampaign(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Campaign created successfully", "campaign": campaign})
}

func (h *CampaignHandler) GetCampaign(c *gin.Context) {
	id := c.Param("id")
	campaign, err := h.campaignService.GetCampaignByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"campaign": campaign})
}

func (h *CampaignHandler) UpdateCampaign(c *gin.Context) {
	var campaign domain.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.campaignService.UpdateCampaign(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign updated successfully"})
}

func (h *CampaignHandler) DeleteCampaign(c *gin.Context) {
	id := c.Param("id")
	if err := h.campaignService.DeleteCampaign(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign deleted successfully"})
}

func (h *CampaignHandler) ListActiveCampaigns(c *gin.Context) {
	campaigns, err := h.campaignService.ListActiveCampaigns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"campaigns": campaigns})
}

func (h *CampaignHandler) GetCampaignsByType(c *gin.Context) {
	campaignType := c.Param("type")
	campaigns, err := h.campaignService.GetCampaignsByType(campaignType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"campaigns": campaigns})
}

func (h *CampaignHandler) ApplyCampaign(c *gin.Context) {
	var request struct {
		CampaignID     string  `json:"campaign_id" binding:"required"`
		UserID         string  `json:"user_id" binding:"required"`
		PurchaseAmount float64 `json:"purchase_amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.campaignService.ApplyCampaign(request.CampaignID, request.UserID, request.PurchaseAmount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": result})
}
