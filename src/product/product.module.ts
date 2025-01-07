import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/core/guards/authentication.guard';
import { productProvider } from './product.provider';
import { AppModule } from 'src/app.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileService } from 'src/core/services/file.service';
import csvParser from 'csv-parser';
import {  CsvHandlerService } from 'src/core/services/csv.service';

@Module({
  imports:[JwtModule,
    MulterModule.register({
      storage:diskStorage({
        destination:'./uploads',
        filename:(req,file,callback)=>{
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null,`${uniqueSuffix}${file.originalname}`);

        }
      })
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService,
    FileService,
    // {
    //   provide:APP_GUARD,
    //   useClass:AuthGuard
    // },
    ...productProvider,
    AuthGuard,
    CsvHandlerService
  ],
})
export class ProductModule {}
