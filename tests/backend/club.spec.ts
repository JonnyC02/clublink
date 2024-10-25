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