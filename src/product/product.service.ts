import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_REPOSITORY, USER_REPOSITORY } from 'src/core/constants';
import { Product } from './entities/product.entity';
import { FileService } from 'src/core/services/file.service';
import { col, fn, literal, where } from 'sequelize';
import { Op } from 'sequelize';
import { Multer } from 'multer';

import { createReadStream, mkdirSync, readFileSync, unlinkSync, writeFile, writeFileSync } from 'fs';
import * as csv from 'csv-parser';
import { CsvHandlerService } from 'src/core/services/csv.service';
import { Response } from 'express';
import { User } from 'src/user/entities/user.entity';
import { MailHandler } from 'src/Shared/Services/mail.service';
import { MailConfig } from 'src/core/interfaces/mail.interface';
import { Json } from 'sequelize/types/utils';
import { raw } from '@nestjs/mongoose';
import { ExcelService } from 'src/Shared/Services/excel.service';
import { error } from 'console';
import * as path from 'path';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: typeof Product,
    private readonly fileService: FileService,
    private readonly csvService:CsvHandlerService,
    @Inject(USER_REPOSITORY) private readonly userRepository:typeof User,
    private readonly mailService:MailHandler,
    private readonly excelService:ExcelService
  ) {}

  async create(createProductDto: CreateProductDto, request: any, files: any) {
    const fileUrl = await this.fileService.saveFiles(files);
    console.log(request.user);
    
    this.logger.log(ProductService.name,"User Details",request)
    const newProduct = await this.productRepository.create({
      ...createProductDto,
      createdBy: request.user.id,
      images: fileUrl,
      published: false,
    });
    return newProduct;
  }


  async bulk(file:Express.Multer.File,request:any){
    let result =[];
    
      createReadStream(file.path)
      .pipe(csv())
      .on('data',(data)=>result.push({
        ...data,
        createdBy:request.user.id,
        published:false
      }))
      .on('end',async()=>{
         await this.productRepository.bulkCreate(result,{
          returning:true
         }); 
         unlinkSync(file.path)
         
        
      })

      
       
         
    
  }

  async productForUser(
    id: number,
    createProductDto: CreateProductDto,
    files: any,
  ) {

    const user = await this.userRepository.findByPk(id);
    if(!user) return {
      status:"Failed",
      message:"User Not Found"
    }

    const fileUrl = await this.fileService.saveFiles(files);
    
    const newProduct = await this.productRepository.create({
      ...createProductDto,
      images: fileUrl,
      published: false,
      createdBy: id,
    });
    const mailConfig:MailConfig = {
      from:"admin@gmail.com",
      to:user.email,
      subject:"Product is Hosted in the Nodejs Application",
      content:`Admin added the product behalf of you
      
      Product Details:
      ${JSON.stringify(newProduct)}
      `,
    }
    this.mailService.sendMail(mailConfig);
    return newProduct;
  }

  async findAll(page:any,limit:number,sortValue?:string,sortOrder?:string,name?: string,) {
    let result;
    if(name){
      result =  await this.productRepository.findAll({
        offset:(page - 1) * limit, //skip the page
        limit,                     //limit the page
        where: {
          name:{
            [Op.iLike]:`%${name}%` //regex based search
          }
        },
        order:[
          [sortValue,sortOrder]
        ]
      });
    }
    else{
      result = await this.productRepository.findAll({
        offset:(page - 1) * limit,
        limit,
        order:[
          [sortValue,sortOrder]
        ]
      });
    }
    return {
      total:result.length,
      result,
      page
    }
    
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });
    if(!product) return {
      status:"Success",
      message:"Product Not found"
    }
    return product;
  }

  async findPublished() {
    return await this.productRepository.findAll({
      where: {
        published: true,
      },
    });
  }

  async findProductByUser(userId: number) {
    const product =  await this.productRepository.findAll({
      where: {
        createdBy: userId,
      },
    });

    if(product.length === 0) return {
      status:"Success",
      message:"No Product found"
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const [rowAffected, [updatedData]] = await this.productRepository.update(
      {
        ...updateProductDto,
      },
      {
        where: {
          id,
        },
        returning: true,
      },
    );

    return {
      rowAffected,
      updatedData,
    };
  }

  async updateProductForUser(
    productId:number,
    userId: number,
    updateProductDto: UpdateProductDto,
  ) {
    const [rowAffected, [updateProduct]] = await this.productRepository.update(
      {
        ...updateProductDto,
      },
      {
        where: {
          id:productId,
          createdBy: userId,
          
        },
        returning: true,
      },
    );
    if(!rowAffected) throw new NotFoundException()

    return {
      status:"Success",
      message:"Product Updated Successfully",
      updateProduct
    }
  }

  async remove(id: number) {
    const isDeleted = await this.productRepository.destroy({
      where: {
        id,
      },
    });
    if (isDeleted) {
      return {
        status: 'Success',
        message: 'Product Deleted Successfully',
      };
    }
    return {
      status: 'Failed',
      message: 'Failed to delete Product',
    };
  }


  async downloadProducts(response:Response){
    const products = await this.productRepository.findAll({raw:true});
    const csvData = this.csvService.convertToCSV(products);
    writeFileSync('product.csv',csvData)
    return response.download('product.csv')
    
  }

  async getMonthlyReport(response:any){

    const now = new Date();
    // Get first day of current month in UTC
  const startOfMonth = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth()+1,
    1,
    0, 0, 0
  )).toISOString().replace('Z', '+05:30');;

  // Get last day of current month in UTC
  const endOfMonth = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth() + 2,
    0,
    23, 59, 59, 999
  )).toISOString().replace('Z', '+05:30');;
    console.log(startOfMonth,endOfMonth);
    
    const monthlyDetails = await this.productRepository.findAll({
      where:{
        createdAt:{

          [Op.between]:[startOfMonth,endOfMonth]
        },
       
      },
     
      raw:true,
      attributes:[
        'name',
        'description',
        'images',
        'price',
        'rating',


        [
          col('user.name'),
          'created By'
        ]
      ],
      include:{
        model:User,
        attributes:[]
        
      }
    })
    console.log(monthlyDetails,"Monthly Details");
    
    const xlsBuffer = await this.excelService.createExcelSheet(monthlyDetails);
    const dir = './reports';
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const filePath = path.join(dir, `${monthName} Product.xlsx`);
    return response.download(filePath);
    
  }

  async getAnnualReport(){
    const annualReport = await this.productRepository.findAll({
      attributes:[
        [fn('EXTRACT',literal('MONTH FROM "createdAt"')),'month'],
        [fn('COUNT','*'),'count']
      ],
      group:['month'],
      raw:true
    })
    console.log(annualReport,"Annula report");
    
    return {
      status:"Success",
      annualReport
    };
  }
}
