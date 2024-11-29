import { ImageFormats } from './ImageFormats';

export interface Media {
    id?: number;
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string;
    provider: string;
    provider_metadata: string;
    formats: ImageFormats;
}