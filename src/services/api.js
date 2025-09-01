import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

export const apiService = {
  // Authentication
  async login(email, password) {
    const response = await api.post('/user/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await api.post('/user/register', { name, email, password });
    return response.data;
  },

  // Port Groups
  async getPortGroups() {
    const response = await api.get('/portGroups');
    return response.data;
  },

  async getPortsByCountry(portCode) {
    const response = await api.get(`/portsByCountry/${portCode}`);
    return response.data;
  },

  // Availability
  async searchFlights(searchData) {
    const response = await api.post('/availability', searchData);
    return response.data;
  },

  // Alarms
  async createAlarm(alarmData) {
    const response = await api.post('/user/alarms', alarmData);
    return response.data;
  },

  async getUserAlarms(userId) {
    const response = await api.get(`/user/alarms/${userId}`);
    return response.data;
  },

  async deleteAlarm(alarmId) {
    const response = await api.delete(`/user/alarms/${alarmId}`);
    return response.data;
  }
};