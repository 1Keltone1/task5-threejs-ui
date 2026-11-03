import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.models = {};
        this.currentModelKey = 'pin';
        this.currentColor = 0xffffff;
        this.currentScale = 0.5;
    }

    async init() {
        const loader = new GLTFLoader();
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

    // Этот метод вызывается ТОЛЬКО при тапе по экрану в AR
    placeObject(reticle) {
        const template = this.models[this.currentModelKey];
        if (!template) return;

        const clone = template.clone(true);
        
        clone.traverse((node) => {
            if (node.isMesh) {
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

    // Вспомогательный метод: получить последний добавленный объект
    getLastObject() {
        if (this.objects.length === 0) return null;
        return this.objects[this.objects.length - 1];
    }

    // Меняем цвет ТОЛЬКО у последнего
    changeColor(colorHex) {
        this.currentColor = colorHex; // Запоминаем для будущих
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        
        lastObj.traverse((node) => {
            if (node.isMesh) node.material.color.set(colorHex);
        });
    }

    // Поворачиваем ТОЛЬКО последний
    rotateLast() {
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        lastObj.rotation.y += Math.PI / 4;
    }

    // Меняем модель для будущих объектов
    toggleModel() {
        this.currentModelKey = this.currentModelKey === 'pin' ? 'sovunya' : 'pin';
        console.log('Следующая модель будет:', this.currentModelKey);
    }

    // Очищаем ТОЛЬКО последний
    removeLast() {
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        this.scene.remove(lastObj);
        this.objects.pop();
    }
}