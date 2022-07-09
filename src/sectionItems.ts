import {
  Color,
  Fog,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from 'three';

import vert from './shaders/default.vert';
import frag from './shaders/item.frag';

import { scene } from './core/renderer';
import { IData, IItem, ITexturesAndFonts, TFonts } from './types';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { captionTextMaterial, linkUnderlineMaterial } from './core/materials';

export function createSectionItems(
  texturesAndFonts: ITexturesAndFonts,
  category: string,
  data: IData,
  filename: string,
  itemIndexTotal: number,
  itemIndex: number
) {
  const { textures, fonts } = texturesAndFonts;
  const uniforms = {
    time: { type: 'f', value: 1.0 },
    fogColor: { type: 'c', value: (scene.fog as Fog).color },
    fogNear: { type: 'f', value: (scene.fog as Fog).near },
    fogFar: { type: 'f', value: (scene.fog as Fog).far },
    _texture: { type: 't', value: textures[filename] },
    opacity: { type: 'f', value: 1.0 },
    progress: { type: 'f', value: 0.0 },
    gradientColor: { type: 'vec3', value: new Color(0x1b42d8) },
  };
  const geometry = new PlaneGeometry(1, 1);
  const material = new ShaderMaterial({
    uniforms,
    fragmentShader: frag,
    vertexShader: vert,
    transparent: true,
  });
  material.fog = true;
  
  const mesh = new Mesh(geometry, material);
  mesh.scale.set(textures[filename].size!.x, textures[filename].size!.y, 1);

  textures[filename].onUpdate = () => {
    if (
      mesh.scale.x !== textures[filename].size!.x &&
      mesh.scale.y !== textures[filename].size!.y
    ) {
      mesh.scale.set(textures[filename].size!.x, textures[filename].size!.y, 1);
    }
  };

  const align = itemIndexTotal % 4;
  const pos = new Vector2();

  if (align === 0) pos.set(-350, 350); // bottom left
  if (align === 1) pos.set(350, 350); // bottom right
  if (align === 2) pos.set(350, -350); // top right
  if (align === 3) pos.set(-350, -350); // top left

  const origPos = new Vector2(pos.x, pos.y);

  const group = new Group();
  group.position.set(pos.x, pos.y, itemIndex * -300 - 200);
  group.add(mesh);

  const item: IItem = {
    uniforms,
    material,
    geometry,
    mesh,
    origPos,
    active: false,
    align,
    category,
    group,
  };

  addCaption(item, data, fonts);

  return item;
}

function addCaption(item: IItem, data: IData, fonts: TFonts) {
  if (data.caption === '' && data.link === '') return;

  if (data.caption !== '') {
    const captionGeom = new TextGeometry(data.caption, {
      font: fonts['Roboto'],
      size: 18,
      height: 0,
      curveSegments: 6,
    }).center();

    const caption = new Mesh(captionGeom, captionTextMaterial);
    caption.position.set(0, -item.mesh.scale.y / 2 - 50, 0);
    caption.visible = false;

    item.caption = caption;
    item.group.add(caption);
  }
  if (data.link !== '') {
    item.linkGroup = new Group();

    let linkGeom = new TextGeometry('SEE MORE', {
      font: fonts['Roboto'],
      size: 6,
      height: 0,
      curveSegments: 6,
    }).center();

    item.link = new Mesh(linkGeom, captionTextMaterial);

    item.linkUnderline = new Mesh(new PlaneBufferGeometry(45, 1), linkUnderlineMaterial);
    item.linkUnderline.position.set(0, -10, 0);

    // for raycasting so it doesn't just pick up on letters
    item.linkBox = new Mesh(
      new PlaneBufferGeometry(70, 20),
      new MeshBasicMaterial({ alphaTest: 0, visible: false })
    );
    item.linkBox.onClick = () => {
      window.open(data.link, '_blank');
    };

    item.linkGroup.position.set(
      0,
      item.caption ? item.caption.position.y - 40 : -item.mesh.scale.y / 2 - 50,
      0
    );
    item.linkGroup.visible = false;

    item.linkGroup.add(item.link);
    item.linkGroup.add(item.linkUnderline);
    item.linkGroup.add(item.linkBox);
    item.group.add(item.linkGroup);
  }
}
