import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import { where } from 'sequelize';
import { USER_REPOSITORY } from 'src/core/constants';
import { CommonService } from 'src/Shared/Services/common.service';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository:typeof User,
    private readonly jwtService: JwtService,
    private commonService: CommonService,
  ) {}
  // async register(createAuthDto: CreateUserDto) {
  //   const isUserExist = await this.userModel.findOne({
  //     email: createAuthDto.email,
  //   });

  //   if (isUserExist) throw new ConflictException('User Already Exist');

  //   const hashedPassword = await this.commonService.hashPassword(
  //     createAuthDto.password,
  //   );
  //   const body = {
  //     ...createAuthDto,
  //     password: hashedPassword,
  //   };
  //   const newUser = new this.userModel(body);
  //   const userDetails = await newUser.save();
  //   console.log(userDetails, 'userDetails');

  //   const payload = { id: userDetails._id, role: userDetails.role };
  //   return {
  //     access_token: await this.jwtService.signAsync(payload),
  //   };
  // }

  async login(body: { email: string; password: string }) {
    const isUserExist = await this.userRepository.findOne({
      where:{
        email:body.email
      }
    });

    if (!isUserExist)
      throw new NotFoundException('Email or Password is Incorrect');

    const isValidPassword = await this.commonService.matchPassword(
      body.password,
      isUserExist.dataValues.password,
    );
    if (!isValidPassword)
      throw new NotFoundException('Email or Password is Incorrect');
   
    
    const payload = {
      id: isUserExist.id, role: isUserExist.role
    }
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
