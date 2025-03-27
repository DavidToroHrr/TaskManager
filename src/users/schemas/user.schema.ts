import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema({
  timestamps: true, // Esto añadirá automáticamente createdAt y updatedAt
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class UserModel {
  @Prop({ required: true })
  name: string;

  @Prop({required:true,unique:true})
  email: string;

  @Prop({required:true})
  password: string;

  @Prop({required:false})
  verificationCode: string;//TUVE QUE AGREGARLO

  @Prop({required:false, default:false})
  isVerified: boolean//TUVE QUE AGREGARLO

  @Prop({required:false, default:false})
  role: string//TUVE QUE AGREGARLO

  @Prop() 
  refreshToken: string;

  @Prop({ required: false })
  verificationCodeExpiresAt: Date;  //Ponemos nuevo campo para la expiración del code 



}

export const UserSchema = SchemaFactory.createForClass(UserModel);
