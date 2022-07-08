import {
  Object3D,
  Color,
  Texture,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Group,
} from 'three';

type onClick = () => void;
export interface IObject3D extends Object3D<Event> {
  onClick?: onClick;
}
interface IUniform {
  type: string;
  value: number | Color | Texture;
}
interface IMesh extends Mesh {
  onClick?: onClick;
}
export interface IItem extends Partial<Object3D<Event>> {
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  mesh: IMesh;
  origPos: Vector2;
  uniforms: {
    time: IUniform;
    fogColor: IUniform;
    fogNear: IUniform;
    fogFar: IUniform;
    _texture: IUniform;
    opacity: IUniform;
    progress: IUniform;
    gradientColor: IUniform;
  };
  active: boolean;
  align: number;
  category: string;
  group: Group;
  linkGroup?: Group;
  link?: Mesh;
  linkUnderline?: Mesh;
  linkBox?: IMesh;
  caption?: Mesh;
}

export interface ITexture extends Texture {
  mediaType: string;
  size: Vector2;
}

export interface ICommonConfig {
  [key: string]: {
    name?: string;
    textColor: number;
    bgColor: number;
    tintColor: number;
    outlineTextColor?: number;
    order: number;
  };
}
export interface IFileData {
  [category: string]: {
    [filename: string]: {
      caption: string;
      link: string;
    };
  };
}
export interface IData {
  filepath: string;
  filename: string;
  caption: string;
  link: string;
}
export interface ICategoryData {
  [key: string]: {
    data: IData[];
  };
}
export type IAssets = ICommonConfig & ICategoryData;
