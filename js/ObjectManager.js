import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.modelTemplate = null;       // ← шаблон модели
        this.currentColor = 0x44aaff;
    }

    async init() {
        // Загружаем модель один раз
        return new Promise((resolve, reject) => {
            new GLTFLoader().load(
                'models/pin.glb',                    // ← ПУТЬ К МОДЕЛИ
                (gltf) => {
                    this.modelTemplate = gltf.scene;
                    // Проходимся по всем материалам модели и делаем их PBR
                    this.modelTemplate.traverse((node) => {
                        if (node.isMesh) {
                            node.material = new THREE.MeshStandardMaterial({
                                color: this.currentColor,
                                roughness: 0.4,
                                metalness: 0.1,
                                map: node.material.map || null
                            });
                        }
                    });
                    resolve();
                },
                undefined,
                (err) => {
                    console.error('Ошибка загрузки модели:', err);
                    reject(err);
                }
            );
        });
    }

    placeObject(reticle) {
        if (!this.modelTemplate) return;

        const clone = this.modelTemplate.clone(true);
        clone.position.setFromMatrixPosition(reticle.matrix);
        clone.quaternion.setFromRotationMatrix(reticle.matrix);
        clone.scale.set(0.2, 0.2, 0.2);
        this.scene.add(clone);
        this.objects.push(clone);
        return clone;
    }

    changeColor(colorHex) {
        this.currentColor = colorHex;
        this.objects.forEach((obj) => {
            obj.traverse((node) => {
                if (node.isMesh) node.material.color.set(colorHex);
            });
        });
    }

    rotateAll() {
        this.objects.forEach((obj) => {
            obj.rotation.y += Math.PI / 4;
        });
    }

    clearAll() {
        this.objects.forEach((obj) => this.scene.remove(obj));
        this.objects = [];
    }
}