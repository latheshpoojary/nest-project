import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  Query,
  Put,
  ValidationPipe,
  DefaultValuePipe,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request, Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { Roles } from 'src/core/decorators/role.decorator';
import { Role } from 'src/core/enums/role.enum';
import { RoleGuard } from 'src/core/guards/role.guard';
import { AuthGuard } from 'src/core/guards/authentication.guard';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('product')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('product_img'))
  create(
    @UploadedFiles(
      new ParseFilePipeBuilder()

        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.CONFLICT,
        }),
    )
    file: Array<Express.Multer.File>,
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @Req() request: Request,
  ) {
    console.log("called in productcontroller create");
    
    
    return this.productService.create(createProductDto, request, file);
  }

 

  @Post('bulk')
  @UseInterceptors(FileInterceptor('products'))
  productBulk(@UploadedFile() file:Express.Multer.File,@Req() request:Request){

    return this.productService.bulk(file,request);
  }

  @Get('report')
  getAnnualReport(){
   return this.productService.getAnnualReport();
  }
  


  @Post(':userId')
  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @UseInterceptors(FilesInterceptor('product_img'))
  createProductForUser(@Param('userId',ParseIntPipe) userId:number , @UploadedFiles(
    new ParseFilePipeBuilder()

      .addMaxSizeValidator({
        maxSize: 10 * 1024 * 1024,
      })
      .build({
        errorHttpStatusCode: HttpStatus.CONFLICT,
      }),
  )
  files: Array<Express.Multer.File>,@Body() productDto:CreateProductDto){
    console.log("Body",productDto);
    
      return this.productService.productForUser(userId,productDto,files);
  }

  @Get()
  findAll(@Query() query : ProductQueryDto) {
    const {page,limit,name,sortValue,sortOrder} = query;
    return this.productService.findAll(+page,limit,sortValue,sortOrder,name);
  }


  @Get('download')
  downloadProducts(@Res() response:Response){
    this.productService.downloadProducts(response);
  }

  @Get('published')
  findPublished() {
    return this.productService.findPublished();
  }

  @Get('user/:userId')
  findProductByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.productService.findProductByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Put(':id/:userId')
  updateUserProduct(@Param('userId',ParseIntPipe) userId:number,@Param('id',ParseIntPipe) productId:number,@Body(ValidationPipe) updateProduct :UpdateProductDto){
    return this.productService.updateProductForUser(productId,userId,updateProduct)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }


  

  
}
