import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import DefinitionTag from './DefinitionTag';
import UserToken from './UserToken';
import Word from './Word';
import WordTag from './WordTag';

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

  @OneToMany(() => Word, (word) => word.user)
  words: Word[];

  @OneToMany(() => WordTag, (wordTag) => wordTag.user)
  wordTags: [];

  @OneToMany(() => DefinitionTag, (defTag) => defTag.user)
  defTags: [];
}
