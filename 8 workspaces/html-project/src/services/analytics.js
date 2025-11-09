/**
 * Meta Pixel & Analytics Integration
 * Tracks user behavior and conversions for revenue optimization
 */

class AnalyticsService {
  constructor() {
    this.metaPixelId = process.env.REACT_APP_META_PIXEL_ID;
    this.googleAnalyticsId = process.env.REACT_APP_GA_ID;
    this.initialized = false;
  }

  // Initialize Meta Pixel
  initMetaPixel() {
    if (!this.metaPixelId) return;

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', this.metaPixelId);
    window.fbq('track', 'PageView');
    
    this.initialized = true;
  }

  // Track custom events
  trackEvent(eventName, eventData = {}) {
    if (!this.initialized) return;

    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', eventName, eventData);
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Custom backend tracking
    this.sendToBackend(eventName, eventData);
  }

  // Track purchases
  trackPurchase(value, currency = 'USD', data = {}) {
    this.trackEvent('Purchase', {
      value: value,
      currency: currency,
      ...data
    });
  }

  // Track subscription
  trackSubscription(tier, value, interval) {
    this.trackEvent('Subscribe', {
      content_name: tier,
      value: value,
      currency: 'USD',
      predicted_ltv: value * 12, // Yearly value
      subscription_interval: interval
    });
  }

  // Track workflow creation
  trackWorkflowCreation(workflowType) {
    this.trackEvent('WorkflowCreated', {
      content_type: 'workflow',
      workflow_type: workflowType
    });
  }

  // Track API usage
  trackApiCall(endpoint, method) {
    this.trackEvent('APICall', {
      api_endpoint: endpoint,
      api_method: method
    });
  }

  // Send to backend for advanced analytics
  async sendToBackend(eventName, eventData) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          timestamp: new Date().toISOString(),
          sessionId: this.getSessionId()
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Get or create session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('dek_session_id');
    if (!sessionId) {
      sessionId = 'dek_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('dek_session_id', sessionId);
    }
    return sessionId;
  }
}

export default new AnalyticsService();