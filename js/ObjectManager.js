import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.models = {}; // Хранилище загруженных моделей
        this.currentModelKey = 'pin';
        this.currentColor = 0xffffff;
        
        // Увеличиваем масштаб (было 0.2, ставим 0.5 для примера)
        this.currentScale = 0.5; 
    }

    async init() {
        const loader = new GLTFLoader();
        
        // Загружаем обе модели
        const loadModel = (path) => new Promise((resolve, reject) => {
            loader.load(path, (gltf) => resolve(gltf.scene), undefined, reject);
        });

        try {
            this.models.pin = await loadModel('models/pin.glb');
            this.models.sovunya = await loadModel('models/sovunya.glb');
            console.log('Обе модели успешно загружены');
        } catch (error) {
            console.error('Ошибка загрузки моделей:', error);
        }
    }

    placeObject(reticle) {
        const template = this.models[this.currentModelKey];
        if (!template) return;

        const clone = template.clone(true);
        
        // Применяем PBR-материал и цвет
        clone.traverse((node) => {
            if (node.isMesh) {
                // Сохраняем текстуру, если она была
                const oldMap = node.material.map || null;
                node.material = new THREE.MeshStandardMaterial({
                    color: this.currentColor,
                    roughness: 0.4,
                    metalness: 0.1,
                    map: oldMap
                });
            }
        });

        clone.position.setFromMatrixPosition(reticle.matrix);
        clone.quaternion.setFromRotationMatrix(reticle.matrix);
        clone.scale.set(this.currentScale, this.currentScale, this.currentScale);
        
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

    toggleModel() {
        this.currentModelKey = this.currentModelKey === 'pin' ? 'sovunya' : 'pin';
        console.log('Текущая модель:', this.currentModelKey);
        // Если хотите, чтобы старые объекты тоже менялись, раскомментируйте код ниже:
        /*
        this.objects.forEach((obj, index) => {
            this.scene.remove(obj);
        });
        this.objects = [];
        */
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