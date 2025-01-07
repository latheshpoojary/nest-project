import { Injectable } from "@nestjs/common";
import {json2csv} from 'json-2-csv';
@Injectable()
export class CsvHandlerService{

    convertToCSV(data:any[]){
        console.log(data,"Data from service");
        
        return json2csv(data)
    }
}