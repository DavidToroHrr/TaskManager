import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto, VerifyUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel, UserSchema } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { sendEmailDto } from 'src/email/dto/email.dto';

@Injectable()

export class UserService implements UserServiceInterface{
    
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        private readonly emailService: EmailService
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
        const code= Math.floor(Math.random()*100)
        const dto: sendEmailDto={
            recipients:[createUserDto.email],
            subject:"verification code",
            html:code.toString(),
        }
        await this.emailService.sendEmail(dto)

        // Store hash in your password DB.
        
        const newUser=new this.userModel({
            ...createUserDto,
            password:hash,
            verificationCode:code,
        });
        
        //debemos de enviar el email al user con el code de verificación
        const savedUser=await newUser.save();
        return this.mapToUserInterface(savedUser);
    }


    findAll(): Promise<User[]> {//ENCONTRARLOS A TODOS
        throw new Error('Method not implemented.');
        
    }

    async findOne(id: string): Promise<User> {//ENCONTRAR POR ID
        const user = await this.userModel.findById(id).lean().exec()
  // Manejar el caso en el que no se encuentre el usuario
    if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
    }
    // Transformar el documento a la interfaz User
    return this.mapToUserInterface(user);
    }

    async findOneDocument(id: string):Promise<UserDocument>{//
        const user = this.userModel.findOne({email: id}).exec()
        return user ? user: null;
    
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

    async verifyUser(verifyUserDto: VerifyUserDto): Promise<User> {//verificar email
        const email=verifyUserDto.email 
        const code=verifyUserDto.code
        const reqUser=await this.findOneDocument(email)
         // Manejar el caso en el que el usuario no sea encontrado
        if (!reqUser) {
            throw new NotFoundException(`User with id ${email} not found`);
        }

        if (code!=reqUser.verificationCode) {
            throw new NotFoundException("Error, the verification code doesnt match with the user")
        }

        reqUser.isVerified=true;//DEFINIRLO EN EL SCHEMA
        const savedUser= await reqUser.save()//O PARA NO OBTENER EL OBJETO HACEMOS
                                             //EN .SAVEANDUPDATE DIRECTAMENTE EN ReqUser
        return this.mapToUserInterface(savedUser);
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
        console.log("datos del doc",userDoc); // Verifica qué datos contiene el documento

        return {
            id: userDoc._id ? userDoc._id.toString() : userDoc.id,
            name: userDoc.username,
            email: userDoc.email,
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt,
            isVerified: userDoc.isVerified,
            verificationCode: userDoc.verificationCode,
            role: userDoc.role,
            
        
        };
    }
}
