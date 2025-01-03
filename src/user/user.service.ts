import { ConflictException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_REPOSITORY } from 'src/core/constants';
import { User } from './entities/user.entity';
import { CommonService } from 'src/Shared/Services/common.service';
import { STATUS_CODES } from 'http';

@Injectable()
export class UserService {

  constructor(@Inject(USER_REPOSITORY) private readonly userRepository:typeof User,private commonService:CommonService){}
  async  create(createUserDto: CreateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where:{
        email:createUserDto.email
      }
    })
    if(isUserExist) throw new ConflictException('User Already Exist');
    
    const hashedPassword = await this.commonService.hashPassword(createUserDto.password);
    const userDetails = await this.userRepository.create({
      ...createUserDto,
      password:hashedPassword
    });
    if(userDetails) return  {
      statusCode: HttpStatus.CREATED,
      message: 'User Created Successfully',
      data: {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        createdAt: userDetails.createdAt,
        updatedAt: userDetails.updatedAt
      }
    };
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed To create User',
      data: {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        createdAt: userDetails.createdAt,
        updatedAt: userDetails.updatedAt
      }
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const [rowAffected] = await this.userRepository.update({
      ...updateUserDto
    },
    {
      where:{
        id
      },
      returning:true
    }
  )
  if(rowAffected){
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'User Updated Successfully',
      rowAffected
     
    };
  }
    
  return {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'User Not found',
    
   
  };
  }

  async remove(id: number) {
    const rowAffected = await this.userRepository.destroy({
      where:{
        id
      }
    })
    if(rowAffected){
      return {
        statusCode:HttpStatus.ACCEPTED,
        message:"User Deleted Successfully"
      }
    }
    return  {
      statusCode:HttpStatus.NOT_FOUND,
      message:"User Not Found"
    };
  }
}
