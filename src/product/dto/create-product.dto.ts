import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator";




export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsString()
    description:string


    @IsNotEmpty()
    @IsDecimal({
        decimal_digits:'2',
        
    },
{
    message:"Price is Incorrect"
})
    price:number;


    @IsNotEmpty()
    @IsNumber({
        
    },{
        message:"Rating is Incorrect"
    })
    rating:number;


}
