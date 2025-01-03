import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {hash,compare} from 'bcrypt';

@Injectable()
export class CommonService {

    constructor(private readonly configService:ConfigService){}

    async hashPassword(password:string){
        const saltOrRounds = parseInt(this.configService.get('SALT'));
        
        return await hash(password,saltOrRounds)
    }

    async matchPassword(password:string,hashedPassword:string){
        return await compare(password,hashedPassword)
    }
}
