package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds",
			Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
		},
		[]string{"method", "path"},
	)

	activeUsers = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_users",
			Help: "Number of active users",
		},
	)

	couponUsageTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "coupon_usage_total",
			Help: "Total number of coupon usages",
		},
		[]string{"code", "status"},
	)

	campaignUsageTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "campaign_usage_total",
			Help: "Total number of campaign usages",
		},
		[]string{"type", "status"},
	)
)

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.FullPath()
		if path == "" {
			path = "unknown"
		}

		c.Next()

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(c.Writer.Status())

		httpRequestsTotal.WithLabelValues(c.Request.Method, path, status).Inc()
		httpRequestDuration.WithLabelValues(c.Request.Method, path).Observe(duration)
	}
}

// UpdateActiveUsers updates the active users metric
func UpdateActiveUsers(count int) {
	activeUsers.Set(float64(count))
}

// RecordCouponUsage records a coupon usage
func RecordCouponUsage(code string, status string) {
	couponUsageTotal.WithLabelValues(code, status).Inc()
}

// RecordCampaignUsage records a campaign usage
func RecordCampaignUsage(campaignType string, status string) {
	campaignUsageTotal.WithLabelValues(campaignType, status).Inc()
}
