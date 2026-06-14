import axios from 'axios';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import authRoutes from '../src/routes/authRoutes.js';
import urlRoutes from '../src/routes/urlRoutes.js';
import { handleRedirect } from '../src/controllers/redirectController.js';
import { errorHandler } from '../src/middleware/errorMiddleware.js';

dotenv.config();

// Custom test configuration
const TEST_PORT = 5001;
const TEST_API = `http://localhost:${TEST_PORT}`;

const runTests = async () => {
  console.log('🧪 Starting Automated API Integration Tests...');

  // 1. Boot up test instance of Express server
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/urls', urlRoutes);
  app.get('/:shortCode', handleRedirect);
  app.use(errorHandler);

  let server;
  try {
    // Connect to DB
    await connectDB();
    
    server = app.listen(TEST_PORT, () => {
      console.log(`📡 Test server listening on port ${TEST_PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start test server:', err.message);
    process.exit(1);
  }

  let testUserToken = '';
  let createdShortCode = '';
  let createdUrlId = '';

  const testEmail = `test-${Date.now()}@trimr.com`;
  const testPassword = 'testpassword123';

  try {
    // Test 1: User Signup
    console.log('👉 Testing User Registration (/api/auth/signup)...');
    const signupRes = await axios.post(`${TEST_API}/api/auth/signup`, {
      name: 'Tester User',
      email: testEmail,
      password: testPassword,
    });

    if (signupRes.status === 201 && signupRes.data.token) {
      testUserToken = signupRes.data.token;
      console.log('✅ Registration Passed! JWT Token issued.');
    } else {
      throw new Error('User signup failed to return token');
    }

    // Test 2: User Login
    console.log('👉 Testing User Login (/api/auth/login)...');
    const loginRes = await axios.post(`${TEST_API}/api/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    if (loginRes.status === 200 && loginRes.data.token) {
      console.log('✅ Login Passed!');
    } else {
      throw new Error('User login failed');
    }

    // Test 3: Create Short URL
    console.log('👉 Testing URL Shortening (POST /api/urls)...');
    const shortenRes = await axios.post(
      `${TEST_API}/api/urls`,
      {
        originalUrl: 'https://github.com',
        customAlias: `test-git-${Date.now()}`,
        isPublicStats: true,
      },
      {
        headers: { Authorization: `Bearer ${testUserToken}` },
      }
    );

    if (shortenRes.status === 201 && shortenRes.data.shortCode) {
      createdShortCode = shortenRes.data.shortCode;
      createdUrlId = shortenRes.data._id;
      console.log(`✅ URL Shortening Passed! Short code: ${createdShortCode}`);
    } else {
      throw new Error('Shortening failed');
    }

    // Test 4: Access Redirection Route
    console.log(`👉 Testing Short URL Redirect (GET /${createdShortCode})...`);
    // Avoid automatically following redirect so we can assert the 302 code
    const redirectRes = await axios.get(`${TEST_API}/${createdShortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    });

    if (redirectRes.status === 302) {
      console.log(`✅ Redirect Route Passed! HTTP 302 pointing to: ${redirectRes.headers.location}`);
    } else {
      throw new Error('Redirection failed to respond with 302');
    }

    // Test 5: Verify Link Analytics
    console.log(`👉 Testing Link Analytics (GET /api/urls/${createdUrlId}/analytics)...`);
    const analyticsRes = await axios.get(`${TEST_API}/api/urls/${createdUrlId}/analytics`);

    if (analyticsRes.status === 200 && analyticsRes.data.summary.totalClicks > 0) {
      console.log(`✅ Analytics Passed! Clicks tracked: ${analyticsRes.data.summary.totalClicks}`);
    } else {
      throw new Error('Analytics log retrieval failed or click count is 0');
    }

    console.log('🎉 All integration tests passed successfully!');
    server.close(() => {
      console.log('🔌 Test server shut down.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Test failed! Error details:', error.response?.data || error.message);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
};

runTests();
