import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TagsToWord } from './TagsToWord';

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

  // @ManyToOne(() => User, (user) => user.words)
  // user: User;

  @OneToMany(() => TagsToWord, (tagsToWord) => tagsToWord.word)
  tagsToWord: TagsToWord[];
}
