import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { TagsToDefinition } from './TagsToDefinition';
import User from './User';

@Entity()
export default class DefinitionTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  description: string;

  @ManyToOne(() => User, (user) => user.defTags)
  user: User;

  @OneToMany(() => TagsToDefinition, (tagsToDefinition) => tagsToDefinition.tag)
  tagsToDefinition: TagsToDefinition[];
}
