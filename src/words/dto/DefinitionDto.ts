import DefinitionTagDto from './DefinitionTagDto';
import ExampleDto from './ExampleDto';
import WordDto from './WordDto';

export default class DefinitionDto {
  id: number;
  text: string;
  part_of_speech: string;
  description: string;
  create_at: Date; // data-string
  tags: DefinitionTagDto[];
  word: WordDto;
  examples: ExampleDto[];
}
