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
import { LoggerModule } from './modules/logger/logger.module';
import { MailerModule } from '@nestjs-modules/mailer';


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
    LoggerModule,
    AuthModule,
    DatabaseModule,
    UserModule,
    ProductModule,
    MailerModule.forRootAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory:async (configService:ConfigService)=>({
          transport:{
            host:configService.get('MAIL_HOST'),
            auth:{
              user:configService.get('MAIL_USER'),
              pass:configService.get('MAIL_SECRET')
            },
            port:configService.get('MAIL_PORT')
          }

        })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}

