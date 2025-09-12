import { IndicatorListItem, IndicatorDef, ConditionPayload, ValidationResult, SentenceResult } from '../types/indicators';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// In-memory cache for ETags and responses
const cache = new Map<string, { etag: string; data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

async function fetchWithCache<T>(
  url: string, 
  cacheKey: string, 
  options: RequestInit = {}
): Promise<T> {
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  // Check if cache is still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    // Add If-None-Match header for ETag validation
    options.headers = {
      ...options.headers,
      'If-None-Match': cached.etag,
    };
  }
  
  try {
    const response = await fetchWithTimeout(url, options);
    
    // If 304 Not Modified, return cached data
    if (response.status === 304 && cached) {
      return cached.data;
    }
    
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
    
    const data = await response.json();
    const etag = response.headers.get('ETag');
    
    // Update cache
    if (etag) {
      cache.set(cacheKey, {
        etag,
        data,
        timestamp: now
      });
    }
    
    return data;
  } catch (error) {
    // If network error and we have cached data, return it
    if (cached && error instanceof ApiError) {
      console.warn(`API error, using cached data: ${error.message}`);
      return cached.data;
    }
    throw error;
  }
}

export async function getIndicators(): Promise<IndicatorListItem[]> {
  return fetchWithCache<IndicatorListItem[]>(
    `${API_BASE_URL}/v1/indicators`,
    'indicators-list'
  );
}

export async function getIndicatorDef(id: string): Promise<IndicatorDef> {
  return fetchWithCache<IndicatorDef>(
    `${API_BASE_URL}/v1/indicators/${id}`,
    `indicator-def-${id}`
  );
}

export async function validateCondition(payload: ConditionPayload): Promise<ValidationResult> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/v1/conditions/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    throw new ApiError(`Validation failed: ${response.statusText}`, response.status);
  }
  
  return response.json();
}

export async function getSentence(payload: ConditionPayload): Promise<SentenceResult> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/v1/conditions/sentence`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    throw new ApiError(`Sentence generation failed: ${response.statusText}`, response.status);
  }
  
  return response.json();
}

export async function computeIndicator(payload: {
  symbol: string;
  timeframe: string;
  indicatorId: string;
  settings: Record<string, any>;
  region?: string;
  limit?: number;
}): Promise<{ data: Array<{ timestamp: number; values: Record<string, number> }> }> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/v1/indicators/compute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    throw new ApiError(`Compute failed: ${response.statusText}`, response.status);
  }
  
  return response.json();
}

// Utility function to check if API is reachable
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 2000);
    return response.ok;
  } catch {
    return false;
  }
}