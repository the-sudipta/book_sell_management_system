import { AdminEntity } from "src/Administrator/administrator.entity";
import { AddressEntity, SellerCustomerBookEntity } from "src/Seller/seller.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('moderator')
export class ModeratorEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name:string;
    @Column()
    email:string;
    @Column()
    password:string;

    @ManyToOne(()=> AdminEntity)
    admin: AdminEntity;
}


@Entity('customer')
export class CustomerEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name:string;
    @Column()
    email:string;
    @Column()
    password:string;
    @OneToMany(()=>SellerCustomerBookEntity, sell_cust_book=>sell_cust_book.seller)
    sell_cust_book: SellerCustomerBookEntity[];
}