import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { captionTextMaterial, linkUnderlineMaterial } from '../core/threejs/materials';
import { TFonts } from '../types';

export function createLinks(fonts: TFonts) {
  const linkGroup = new Group();

  const linkGeom = new TextGeometry('SEE MORE', {
    font: fonts['SuisseIntl-Bold'],
    size: 6,
    height: 0,
    curveSegments: 4,
  }).center();

  const link = new Mesh(linkGeom, captionTextMaterial);

  const linkUnderline = new Mesh(new PlaneBufferGeometry(45, 1), linkUnderlineMaterial);
  linkUnderline.position.set(0, -10, 0);

  // for raycasting so it doesn't just pick up on letters
  const linkBox = new Mesh(
    new PlaneBufferGeometry(70, 20),
    new MeshBasicMaterial({ alphaTest: 0, visible: false })
  );
  linkBox.name = 'linkBox';
  linkGroup.visible = false;

  linkGroup.add(link);
  linkGroup.add(linkUnderline);
  linkGroup.add(linkBox);

  return linkGroup;
}
