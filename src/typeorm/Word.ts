import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Definition from './Definition';
import { TagsToWord } from './TagsToWord';
import User from './User';

@Entity()
export default class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  lang: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    nullable: true,
  })
  etymology: string;

  @Column({
    nullable: true,
  })
  pronunciation: string;

  @CreateDateColumn()
  create_at: Date;

  @ManyToOne(() => User, (user) => user.words)
  user: User;

  @OneToMany(() => Definition, (definition) => definition.word)
  definitions: Definition[];

  @OneToMany(() => TagsToWord, (tagsToWord) => tagsToWord.word)
  tagsToWord: TagsToWord[];
}
