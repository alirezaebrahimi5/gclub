package main

import (
	"log"
	"os"
	"time"

	"github.com/gclub/internal/api"
	"github.com/gclub/internal/config"
	"github.com/gclub/internal/middleware"
	"github.com/gclub/internal/repository"
	"github.com/gclub/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize database
	db := config.InitDB()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	couponRepo := repository.NewCouponRepository(db)
	campaignRepo := repository.NewCampaignRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	couponService := service.NewCouponService(couponRepo)
	campaignService := service.NewCampaignService(campaignRepo)

	// Initialize handlers
	userHandler := api.NewUserHandler(userService)
	couponHandler := api.NewCouponHandler(couponService)
	campaignHandler := api.NewCampaignHandler(campaignService)

	// Initialize rate limiter
	rateLimiter := middleware.NewRateLimiter(100, time.Minute)

	// Initialize router
	r := gin.New()

	// Add middlewares
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.MetricsMiddleware())
	r.Use(rateLimiter.RateLimit())
	r.Use(gin.Recovery())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Public routes
	public := r.Group("/api")
	{
		public.POST("/users/register", userHandler.Register)
		public.POST("/users/login", userHandler.Login)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		userRoutes := protected.Group("/users")
		{
			userRoutes.GET("/:id", userHandler.GetUser)
			userRoutes.PUT("/:id", userHandler.UpdateUser)
			userRoutes.DELETE("/:id", userHandler.DeleteUser)
		}

		// Coupon routes
		couponRoutes := protected.Group("/coupons")
		{
			couponRoutes.POST("", couponHandler.CreateCoupon)
			couponRoutes.GET("/:id", couponHandler.GetCoupon)
			couponRoutes.PUT("/:id", couponHandler.UpdateCoupon)
			couponRoutes.DELETE("/:id", couponHandler.DeleteCoupon)
			couponRoutes.GET("/active", couponHandler.ListActiveCoupons)
			couponRoutes.POST("/validate", couponHandler.ValidateCoupon)
		}

		// Campaign routes
		campaignRoutes := protected.Group("/campaigns")
		{
			campaignRoutes.POST("", campaignHandler.CreateCampaign)
			campaignRoutes.GET("/:id", campaignHandler.GetCampaign)
			campaignRoutes.PUT("/:id", campaignHandler.UpdateCampaign)
			campaignRoutes.DELETE("/:id", campaignHandler.DeleteCampaign)
			campaignRoutes.GET("/active", campaignHandler.ListActiveCampaigns)
			campaignRoutes.GET("/type/:type", campaignHandler.GetCampaignsByType)
			campaignRoutes.POST("/apply", campaignHandler.ApplyCampaign)
		}
	}

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
