// Servicio API para comunicarse con el backend Spring Boot

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface VoterDTO {
  dni: string;
  fullName: string;
  address?: string;
  district?: string;
  province?: string;
  department?: string;
  birthDate?: string;
  photoUrl?: string;
  hasVoted?: boolean;
}

export interface CandidateDTO {
  id: string;
  name: string;
  photoUrl?: string;
  description?: string;
  partyName?: string;
  partyLogoUrl?: string;
  partyDescription?: string;
  category: string;
  academicFormation?: string;
  professionalExperience?: string;
  campaignProposal?: string;
  voteCount?: number;
}

export interface VoteSelection {
  candidateId: string;
  candidateName: string;
  category: 'presidencial' | 'distrital' | 'regional';
}

export interface VoteRequest {
  voterDni: string;
  selections: VoteSelection[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Función auxiliar para hacer peticiones
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Error ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}

// API de Votantes
export const voterApi = {
  /**
   * Verifica y registra un votante usando DNI
   */
  verify: async (dni: string): Promise<ApiResponse<VoterDTO>> => {
    return fetchApi<VoterDTO>('/voters/verify', {
      method: 'POST',
      body: JSON.stringify({ dni }),
    });
  },

  /**
   * Obtiene un votante por DNI
   */
  getByDni: async (dni: string): Promise<ApiResponse<VoterDTO>> => {
    return fetchApi<VoterDTO>(`/voters/${dni}`);
  },
};

// API de Candidatos
export const candidateApi = {
  /**
   * Obtiene todos los candidatos
   */
  getAll: async (): Promise<ApiResponse<CandidateDTO[]>> => {
    return fetchApi<CandidateDTO[]>('/candidates');
  },

  /**
   * Obtiene candidatos por categoría
   */
  getByCategory: async (
    category: string
  ): Promise<ApiResponse<CandidateDTO[]>> => {
    return fetchApi<CandidateDTO[]>(`/candidates/category/${category}`);
  },
};

// API de Votos
export const voteApi = {
  /**
   * Registra los votos de un votante
   */
  register: async (
    voteRequest: VoteRequest
  ): Promise<ApiResponse<{ message: string }>> => {
    return fetchApi<{ message: string }>('/votes', {
      method: 'POST',
      body: JSON.stringify(voteRequest),
    });
  },

  /**
   * Obtiene las categorías ya votadas por un votante
   */
  getVotedCategories: async (
    dni: string
  ): Promise<ApiResponse<string[]>> => {
    return fetchApi<string[]>(`/votes/voter/${dni}/categories`);
  },

  /**
   * Invalida los votos de un votante
   */
  invalidate: async (dni: string): Promise<ApiResponse<{ invalidatedCount: number }>> => {
    return fetchApi<{ invalidatedCount: number }>(`/votes/invalidate/${dni}`, {
      method: 'POST',
    });
  },
};

// API de Dashboard
export interface DashboardStatsDTO {
  totalVotes: number;
  totalVoters: number;
  participationRate: number;
  presidentialVotes: number;
  distritalVotes: number;
  regionalVotes: number;
  candidates: CandidateDTO[];
}

export const dashboardApi = {
  /**
   * Obtiene las estadísticas del dashboard
   */
  getStats: async (): Promise<ApiResponse<DashboardStatsDTO>> => {
    return fetchApi<DashboardStatsDTO>('/dashboard/stats');
  },
};

// API de Admin
export interface LoginResponse {
  token: string;
  message: string;
}

// API de Chatbot
export const chatbotApi = {
  /**
   * Envía un mensaje al chatbot y recibe una respuesta
   */
  sendMessage: async (message: string): Promise<ApiResponse<{ response: string }>> => {
    return fetchApi<{ response: string }>('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

export const adminApi = {
  /**
   * Inicia sesión como administrador
   */
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return fetchApi<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Verifica si el token es válido
   */
  verify: async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
    return fetchApi<{ valid: boolean }>('/admin/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Elimina valores nulos
   */
  deleteNullValues: async (): Promise<ApiResponse<{ deletedCount: number }>> => {
    const token = sessionStorage.getItem('adminToken');
    return fetchApi<{ deletedCount: number }>('/admin/clean/null-values', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Elimina duplicados
   */
  deleteDuplicates: async (): Promise<ApiResponse<{ deletedCount: number }>> => {
    const token = sessionStorage.getItem('adminToken');
    return fetchApi<{ deletedCount: number }>('/admin/clean/duplicates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Valida DNIs
   */
  validateDNIs: async (): Promise<ApiResponse<{ invalidDNIs: string[]; count: number }>> => {
    const token = sessionStorage.getItem('adminToken');
    return fetchApi<{ invalidDNIs: string[]; count: number }>('/admin/clean/validate-dnis', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Normaliza datos
   */
  normalizeData: async (): Promise<ApiResponse<{ normalizedCount: number }>> => {
    const token = sessionStorage.getItem('adminToken');
    return fetchApi<{ normalizedCount: number }>('/admin/clean/normalize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

