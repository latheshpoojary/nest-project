import { Type } from "class-transformer";
import { IsOptional, Min,IsInt, IsString, IsIn } from "class-validator";



export class ProductQueryDto{
    @Type(()=>Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    page:number = 1

    @Type(()=>Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    limit:number = 1;


    @IsOptional()
    @IsString()
    sortValue? :string;


    @IsOptional()
    @IsString()
    @IsIn(['ASC','DESC'])
    sortOrder? :string;


    @IsOptional()
    @IsString()
    name?:string;


}
