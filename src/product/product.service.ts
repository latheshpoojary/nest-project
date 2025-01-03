import {
  Inject,
  Injectable,
  Logger,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_REPOSITORY } from 'src/core/constants';
import { Product } from './entities/product.entity';
import { FileService } from 'src/core/services/file.service';
import { where } from 'sequelize';

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

  async productForUser(id:number,createProductDto:CreateProductDto,files:any){
    const fileUrl = await this.fileService.saveFiles(files);
    const newProduct = await this.productRepository.create({
      ...createProductDto,
      images:fileUrl,
      published:false,
      createdBy:id
    })
    return newProduct;
  }

  async findAll(name?:string) {
    return await this.productRepository.findAll({
      where:{
        name
      }
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findPublished(){
    return await this.productRepository.findAll({
      where:{
        published:true
      }
    })
  }


  async findProductByUser(userId:number){
    return await this.productRepository.findAll({
      where:{
        createdBy:userId
      }
    })
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
   const [rowAffected,[updatedData]]= await this.productRepository.update(
      {
        ...updateProductDto,
      },
      {
        where: {
          id,
        },
        returning: true
      },
      
    );

    return {
      rowAffected,
      updatedData
    }
  }

  async remove(id: number) {
    const isDeleted = await this.productRepository.destroy({
      where:{
        id
      }
    })
    if(isDeleted){
      return {
        status:"Success",
        message:"Product Deleted Successfully"
      }
    }
    return {
      status:"Failed",
      message:"Failed to delete Product"
    }
  }
}
