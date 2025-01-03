import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class CreateUserDto {
    
    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password:string;

    @IsEnum(['ADMIN','USER'])
    role:'ADMIN'|'USER'
}
