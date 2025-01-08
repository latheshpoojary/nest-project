import { ConsoleLogger, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path'
import {promises as fsPromise} from 'fs'
@Injectable()
export class LoggerService extends ConsoleLogger {

  async logToFile(entry: any,fileType:string) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(new Date())}\t${entry}\n`;

    try {
        
      
      const currentDirectory = process.cwd();

        if(!fs.existsSync(path.join(currentDirectory,'src','logs'))){
            console.log("is it not exist");
            
            await fsPromise.mkdir(path.join(currentDirectory,'src','logs'));
        }
        await fsPromise.appendFile(
          path.join(currentDirectory,'src','logs',fileType),
            formattedEntry
            
        )

    } catch (error) {
        console.log(error);
        
    }

  }

  log(message:any,context?:string){
    const entry = `${context}\t${message}`;
    this.logToFile(entry,'myLogFile.log');
    super.log(message,context);

    
  }

  error(message: any,Context?: string,stack?:string) {
    const entry = `${message}\t${Context}\t${stack}`;
    this.logToFile(entry,'errorLog.log');
    super.error(message, Context);
  }
}
