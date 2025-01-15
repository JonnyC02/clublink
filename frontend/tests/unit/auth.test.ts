import { getToken, isAuthenticated } from '../../src/utils/auth';

describe('Auth Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getToken', () => {
        it('should return the token from localStorage', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

            const token = getToken();

            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(token).toBe('mock-token');
        });

        it('should return null if no token is stored in localStorage', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

            const token = getToken();

            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(token).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return true if a token exists in localStorage', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

            const authenticated = isAuthenticated();

            expect(authenticated).toBe(true);
        });

        it('should return false if no token exists in localStorage', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

            const authenticated = isAuthenticated();

            expect(authenticated).toBe(false);
        });
    });
});