import { PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import Definition from './Definition';
import DefinitionTag from './DefinitionTag';

@Entity()
export class TagsToDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Definition, (definition) => definition.tagsToDefinition)
  definition: Definition;

  @ManyToOne(
    () => DefinitionTag,
    (definitionTag) => definitionTag.tagsToDefinition,
  )
  tag: DefinitionTag;
}
