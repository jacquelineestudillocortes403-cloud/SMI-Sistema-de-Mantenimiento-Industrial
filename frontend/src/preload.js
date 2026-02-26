const { contextBridge } = require('electron');

const BASE_URL = 'http://localhost:3000';

/* ================================
   FUNCIÓN GENÉRICA FETCH
================================ */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    // Validar errores HTTP
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    // Si no hay contenido
    if (response.status === 204) return null;

    return await response.json();

  } catch (error) {
    console.error('API ERROR:', error);
    throw error;
  }
}

/* ================================
   EXPONER API AL RENDERER
================================ */
contextBridge.exposeInMainWorld('smiApp', {

  /* ---------- DASHBOARD ---------- */
  getCounts: () =>
    apiRequest('/api/dashboard/counts'),

  /* ---------- USUARIOS ---------- */
  getUsuarios: () =>
    apiRequest('/api/usuarios'),

  createUsuario: (data) =>
    apiRequest('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateUsuario: (id, data) =>
    apiRequest(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteUsuario: (id) =>
    apiRequest(`/api/usuarios/${id}`, {
      method: 'DELETE'
    }),

  /* ---------- MAQUINARIA ---------- */
  getMaquinaria: () =>
    apiRequest('/api/maquinaria'),

  createMaquinaria: (data) =>
    apiRequest('/api/maquinaria', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateMaquinaria: (id, data) =>
    apiRequest(`/api/maquinaria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteMaquinaria: (id) =>
    apiRequest(`/api/maquinaria/${id}`, {
      method: 'DELETE'
    }),

  /* ---------- TÉCNICOS ---------- */
  getTecnicos: () =>
    apiRequest('/api/tecnicos'),

  createTecnico: (data) =>
    apiRequest('/api/tecnicos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTecnico: (id, data) =>
    apiRequest(`/api/tecnicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteTecnico: (id) =>
    apiRequest(`/api/tecnicos/${id}`, {
      method: 'DELETE'
    }),

  /* ---------- MANTENIMIENTO ---------- */
  getMantenimientos: () =>
    apiRequest('/api/mantenimiento'),

  createMantenimiento: (data) =>
    apiRequest('/api/mantenimiento', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateMantenimiento: (id, data) =>
    apiRequest(`/api/mantenimiento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteMantenimiento: (id) =>
    apiRequest(`/api/mantenimiento/${id}`, {
      method: 'DELETE'
    }),

  /* ---------- ÓRDENES (por técnico) ---------- */
  getOrdenesPorTecnicoNombre: (nombreTecnico) =>
    apiRequest(`/api/ordenes?tecnico=${encodeURIComponent(nombreTecnico)}`),

  /* ---------- NOTIFICACIONES (FIX) ---------- */
  showNotification: (message) => {
    try {
      if (typeof Notification === 'undefined') return;

      if (Notification.permission === 'granted') {
        new Notification('🛠️ SMI - Sistema de Mantenimiento', { body: message });
        return;
      }

      if (Notification.permission === 'default') {
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            new Notification('🛠️ SMI - Sistema de Mantenimiento', { body: message });
          }
        });
      }
      // Si es 'denied', no hacemos nada (pero tampoco truena)
    } catch (e) {
      console.warn('Notificación no disponible:', e.message);
    }
  }

});