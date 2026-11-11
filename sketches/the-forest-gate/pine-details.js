export function createPineDetails(THREE, trees) {
  const details = new THREE.Group();
  details.name = 'Pine Details';

  const bark = new THREE.MeshStandardMaterial({ color: '#51413d', flatShading: true });
  const cutWood = new THREE.MeshStandardMaterial({ color: '#846a55' });
  const groove = new THREE.MeshStandardMaterial({ color: '#3b2c2a' });
  const up = new THREE.Vector3(0, 1, 0);

  trees.forEach(([x, z, height], index) => {
    const group = new THREE.Group();
    group.name = 'Pine ' + String(index + 1).padStart(2, '0') + ' Detail';
    group.position.set(x, 0.12, z);

    const side = index % 2 === 0 ? 1 : -1;
    const start = new THREE.Vector3(0, height * 0.15, 0.03);
    const end = new THREE.Vector3(side * height * 0.093, height * 0.195, 0.085);
    const direction = end.clone().sub(start);
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.048, direction.length(), 5),
      [bark, cutWood, bark]
    );
    branch.name = 'Short Branch';
    branch.position.copy(start).lerp(end, 0.5);
    branch.quaternion.setFromUnitVectors(up, direction.normalize());
    group.add(branch);

    // Place two slim marks just above the front facets of the tapered trunk.
    for (const [angle, y, length] of [[Math.PI / 6, 0.073, 0.078], [-Math.PI / 6, 0.127, 0.064]]) {
      const radius = height * (0.05 - 0.015 * y / 0.56) * Math.cos(Math.PI / 6);
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.024, height * length, 0.018), groove);
      mark.name = 'Bark Groove';
      mark.position.set(Math.sin(angle) * radius, height * y, Math.cos(angle) * radius);
      mark.rotation.set(-0.023, angle, side * 0.025, 'YXZ');
      group.add(mark);
    }

    details.add(group);
  });

  return details;
}
