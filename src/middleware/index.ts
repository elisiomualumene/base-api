import {Request, Response, NextFunction} from "express"
import {verify} from "jsonwebtoken"

// Middleware de autenticação
export function authenticateToken(request: Request, response: Response, next: NextFunction) {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return response.sendStatus(401);
  
    verify(token, 'v12gym', (err: any, user: any) => {
      if (err) return response.sendStatus(403);
      request.user = user;
      next();
    });
  }