import { SharedObjectProperties } from './SharedObjectProperties';

export type ObjectType = 'Goal' | 'Task' | 'Note';

export type TypedTaggedObject = SharedObjectProperties & {
  type: ObjectType;
  title: string;
};