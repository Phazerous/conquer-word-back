import { PrimaryGeneratedColumn, Entity, Column, ManyToOne } from 'typeorm';
import Word from './Word';
import WordTag from './WordTag';

@Entity()
export class TagsToWord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Word, (word) => word.tagsToWord)
  word: Word;

  @ManyToOne(() => WordTag, (wordTag) => wordTag.tagsToWord)
  tag: WordTag;
}
