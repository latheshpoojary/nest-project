import { CanActivate, ExecutionContext, Injectable, Logger, NestMiddleware, NestModule, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{

    private logger = new Logger();
    constructor(private readonly jwtService:JwtService,private configService:ConfigService){}

    async canActivate(context: ExecutionContext):  Promise<boolean> {
      this.logger.log(AuthGuard.name)
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token){
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
              token,
              {
                secret: this.configService.get('JWT_TOKEN')
              }
            );
           
            
            request.user = payload;
          } catch {
            throw new UnauthorizedException();
          }
          return true;
    }


    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}