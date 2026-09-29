const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = {
  // Generic helper for JSON requests
  async request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    
    let userRole = null;
    let userId = null;
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        userRole = user?.role;
        userId = user?.id || user?.username;
      }
    } catch (e) {
      console.error('Failed to parse user from local storage in apiClient:', e);
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(userRole ? { 'X-User-Role': userRole } : {}),
      ...(userId ? { 'X-User-Id': userId } : {})
    };
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) errorMsg = errData.detail;
        } catch (_) {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Request to ${path} failed:`, error);
      throw error;
    }
  },

  // --- VISITORS ---
  async getActiveVisitors() {
    try {
      const data = await this.request('/visitors/active');
      return data.visitors || [];
    } catch (error) {
      console.error('Failed to fetch active visitors:', error);
      return []; // Return empty array fallback in dev
    }
  },

  async registerVisitor(visitorData) {
    console.log('Sending visitor data to API:', visitorData);
    return await this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitorData),
    });
  },

  async checkInVisitor(visitorData) {
    return await this.registerVisitor(visitorData);
  },

  async checkOutVisitor(visitorId, type = 'PERMANENT', remarks = '') {
    console.log('Checking out visitor ID:', visitorId, 'Type:', type, 'Remarks:', remarks);
    let path = `/visitors/${visitorId}/checkout?checkout_type=${type}`;
    if (remarks) path += `&remarks=${encodeURIComponent(remarks)}`;
    return await this.request(path, {
      method: 'POST',
    });
  },

  async returnVisitor(visitorId) {
    console.log('Returning visitor ID:', visitorId);
    return await this.request(`/visitors/${visitorId}/return`, {
      method: 'POST',
    });
  },

  async getTempOutVisitors() {
    try {
      const data = await this.request('/visitors/temp-out');
      return data.visitors || [];
    } catch (error) {
      console.error('Failed to fetch temp out visitors:', error);
      return [];
    }
  },

  async getRequestedVisitors() {
    try {
      const data = await this.request('/visitors/requested');
      return data.visitors || [];
    } catch (error) {
      console.error('Failed to fetch requested visitors:', error);
      return [];
    }
  },

  async activateVisitor(visitorId, activationData) {
    return await this.request(`/visitors/${visitorId}/activate`, {
      method: 'POST',
      body: JSON.stringify(activationData),
    });
  },

  // --- SITES & BUILDINGS ---
  async getSites() {
    try {
      return await this.request('/master/sites');
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      return [];
    }
  },

  async createSite(siteData) {
    return await this.request('/master/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    });
  },

  async deleteSite(siteId) {
    return await this.request(`/master/sites/${siteId}`, {
      method: 'DELETE',
    });
  },

  async createBuilding(siteId, name) {
    return await this.request(`/master/sites/${siteId}/buildings`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async deleteBuilding(buildingId) {
    return await this.request(`/master/buildings/${buildingId}`, {
      method: 'DELETE',
    });
  },

  // --- DEPARTMENTS ---
  async getDepartments() {
    try {
      return await this.request('/master/departments');
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  },

  async createDepartment(deptData) {
    return await this.request('/master/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
    });
  },

  async deleteDepartment(deptId) {
    return await this.request(`/master/departments/${deptId}`, {
      method: 'DELETE',
    });
  },

  // --- ACCESSORY TYPES ---
  async getAccessories() {
    try {
      return await this.request('/master/accessories');
    } catch (error) {
      console.error('Failed to fetch accessories:', error);
      return [];
    }
  },

  async createAccessory(accData) {
    return await this.request('/master/accessories', {
      method: 'POST',
      body: JSON.stringify(accData),
    });
  },

  async deleteAccessory(accId) {
    return await this.request(`/master/accessories/${accId}`, {
      method: 'DELETE',
    });
  },

  // --- SECURITY BLACKLIST ---
  async getBlacklist() {
    try {
      return await this.request('/security/blacklist');
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
      return [];
    }
  },

  async addToBlacklist(blackData) {
    return await this.request('/security/blacklist', {
      method: 'POST',
      body: JSON.stringify(blackData),
    });
  },

  async removeFromBlacklist(blacklistId) {
    return await this.request(`/security/blacklist/${blacklistId}`, {
      method: 'DELETE',
    });
  },

  // --- BRANDING ---
  async getBranding() {
    try {
      return await this.request('/settings/branding');
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      return {
        company_name: 'CampusGuard',
        logo_url: '',
        tagline: 'Secure. Smart. Seamless.',
        logo_initial: 'CG',
        contact_info: 'security@campusguard.local',
      };
    }
  },

  async updateBranding(brandingData) {
    return await this.request('/settings/branding', {
      method: 'POST',
      body: JSON.stringify(brandingData),
    });
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    try {
      return await this.request('/settings/notifications');
    } catch (error) {
      console.error('Failed to fetch notifications config:', error);
      return {
        email_enabled: true,
        sms_enabled: false,
        alert_threshold_mins: 120,
      };
    }
  },

  async updateNotifications(notifData) {
    return await this.request('/settings/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData),
    });
  },

  // --- USERS & ROLE MANAGEMENT ---
  async getUsers() {
    try {
      return await this.request('/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async loginOperator(username, password) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // --- VISITOR TYPES MASTER ---
  async getVisitorTypes() {
    try {
      return await this.request('/master/visitor-types');
    } catch (error) {
      console.error('Failed to fetch visitor types:', error);
      return [];
    }
  },

  async createVisitorType(typeData) {
    return await this.request('/master/visitor-types', {
      method: 'POST',
      body: JSON.stringify(typeData),
    });
  },

  async deleteVisitorType(typeId) {
    return await this.request(`/master/visitor-types/${typeId}`, {
      method: 'DELETE',
    });
  },

  // --- UPDATE METHODS ---
  async updateSite(siteId, siteData) {
    return await this.request(`/master/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(siteData),
    });
  },

  async updateBuilding(siteId, buildingId, name) {
    return await this.request(`/master/sites/${siteId}/buildings/${buildingId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  async updateDepartment(deptId, deptData) {
    return await this.request(`/master/departments/${deptId}`, {
      method: 'PUT',
      body: JSON.stringify(deptData),
    });
  },

  async updateAccessory(accId, accData) {
    return await this.request(`/master/accessories/${accId}`, {
      method: 'PUT',
      body: JSON.stringify(accData),
    });
  },

  async updateVisitorType(typeId, typeData) {
    return await this.request(`/master/visitor-types/${typeId}`, {
      method: 'PUT',
      body: JSON.stringify(typeData),
    });
  },

  async updateBlacklist(blacklistId, blacklistData) {
    return await this.request(`/security/blacklist/${blacklistId}`, {
      method: 'PUT',
      body: JSON.stringify(blacklistData),
    });
  },

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async getVisitorHistory(fromDate = '', toDate = '') {
    let path = '/visitors/history';
    const params = [];
    if (fromDate) params.push(`from_date=${encodeURIComponent(fromDate)}`);
    if (toDate) params.push(`to_date=${encodeURIComponent(toDate)}`);
    if (params.length > 0) path += `?${params.join('&')}`;

    try {
      const data = await this.request(path);
      return data.visitors || [];
    } catch (error) {
      console.error('Failed to fetch visitor history:', error);
      return [];
    }
  },
};
