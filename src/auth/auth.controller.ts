import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

import { UpperCasePipe } from 'src/Shared/Pipes/uppercase.pipe';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // create(@Body(ValidationPipe) createAuthDto: CreateUserDto) {
  //   return this.authService.register(createAuthDto);
  // }

  @Post('login')
  login(@Body() body:{email:string,password:string}){
    return this.authService.login(body);
    
  }

  
}
