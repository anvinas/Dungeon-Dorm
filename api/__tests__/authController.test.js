const request = require('supertest');
const app = require('../../server');
const User = require('../auth/authModel');

afterEach(async () => {
    await User.deleteMany({
        $or: [
            {gamerTag: {$in: ['testuser', 'user1', 'uniqueuser', 'loginuser']}},
            {email: {$in: ['test@example.com', 'unique@example.com', 'login@example.com']}}
        ]
    });
});

describe('Auth API - Register', () => {
    it('should return 400 if missing registration fields', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ gamerTag: 'testuser' }); // Missing password and email
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    })
    it('should return 400 if email is already in use', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({gamerTag: 'user1', email: 'test@example.com', password: 'Test1!'});
        
        const response = await request(app)
            .post('/api/auth/register')
            .send({gamerTag: 'user1', email: 'test@example.com', password: 'Test1!'});
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/already in use/i);
    });

    it('should return 200 if registration is successful', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({gamerTag: 'uniqueuser', email: 'unique@example.com', password: 'Test1!'});
        
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBeDefined();
    });
});

describe('Auth API - Login', () => {

    it('should return 400 if missing login fields', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({email: 'test@example.com'});
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({email: 'test@example.com', password: 'wrongpass'});
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should return 200 and a token for valid credentials', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({gamerTag: 'loginuser', email: 'login@example.com', password: 'Test1!'});
        
        const response = await request(app)
            .post('/api/auth/login')
            .send({gamerTag: 'loginuser', email: 'login@example.com', password: 'Test1!'});
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });
});


