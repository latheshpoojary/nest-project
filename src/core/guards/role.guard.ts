import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { Role } from "../enums/role.enum";
import { ROLES_KEY } from "../constants";

@Injectable()
export class RoleGuard implements CanActivate{
    private logger = new Logger();
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext):boolean {
        this.logger.log(RoleGuard.name)
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
          ]);
          if (!requiredRoles) {
            return true;
          }
          const { user } = context.switchToHttp().getRequest();
          console.log(user.role);
          
          
          return requiredRoles.some((role) => user.role?.includes(role));
    }
        
}