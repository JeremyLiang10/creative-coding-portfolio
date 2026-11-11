// Small mint-colored lantern plants that can be placed as one group.
export function createGlowingPlants(THREE) {
  const plants = new THREE.Group();
  plants.name = 'Glowing Plants';

  const stemGeometry = new THREE.CylinderGeometry(0.012, 0.018, 1, 5);
  const leafGeometry = new THREE.SphereGeometry(1, 5, 3);
  const budGeometry = new THREE.IcosahedronGeometry(0.078, 0);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#315c4d' });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#39745a', flatShading: true });
  const budMaterial = new THREE.MeshBasicMaterial({ color: '#a3ffe0', fog: false });

  function sprout(x, z, height, lean) {
    const plant = new THREE.Group();
    plant.name = 'Lantern Sprout';
    plant.position.set(x, 0, z);
    plant.rotation.z = lean;

    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.name = 'Stem';
    stem.scale.y = height;
    stem.position.y = height / 2;
    plant.add(stem);

    for (const side of [-1, 1]) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.name = 'Leaf';
      leaf.position.set(side * 0.055, height * 0.46, 0);
      leaf.scale.set(0.095, 0.023, 0.041);
      leaf.rotation.z = side * 0.45;
      plant.add(leaf);
    }

    const bud = new THREE.Mesh(budGeometry, budMaterial);
    bud.name = 'Glowing Bud';
    bud.position.y = height;
    bud.scale.y = 1.18;
    plant.add(bud);
    return plant;
  }

  function cluster(name, x, z, height) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(x, 0.12, z);
    group.add(sprout(-0.17, 0.06, height * 0.74, 0.20));
    group.add(sprout(0.02, 0, height, -0.06));
    group.add(sprout(0.18, -0.04, height * 0.64, -0.24));

    const glow = new THREE.PointLight('#5fffc4', 0.44, 1.1);
    glow.name = 'Mint Glow';
    glow.position.set(0, height * 0.8, 0);
    group.add(glow);
    plants.add(group);
  }

  cluster('Lantern Plants 01', -1.12, 1.05, 0.36);
  cluster('Lantern Plants 02', 1.22, 1.65, 0.48);
  cluster('Lantern Plants 03', -1.42, 3.42, 0.42);
  cluster('Lantern Plants 04', 1.42, 3.95, 0.54);
  return plants;
}
