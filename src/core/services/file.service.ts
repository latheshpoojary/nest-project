import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { join } from "path";

@Injectable()
export class FileService {

    async saveFiles(files:Array<Express.Multer.File> ):Promise<string[]>{
        try {
            
            const filesUrl = files.map(file=>
                `${process.env.APP_URL}/uploads/${file.filename}`
            )
            return filesUrl
        } catch (error) {
            throw new InternalServerErrorException("Failed to save files");
        }
    }

    getFilePath(filename: string): string {
        return join(process.cwd(), 'uploads', filename);
      }
}