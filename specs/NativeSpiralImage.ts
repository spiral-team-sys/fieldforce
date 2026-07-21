import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type ImageFormat =
    | 'jpeg'
    | 'png'
    | 'webp';

export interface ResizeOptions {

    path: string;

    maxWidth: number;

    maxHeight: number;

    quality: number;

    format: ImageFormat;

    keepExif?: boolean;

}

export interface ImageInfo {

    path: string;

    width: number;

    height: number;

    size: number;

}

export interface Spec extends TurboModule {

    resize(
        options: ResizeOptions,
    ): Promise<ImageInfo>;

    compress(
        options: ResizeOptions,
    ): Promise<ImageInfo>;

    getInfo(
        path: string,
    ): Promise<ImageInfo>;

    delete(
        path: string,
    ): Promise<boolean>;

    clearCache(): Promise<boolean>;

}

export default TurboModuleRegistry.getEnforcing<Spec>(
    'SpiralImage',
);