import { IsNotEmpty, IsString } from "class-validator";

export class CustomerAddressDTO{

    // Address_ID
    @IsNotEmpty({ message: 'Address ID cannot be empty or null' })
    Address_ID : number;


    // Street
    @IsNotEmpty({ message: 'Seller Street Address cannot be empty or null' })
    @IsString({ message: 'Street should be a string' })
    Street : string;

    // Building
    @IsString({ message: 'Building should be a string' })
    Building : string;

    // City
    @IsNotEmpty({ message: 'Seller City Address cannot be empty or null' })
    @IsString({ message: 'City should be a string' })
    City : string;

    // Country
    @IsNotEmpty({ message: 'Seller Country Address cannot be empty or null' })
    @IsString({ message: 'Country should be a string' })
    Country : string;

    // ZIP
    @IsNotEmpty({ message: 'Seller ZIP Address cannot be empty or null' })
    ZIP : string;

}


export class MailDTO{
    Email : string;
    Subject : string;
    Message : string;
}