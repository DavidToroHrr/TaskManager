import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User, UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto, VerifyUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel, UserSchema } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { sendEmailDto } from 'src/email/dto/email.dto';
import cryptoRandomString from 'crypto-random-string';

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

        const hashedPassword = await this.encryptPassword(createUserDto.password,10)

        const code =this.generateVerificationCode();

        const dto: sendEmailDto={
            recipients:[createUserDto.email],
            subject:"verification code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
                <p>Hola ${createUserDto.name},</p>
                <p>Gracias por registrarte. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${code}
                </div>
                <p>Este código expirará en 15 minutos.</p>
                <p>Si no has solicitado este código, por favor ignora este correo.</p>
                <p>Saludos,<br>El equipo de soporte</p>
            </div>
          `,
        }
        await this.emailService.sendEmail(dto)

        // Store hash in your password DB.
        
        const newUser=new this.userModel({
            ...createUserDto,
            password:hashedPassword,
            verificationCode:code,
        });
        
        //debemos de enviar el email al user con el code de verificación
        const savedUser=await newUser.save();

        return this.mapToUserInterface(savedUser);
        
    }

    
    generateVerificationCode(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    async findAll(): Promise<User[]> {//ENCONTRARLOS A TODOS
        const users=await this.userModel.find().exec()   
        return users.map(user=>this.mapToUserInterface(user))
    }

    async findOne(id: string): Promise<User> {//ENCONTRAR POR ID
        const user = await this.userModel.findById(id).exec()
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
        const user=await this.userModel.findOne({email}).exec();
        return  user ? this.mapToUserInterface(user) : null; // Devuelve null en lugar de lanzar un error 
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const userUpdated= await this.userModel.findByIdAndUpdate(id,updateUserDto,{new:true});
        if (!userUpdated) {
            throw new NotFoundException("Error, the user doesnt found...")
        }
        return this.mapToUserInterface(userUpdated)
    }


    async remove(id: string): Promise<void> {
        const result=await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Error, the user with id: ${id}, doesnt exists`)
        }
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
                                             //EN .findByIdAndUpdate DIRECTAMENTE EN ReqUser
        return this.mapToUserInterface(savedUser);
    }

    login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User; }> {//HAY QUE HACER UNA BÚSQUEDA DEL USUARIO EN LA BASE DE DATOS
        throw new Error('Method not implemented.');
    }

    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        throw new Error('Method not implemented.');
    }
    
    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {//UN PATCH
        const reqUser=await this.userModel.findById(id).exec()

        
        if (!reqUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        const match= await bcrypt.compare(changePasswordDto.currentPassword,reqUser.password)//PARA COMPARAR LA CONTRASEÑA INGRESADA CON LA ENCRIPTADA
        if (!match) {
            throw new UnauthorizedException("error... the password entered doesnt match")
        }
        const hashedPassword=await this.encryptPassword(changePasswordDto.newPassword,10)
        reqUser.password=hashedPassword
        await reqUser.save()
        
    }
    
    async encryptPassword(password: string, saltRounds: number): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }

    private mapToUserInterface(userDoc: any): User {
        console.log("datos del doc",userDoc); // Verifica qué datos contiene el documento

        return {
            id: userDoc._id ? userDoc._id.toString() : userDoc.id,
            name: userDoc.name,
            email: userDoc.email,
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt,
            isVerified: userDoc.isVerified,
            verificationCode: userDoc.verificationCode,
            role: userDoc.role,
            password:userDoc.password,
            refreshToken:userDoc.refreshToken
        };
    }
}
