import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import UserToken from './UserToken';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];
}
