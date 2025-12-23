
import axios from 'axios';

async function testEmergencyAPI() {
    try {
        console.log('Testing Emergency API...');

        // Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            email: 'admin@medisync.com',
            password: 'password123'
        });

        const token = loginRes.data.accessToken;
        console.log('✅ Login successful, token received.');

        const api = axios.create({
            baseURL: 'http://localhost:3000/api/v1',
            headers: { Authorization: `Bearer ${token}` }
        });

        // Test Dashboard
        console.log('Fetching Dashboard...');
        try {
            const dashboard = await api.get('/emergency/dashboard');
            console.log('✅ Dashboard Data:', dashboard.status);
        } catch (e) {
            console.error('❌ Dashboard Failed:', e.response?.status, e.response?.data);
        }

        // Test Critical Patients
        console.log('Fetching Critical Patients...');
        try {
            const patients = await api.get('/emergency/critical-patients');
            console.log('✅ Critical Patients Data:', patients.status);
            console.log('   Count:', patients.data.length);
            if (patients.data.length > 0) {
                console.log('   Sample Patient:', JSON.stringify(patients.data[0], null, 2));
            }
        } catch (e) {
            console.error('❌ Critical Patients Failed:', e.response?.status, e.response?.data);
        }

        // Test Ward Stats
        console.log('Fetching Ward Stats...');
        try {
            const wards = await api.get('/emergency/wards/stats');
            console.log('✅ Ward Stats Data:', wards.status);
        } catch (e) {
            console.error('❌ Ward Stats Failed:', e.response?.status, e.response?.data);
        }

    } catch (error) {
        console.error('Test script error:', error.message);
    }
}

testEmergencyAPI();
