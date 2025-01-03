import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "src/user/entities/user.entity";



@Table({
    timestamps:true
})
export class Product extends Model{

    @PrimaryKey
    @Column({
        autoIncrement:true,
       
    })
    id:number;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    name:string;


    @Column({
        type:DataType.STRING
    })
    description:string;

    @Column({
        type:DataType.BOOLEAN,
        defaultValue:false
    })
    published:boolean;


    @Column({
        type:DataType.ARRAY(DataType.STRING)
    })
    images:string[];

    @Column({
        type:DataType.INTEGER
    })
    price:number;


    @Column({
        type:DataType.INTEGER
    })
    rating:number;

    @ForeignKey(()=>User)
    @Column({
        allowNull:false,
        type:DataType.INTEGER
    })
    createdBy:number;

    @BelongsTo(()=>User)
    user:User
   

}
