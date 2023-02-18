import TagDto from './TagDto';

export default class WordDto {
  title: string;
  lang?: string;
  description?: string;
  etymology?: string;
  pronunciation?: string;
  tags?: TagDto[];
}
