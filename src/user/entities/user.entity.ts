
import {  Column, DataType, HasMany, Model, PrimaryKey, Table} from 'sequelize-typescript';
import { Product } from 'src/product/entities/product.entity';

@Table({
    timestamps: true
})
export class User extends Model{

    @PrimaryKey
    @Column({
        autoIncrement:true,
    })
    id: number;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    name:string;

    @Column({
        type:DataType.STRING,
        allowNull:false,
    })
    email:string;

    @Column({
        type:DataType.STRING
    })
    password:string;

    @Column({
        type:DataType.ENUM('ADMIN','USER')
    })
    role:'ADMIN'|'USER'

    @HasMany(()=>Product)
    product:Product;
}
