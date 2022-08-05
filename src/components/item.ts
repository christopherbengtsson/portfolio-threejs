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
import ThreeMeshUI from 'three-mesh-ui';

import vert from '../shaders/default.vert';
import frag from '../shaders/item.frag';

import { scene } from '../core/threejs/renderer';
import { IData, IItem, ITexturesAndFonts, TFonts } from '../types';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import {
  captionTextMaterial,
  linkUnderlineMaterial,
  textMaterial,
} from '../core/threejs/materials';
import { initialColor } from '../utils/categoriesCommonConfig';

export function createSectionItem(
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
    gradientColor: { type: 'vec3', value: new Color(initialColor) },
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
  mesh.scale.set(textures[filename].userData.size!.x, textures[filename].userData.size!.y, 1);

  textures[filename].onUpdate = () => {
    if (
      mesh.scale.x !== textures[filename].userData.size!.x &&
      mesh.scale.y !== textures[filename].userData.size!.y
    ) {
      mesh.scale.set(textures[filename].userData.size!.x, textures[filename].userData.size!.y, 1);
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

  const meshGroup = new Group();
  meshGroup.add(mesh);

  if (data.text) {
    const container = addText(mesh, data);
    meshGroup.add(container);
  }

  group.add(meshGroup);

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
    meshGroup,
  };

  addCaption(item, data, fonts);

  return item;
}

function addText(mesh: Mesh, data: IData) {
  const container = new ThreeMeshUI.Block({
    justifyContent: 'center',
    bestFit: 'shrink',
    width: mesh.scale.x,
    height: mesh.scale.y,
    fontFamily: 'fonts/Roboto-Regular-msdf.json',
    fontTexture: 'fonts/Roboto-Regular-msdf.png',
    backgroundColor: textMaterial.color,
    backgroundOpacity: 0,
    // backgroundTexture: mesh.material, // Add texture as background?
  });

  container.rotation.set(0, -3.15, 0);

  const text = new ThreeMeshUI.Text({
    content: data.text,
    fontSize: 24,
    fontColor: textMaterial.color,
    textAlign: 'justify-left',
  });

  container.add(text);

  return container;
}

function addCaption(item: IItem, data: IData, fonts: TFonts) {
  if (data.caption === '' && data.link === '') return;

  if (data.caption !== '') {
    const captionGeom = new TextGeometry(data.caption, {
      font: fonts['Roboto'],
      size: 24,
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
      size: 12,
      height: 0,
      curveSegments: 6,
    }).center();

    item.link = new Mesh(linkGeom, captionTextMaterial);

    item.linkUnderline = new Mesh(new PlaneBufferGeometry(78, 1), linkUnderlineMaterial);
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
