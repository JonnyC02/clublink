/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import { authenticateToken, getUserId } from '../../src/utils/authentication';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SECRET_KEY = 'testingsecret';

jest.mock('jsonwebtoken');

describe('Authentication Utils', () => {
    describe('authenticateToken', () => {
        let req: Partial<Request>;
        let res: Partial<Response>;
        let next: NextFunction;

        beforeEach(() => {
            req = {
                headers: {
                    authorization: ''
                },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        beforeAll(() => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });
        
        afterAll(() => {
            jest.restoreAllMocks();
        });
        

        it('should return 401 if no token is provided', async () => {
            await authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Access Token Required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 if the token is invalid', async () => {
            req.headers = req.headers || {};
            req.headers['authorization'] = 'Bearer invalidtoken';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError('Invalid Token');
            });

            await authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 if the token is expired', async () => {
            req.headers = req.headers || {};
            req.headers['authorization'] = 'Bearer expiredtoken';
        
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.TokenExpiredError('Token has expired', new Date());
            });
        
            await authenticateToken(req as Request, res as Response, next);
        
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
            expect(next).not.toHaveBeenCalled();
        });        

        it('should return 403 if the token structure is invalid', async () => {
            req.headers = req.headers || {};
            req.headers['authorization'] = 'Bearer validtoken';

            (jwt.verify as jest.Mock).mockReturnValue({ invalid: 'structure' });

            await authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token Structure' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if the token is valid', async () => {
            req.headers = req.headers || {};
            req.headers['authorization'] = 'Bearer validtoken';

            (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'test@example.com' });

            await authenticateToken(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect((req as any).user).toEqual({ id: 1, email: 'test@example.com' });
        });

        it('should rturn 401 if there\'s no auth header', async () => {
            req.headers = {};

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.TokenExpiredError('Token has expired', new Date());
            });
        
            await authenticateToken(req as Request, res as Response, next);
        
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Access Token Required' });
            expect(next).not.toHaveBeenCalled();        
        })

        it('should rturn 401 if malformed auth header', async () => {
            req.headers = req.headers || {};
            req.headers['authorization'] = 'validtoken';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.TokenExpiredError('Token has expired', new Date());
            });
        
            await authenticateToken(req as Request, res as Response, next);
        
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Access Token Required' });
            expect(next).not.toHaveBeenCalled();        
        })

        it('should return 403 if the token is signed with a different secret', async () => {
            req.headers = req.headers || {};
            req.headers.authorization = 'Bearer tokenWithDifferentSecret';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError('invalid signature');
            });

            await authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token' });
            expect(next).not.toHaveBeenCalled();
        });
    });
    
    describe('getUserId', () => {
        it('should return undefined if no token is provided', () => {
            const result = getUserId(undefined);

            expect(result).toBeUndefined();
        });

        it('should return undefined if the token is invalid', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError('Invalid Token');
            });

            const result = getUserId('Bearer invalidtoken');

            expect(result).toBeUndefined();
        });

        it('should return undefined if the token is empty', () => {
            const result = getUserId('');

            expect(result).toBeUndefined();
        });

        it('should return undefined if the token structure is invalid', () => {
            (jwt.verify as jest.Mock).mockReturnValue({ invalid: 'structure' });

            const result = getUserId('Bearer validtoken');

            expect(result).toBeUndefined();
        });

        it('should return the user ID if the token is valid', () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'test@example.com' });

            const result = getUserId('Bearer validtoken');

            expect(result).toBe(1);
        });

        it('should handle tokens signed with a different secret gracefully', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError('invalid signature');
            });

            const result = getUserId('Bearer tokenWithDifferentSecret');

            expect(result).toBeUndefined();
        });
    });
});