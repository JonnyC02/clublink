import { test, expect, request } from '@playwright/test';

let apiContext;

test.beforeAll(async ({ baseURL }) => {
    apiContext = await request.newContext({ baseURL });
});

test.afterAll(async () => {
    await apiContext.dispose();
});

// test.describe('API Tests - GET /clubs', () => {

//   test('should return a list of clubs', async () => {
//     const response = await apiContext.get('/clubs/popular');
//     expect(response.status()).toBe(200);

//     const clubs = await response.json();
//     expect(clubs).toEqual([{ name: 'Chess Club' }, { name: 'Programming Club' }]);
//   });
// });

test.describe('API Tests - GET /health', () => {
    test('should return 200', async () => {
        const response = await apiContext.get('/health');
        expect(response.status()).toBe(200)

        const message = await response.json();
        expect(message).toEqual({ message: "Health Check!" });
    })
})

test.describe('API Tests - GET /universities', () => {
    test.skip('should return 200', async () => {
        const response = await apiContext.get('/universities')
        expect(response.status()).toBe(200)

        const data = await response.json();
        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBeGreaterThanOrEqual(1)
    })
})