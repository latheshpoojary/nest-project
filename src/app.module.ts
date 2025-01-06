import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './core/database/database.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './core/services/schedule.service';


@Module({
  imports: [
    
    ConfigModule.forRoot({isGlobal:true}),
    // MongooseModule.forRootAsync({
    //   imports:[ConfigModule],
    //   inject:[ConfigService],
    //   useFactory: async (configService:ConfigService)=>({
    //     uri:configService.get('MONGO_URL'),
    //     then:console.log("connected successfully"),
    //   })
    // }),
    
    ScheduleModule.forRoot(),

  
   
    AuthModule,
   
    DatabaseModule,
   
    UserModule,
   
    ProductModule
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}

