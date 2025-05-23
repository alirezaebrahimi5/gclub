package api

import (
	"net/http"

	"github.com/gclub/internal/domain"
	"github.com/gclub/internal/service"
	"github.com/gin-gonic/gin"
)

type CouponHandler struct {
	couponService service.CouponService
}

func NewCouponHandler(couponService service.CouponService) *CouponHandler {
	return &CouponHandler{couponService: couponService}
}

func (h *CouponHandler) CreateCoupon(c *gin.Context) {
	var coupon domain.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.couponService.CreateCoupon(&coupon); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Coupon created successfully", "coupon": coupon})
}

func (h *CouponHandler) GetCoupon(c *gin.Context) {
	id := c.Param("id")
	coupon, err := h.couponService.GetCouponByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupon": coupon})
}

func (h *CouponHandler) UpdateCoupon(c *gin.Context) {
	var coupon domain.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.couponService.UpdateCoupon(&coupon); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Coupon updated successfully"})
}

func (h *CouponHandler) DeleteCoupon(c *gin.Context) {
	id := c.Param("id")
	if err := h.couponService.DeleteCoupon(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Coupon deleted successfully"})
}

func (h *CouponHandler) ListActiveCoupons(c *gin.Context) {
	coupons, err := h.couponService.ListActiveCoupons()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}

func (h *CouponHandler) ValidateCoupon(c *gin.Context) {
	var request struct {
		Code           string  `json:"code" binding:"required"`
		PurchaseAmount float64 `json:"purchase_amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.couponService.ValidateAndApplyCoupon(request.Code, request.PurchaseAmount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupon": coupon})
}
