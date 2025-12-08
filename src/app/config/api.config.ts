/**
 * API Configuration
 * Importa la URL de base según el ambiente (development, staging, production)
 */
import { environment } from '../../environments/environment';

export const API_CONFIG = {
  host: environment.apiUrl,
  endpoints: {
    classify: '/api/v1/classify'
  }
};

export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.host}${endpoint}`;
}
