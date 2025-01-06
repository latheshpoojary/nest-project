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
import { PRODUCT_REPOSITORY } from 'src/core/constants';
import { Product } from './entities/product.entity';
import { FileService } from 'src/core/services/file.service';
import { where } from 'sequelize';
import { Op } from 'sequelize';
import { Multer } from 'multer';

import { createReadStream, readFileSync } from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: typeof Product,
    private readonly fileService: FileService,
  ) {}

  async create(createProductDto: CreateProductDto, request: any, files: any) {
    const fileUrl = await this.fileService.saveFiles(files);
    console.log(fileUrl);

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
        const rowAffected = await this.productRepository.bulkCreate(result,{
          returning:true
         }); 

         return {
          rowAffected
          
         }
        
      })

       
         
    
  }

  async productForUser(
    id: number,
    createProductDto: CreateProductDto,
    files: any,
  ) {
    const fileUrl = await this.fileService.saveFiles(files);
    const newProduct = await this.productRepository.create({
      ...createProductDto,
      images: fileUrl,
      published: false,
      createdBy: id,
    });
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
    return await this.productRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findPublished() {
    return await this.productRepository.findAll({
      where: {
        published: true,
      },
    });
  }

  async findProductByUser(userId: number) {
    return await this.productRepository.findAll({
      where: {
        createdBy: userId,
      },
    });
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
}
