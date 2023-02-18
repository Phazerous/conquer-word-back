import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TagsToWord } from './TagsToWord';
import User from './User';
import Word from './Word';

@Entity('word_tag')
export default class WordTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // @Column({
  //   nullable: true,
  // })
  // description: string;

  // @ManyToOne(() => User, (user) => user.wordTags)
  // user: User;

  @OneToMany(() => TagsToWord, (tagsToWord) => tagsToWord.tag)
  tagsToWord: TagsToWord[];
}
