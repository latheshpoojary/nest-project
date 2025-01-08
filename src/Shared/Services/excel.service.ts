import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

@Injectable()
export class ExcelService {
  async createExcelSheet(data: any) {
    console.log(data);

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const workBook = new Workbook();
    const workSheet = workBook.addWorksheet(`${monthName} Report`);
    workSheet.columns = [
      {
        header: 'Sl.No',
        key: 'i',
      },
      {
        header: 'Name',
        key: 'name',
      },
      {
        header: 'Description',
        key: 'description',
      },
      {
        header: 'Url',
        key: 'images',
      },
      {
        header: 'Price',
        key: 'price',
      },
      {
        header: 'Rating',
        key: 'rating',
      },
      {
        header: 'Created By',
        key: 'created By',
      },
    ];
    data.forEach((product, i) => {
      workSheet.addRow({
        ...product,
        i:i+1,
      });
    });

    // Define the file path
    const dir = './reports';
    const filePath = path.join(dir, `${monthName} Product.xlsx`);

    // Check if the directory exists; if not, create it
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true }); // Create directories recursively
    }
    await workBook.xlsx.writeFile(filePath);

    return workBook;
  }
}
