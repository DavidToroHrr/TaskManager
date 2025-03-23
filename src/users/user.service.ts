import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel, UserSchema } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()

export class UserService implements UserServiceInterface{
    
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>
    ){}//INYECTAMOS EL MODELO PARA PODER GENERAR UserDocument y así interactuar 
       //CON LA BASE DE DATOS
    
    async create(createUserDto : CreateUserDto): Promise<User> {
        const existingUser=await this.findByEmail(createUserDto.email)
        if (existingUser) {
            throw new Error('User already registred.');
        }
        const saltRounds=10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(createUserDto.password, salt);

// Store hash in your password DB.
        
        const newUser=new this.userModel({
            ...createUserDto,
            password:hash,
        });
        
        const savedUser=await newUser.save();
        return this.mapToUserInterface(savedUser);
    }


    findAll(): Promise<User[]> {//ENCONTRARLOS A TODOS
        throw new Error('Method not implemented.');
        
    }
    findOne(id: string): Promise<User> {
        throw new Error('Method not implemented.');
    }

    async findByEmail(email: string): Promise<User> {//FIND BY ID

        const user=await this.userModel.findOne({email}).lean().exec();
        return user ? this.mapToUserInterface(user) : null; // Devuelve null en lugar de lanzar un error 
    }
    update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        throw new Error('Method not implemented.');
    }
    remove(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    verifyUser(id: string): Promise<User> {//
        throw new Error('Method not implemented.');
    }
    login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User; }> {//HAY QUE HACER UNA BÚSQUEDA DEL USUARIO EN LA BASE DE DATOS
        throw new Error('Method not implemented.');
    }
    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        throw new Error('Method not implemented.');
    }
    changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {//UN PATCH
        throw new Error('Method not implemented.');
    }
    private mapToUserInterface(userDoc: any): User {
        return {
          id: userDoc._id ? userDoc._id.toString() : userDoc.id,
          name: userDoc.username,
          email: userDoc.email,
          createdAt: userDoc.createdAt,
          isVerified: false,
          role: "client",
          updatedAt: null,
        };
    }
}
