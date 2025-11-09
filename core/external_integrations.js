// External API Integration System
// Connects bot economy to real-world data sources

const https = require('https');

class ExternalAPIClient {
    constructor() {
        this.serviceConfig = {
            stripe: {
                enabled: false,
                apiKey: null,
                webhookSecret: null
            },
            coinbase: {
                enabled: false,
                apiKey: null,
                apiSecret: null
            },
            usgsWater: {
                enabled: true,
                endpoint: 'waterservices.usgs.gov',
                path: '/nwis/iv/',
                siteId: '06329500' // Mississippi River
            },
            weather: {
                enabled: true,
                endpoint: 'api.open-meteo.com',
                path: '/v1/forecast'
            }
        };
        
        this.serviceStatus = {};
        this.lastUpdate = null;
    }
    
    /**
     * Generic HTTPS GET request handler
     */
    async fetchData(hostname, path) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: hostname,
                path: path,
                method: 'GET',
                headers: {
                    'User-Agent': 'n8.ked-bot/1.0'
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`JSON parse error: ${e.message}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }
    
    /**
     * Get real water flow data from USGS
     * Returns streamflow in cubic feet per second
     */
    async getWaterData() {
        if (!this.serviceConfig.usgsWater.enabled) {
            return null;
        }
        
        try {
            const params = new URLSearchParams({
                site: this.serviceConfig.usgsWater.siteId,
                parameterCd: '00060', // Streamflow parameter code
                format: 'json'
            });
            
            const path = `${this.serviceConfig.usgsWater.path}?${params.toString()}`;
            const data = await this.fetchData(this.serviceConfig.usgsWater.endpoint, path);
            
            // Extract streamflow value from USGS JSON structure
            const timeSeries = data?.value?.timeSeries;
            if (timeSeries && timeSeries.length > 0) {
                const values = timeSeries[0]?.values;
                if (values && values.length > 0) {
                    const latestValue = values[0]?.value;
                    if (latestValue && latestValue.length > 0) {
                        const flowValue = parseFloat(latestValue[0].value);
                        this.serviceStatus.usgsWater = 'connected';
                        return flowValue;
                    }
                }
            }
            
            this.serviceStatus.usgsWater = 'no_data';
            return null;
        } catch (error) {
            console.error(`[EXTERNAL] Water API error: ${error.message}`);
            this.serviceStatus.usgsWater = 'offline';
            return null;
        }
    }
    
    /**
     * Get weather data for economic impact modeling
     */
    async getWeatherData(latitude = 40.7128, longitude = -74.0060) {
        if (!this.serviceConfig.weather.enabled) {
            return null;
        }
        
        try {
            const params = new URLSearchParams({
                latitude: latitude,
                longitude: longitude,
                current: 'temperature_2m,precipitation,rain',
                timezone: 'auto'
            });
            
            const path = `${this.serviceConfig.weather.path}?${params.toString()}`;
            const data = await this.fetchData(this.serviceConfig.weather.endpoint, path);
            
            if (data?.current) {
                this.serviceStatus.weather = 'connected';
                return data.current;
            }
            
            this.serviceStatus.weather = 'no_data';
            return null;
        } catch (error) {
            console.error(`[EXTERNAL] Weather API error: ${error.message}`);
            this.serviceStatus.weather = 'offline';
            return null;
        }
    }
    
    /**
     * Calculate economic impact from water flow
     * Higher flow = more abundant resources = higher multiplier
     */
    calculateWaterImpact(flowCubicFeetPerSecond) {
        if (!flowCubicFeetPerSecond) return 1.0;
        
        // Scale flow to economic multiplier (simplified model)
        // Normal river flow ranges: 1,000 - 100,000 ft³/s
        const normalizedFlow = Math.min(flowCubicFeetPerSecond / 1000, 2.0);
        return Math.max(0.5, normalizedFlow); // Between 0.5x and 2.0x
    }
    
    /**
     * Calculate economic impact from weather
     */
    calculateWeatherImpact(weatherData) {
        if (!weatherData) return 1.0;
        
        let impact = 1.0;
        const temp = weatherData.temperature_2m || 20;
        const rain = weatherData.rain || 0;
        
        // Hot weather increases activity
        if (temp > 30) {
            impact += 0.1;
        }
        
        // Rain decreases activity
        if (rain > 0) {
            impact -= 0.2;
        }
        
        return Math.max(0.5, Math.min(impact, 1.5));
    }
    
    /**
     * Convert water flow to liters for reserve updates
     * 1 ft³/s = 28.3168 L/s
     */
    convertFlowToLiters(cubicFeetPerSecond, durationSeconds = 1) {
        const litersPerSecond = cubicFeetPerSecond * 28.3168;
        return litersPerSecond * durationSeconds;
    }
    
    /**
     * Get comprehensive real-world status
     */
    async getRealWorldStatus() {
        const waterFlow = await this.getWaterData();
        const weather = await this.getWeatherData();
        
        return {
            water: {
                flow: waterFlow,
                impact: this.calculateWaterImpact(waterFlow),
                status: this.serviceStatus.usgsWater || 'unknown'
            },
            weather: {
                data: weather,
                impact: this.calculateWeatherImpact(weather),
                status: this.serviceStatus.weather || 'unknown'
            },
            lastUpdate: new Date().toISOString(),
            activeServices: Object.values(this.serviceStatus).filter(s => s === 'connected').length,
            totalServices: Object.keys(this.serviceConfig).filter(k => this.serviceConfig[k].enabled).length
        };
    }
}

module.exports = ExternalAPIClient;
