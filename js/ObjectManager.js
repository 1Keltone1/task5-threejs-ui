import * as THREE from 'three';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.currentMaterial = new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            roughness: 0.4,
            metalness: 0.1
        });
    }

    placeObject(reticle) {
        // Создаём куб с текущим PBR-материалом
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.15),
            this.currentMaterial.clone()
        );
        mesh.position.setFromMatrixPosition(reticle.matrix);
        mesh.quaternion.setFromRotationMatrix(reticle.matrix);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    changeColor(colorHex) {
        this.currentMaterial.color.set(colorHex);
        // Применяем к уже размещённым объектам
        this.objects.forEach(obj => {
            if (obj.material) obj.material.color.set(colorHex);
        });
    }

    rotateAll() {
        this.objects.forEach(obj => {
            obj.rotation.y += Math.PI / 4;
        });
    }

    clearAll() {
        this.objects.forEach(obj => this.scene.remove(obj));
        this.objects = [];
    }
}