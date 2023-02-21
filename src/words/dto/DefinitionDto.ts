import DefinitionTagDto from './DefinitionTagDto';
import ExampleDto from './ExampleDto';

export default class DefinitionDto {
  text: string;
  part_of_speech: string;
  description: string;
  created_at: Date; // data-string
  tags: DefinitionTagDto[];
  examples: ExampleDto[];
}
