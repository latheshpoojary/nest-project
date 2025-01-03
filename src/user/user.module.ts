import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { usersProviders } from './users.providers';
import { CommonService } from 'src/Shared/Services/common.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from 'src/core/guards/role.guard';
import { AuthGuard } from 'src/core/guards/authentication.guard';

@Module({
  imports:[JwtModule],
  controllers: [UserController],
  providers: [
    UserService,
    ...usersProviders,
    CommonService,
    {
      provide:APP_GUARD,
      useClass:AuthGuard
    }
  ],
  
})
export class UserModule {}
