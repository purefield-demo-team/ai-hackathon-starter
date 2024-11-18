import { UserProfile } from './UserProfile';
import { Goal } from './Goal';
import { Tag } from './Tag';
import { Task } from './Task';
import { Note } from './Note';
import { MessageChunk } from './MessageChunk';

export interface GPTAssessment {
    id?: number;
    assessment?: string;
    customQuestion: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    name: string;
    createDate: string;
    userProfile?: UserProfile;
    goal?: Goal;
    tags: Tag[];
    tasks: Task[];
    notes: Note[];
    messageChunks: MessageChunk[];
}
  