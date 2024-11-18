// MessageChunk.ts
import { Note } from './Note';

export interface MessageChunk {
  id?: number;
  text: string;
  keycloakSubject: string;
  note: Note;
}
