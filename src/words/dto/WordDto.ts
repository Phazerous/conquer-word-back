import DefinitionDto from './DefinitionDto';
import WordTagDto from './WordTagDto';

export default class WordDto {
  id: number;
  title: string;
  lang: string;
  description: string;
  etymology: string;
  pronunciation: string;
  create_at: Date;
  definitions: DefinitionDto[];
  tags: WordTagDto[];
}
