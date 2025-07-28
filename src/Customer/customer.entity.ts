import { CustomerEntity } from "src/moderator/moderator.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("customer_address")
export class CustomerAddressEntity{

    // Address_ID
    @PrimaryGeneratedColumn()
    Address_ID : number;


    // Street
    @Column()
    Street : string;

    // Building
    @Column()
    Building : string;

    // City
    @Column()
    City : string;

    // Country
    @Column()
    Country : string;

    // ZIP
    @Column()
    ZIP : string;

    //  One to One Relationships. One Seller can have only one Address
    @OneToOne(() => CustomerEntity)
    @JoinColumn()
    customer: CustomerEntity;
    
}
