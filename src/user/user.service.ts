import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_REPOSITORY } from 'src/core/constants';
import { User } from './entities/user.entity';
import { CommonService } from 'src/Shared/Services/common.service';
import { STATUS_CODES } from 'http';
import { LoggerService } from 'src/modules/logger/logger.service';
import { MailHandler } from 'src/Shared/Services/mail.service';
import { MailConfig } from 'src/core/interfaces/mail.interface';
import { ConfigService } from '@nestjs/config';
import { fn, literal, Op } from 'sequelize';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
    private commonService: CommonService,
    private readonly mailService:MailHandler
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      let mailConfig;
      const isUserExist = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
      if (isUserExist) {
        this.logger.error('User Already Exist', UserService.name);
        throw new ConflictException('User Already Exist');
      }

      const hashedPassword = await this.commonService.hashPassword(
        createUserDto.password,
      );
      const userDetails = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      if (userDetails)
         mailConfig = {
          from:'admin@gmail.com',
          to:userDetails.email,
          subject:"Added to the Nodejs Project",
          content:"You have been assigned to the new"
        }
        this.mailService.sendMail(mailConfig);
        return {
          statusCode: HttpStatus.CREATED,
          message: 'User Created Successfully',
          data: {
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
            createdAt: userDetails.createdAt,
            updatedAt: userDetails.updatedAt,
          },
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
          updatedAt: userDetails.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(error.message, UserService.name);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const [rowAffected] = await this.userRepository.update(
        {
          ...updateUserDto,
        },
        {
          where: {
            id,
          },
          returning: true,
        },
      );
      if (rowAffected) {
        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'User Updated Successfully',
          rowAffected,
        };
      }

      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User Not found',
      };
    } catch (error) {
      this.logger.error(error.message, UserService.name, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    try {
      const rowAffected = await this.userRepository.destroy({
        where: {
          id,
        },
      });
      if (rowAffected) {
        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'User Deleted Successfully',
        };
      }
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User Not Found',
      };
    } catch (error) {
      this.logger.error(error.message, error.stack, LoggerService.name);
    }
  }

  async getMonthlYUser(month:number){
    const now = new Date();
    // Get first day of current month in UTC
  const startOfMonth = new Date(Date.UTC(
    now.getFullYear(),
    month-1,
    1,
    0, 0, 0
  )).toISOString().replace('Z', '+05:30');;

  // Get last day of current month in UTC
  const endOfMonth = new Date(Date.UTC(
    now.getFullYear(),
    month ,
    0,
    23, 59, 59, 999
  )).toISOString().replace('Z', '+05:30');;
    const userList = await this.userRepository.findAll({
      where:{
        createdAt:{
          [Op.between]:[startOfMonth,endOfMonth]
        }
      }
    });
   
    return {
      total:userList.length,
      userList
    };
  }


  async getAnnualUser(){
    const annualReport = await this.userRepository.findAll({
      attributes:[
        [fn('EXTRACT',literal('MONTH FROM "createdAt"')),'month'],
        [fn('COUNT','*'),'count']
      ],
      group:['month']
    })

    return {
      status:"Success",
      annualReport
    }
  }
}
