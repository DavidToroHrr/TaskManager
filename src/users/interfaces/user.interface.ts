import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  VerifyUserDto,
} from '../dto/user.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;//LO AGREGUÉ
  role: string;//???
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  verificationCode: string,//LO AGREGUÉ
}

export interface UserServiceInterface {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
  verifyUser(verifyUserDto:VerifyUserDto): Promise<User>;//DEBEMOS DE DEFINIR EL EMAIL PARA 
                                        //OBTENER EL CODE DEL USUARIO
                                        //Y ASÍ COMPARARLO CON EL INPUT
                                        //QUE ESCRIBA EL USUARIO
                                        //DEBEMOS DE DEFINIR UN CAMPO
                                        //PARA EL CODE
  login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }>;
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void>;
}
