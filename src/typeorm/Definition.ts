import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Example from './Example';
import { TagsToDefinition } from './TagsToDefinition';
import Word from './Word';

@Entity()
export default class Definition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    nullable: true,
  })
  part_of_speech: string;

  @CreateDateColumn()
  create_at: Date;

  @ManyToOne(() => Word, (word) => word.definitions)
  word: Word;

  @OneToMany(() => Example, (example) => example.definition)
  examples: Example[];

  @OneToMany(
    () => TagsToDefinition,
    (tagsToDefinition) => tagsToDefinition.definition,
  )
  tagsToDefinition: TagsToDefinition[];
}
