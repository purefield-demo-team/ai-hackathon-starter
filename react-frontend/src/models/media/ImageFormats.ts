import { ImageFormat } from './ImageFormat';

export interface ImageFormats {
    id?: number;
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    small: ImageFormat;
    medium: ImageFormat;
    thumbnail: ImageFormat;
}