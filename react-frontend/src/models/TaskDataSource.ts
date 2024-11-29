import internal from 'stream';
import { LlmAgentNode } from './LlmAgentNode';
import { Task } from './Task';
import { DataSource } from './DataSource';

export interface TaskDataSource {
    id?: number;
    task: Task;
    dataSource: DataSource;
}