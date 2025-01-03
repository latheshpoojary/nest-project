import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonService } from 'src/Shared/Services/common.service';
import { usersProviders } from 'src/user/users.providers';
import { AppModule } from 'src/app.module';

@Module({
  imports:[
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:async (configService:ConfigService)=>({
        global:true,
        secret:configService.get<string>('JWT_TOKEN'),
        signOptions:{expiresIn:configService.get<string>('JWT_EXPIRE')}
      })
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,CommonService,...usersProviders],
  
})
export class AuthModule {}
