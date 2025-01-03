import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { get } from 'http';
import { Roles } from 'src/core/decorators/role.decorator';
import { Role } from 'src/core/enums/role.enum';
import { RoleGuard } from 'src/core/guards/role.guard';

@Controller('product')
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
    @Body() createProductDto: CreateProductDto,
    @Req() request: Request,
  ) {
    return this.productService.create(createProductDto, request, file);
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
  findAll(@Query('name') name?: string) {
    return this.productService.findAll(name);
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
