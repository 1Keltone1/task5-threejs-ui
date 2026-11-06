import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.models = {};
        this.currentModelKey = 'pin'; // Какая модель будет добавлена следующей
        this.currentColor = 0xffffff; // Текущий цвет
        this.currentScale = 0.5;      // Масштаб
    }

    async init() {
        const loader = new GLTFLoader();
        const loadModel = (path) => new Promise((resolve, reject) => {
            loader.load(path, (gltf) => resolve(gltf.scene), undefined, reject);
        });

        try {
            this.models.pin = await loadModel('models/pin.glb');
            this.models.sovunya = await loadModel('models/sovunya.glb');
            console.log('Модели загружены');
        } catch (error) {
            console.error('Ошибка загрузки моделей:', error);
        }
    }

    // Вызывается при тапе по экрану
    placeObject(reticle) {
        const template = this.models[this.currentModelKey];
        if (!template) return;

        const clone = template.clone(true);
        
        // Настраиваем PBR-материал
        clone.traverse((node) => {
            if (node.isMesh) {
                const oldMap = node.material.map || null;
                node.material = new THREE.MeshStandardMaterial({
                    color: this.currentColor,
                    roughness: 0.4,
                    metalness: 0.2,
                    map: oldMap
                });
            }
        });

        clone.position.setFromMatrixPosition(reticle.matrix);
        clone.quaternion.setFromRotationMatrix(reticle.matrix);
        clone.scale.set(this.currentScale, this.currentScale, this.currentScale);
        
        this.scene.add(clone);
        this.objects.push(clone);
    }

    // Получить последний добавленный объект
    getLastObject() {
        if (this.objects.length === 0) return null;
        return this.objects[this.objects.length - 1];
    }

    // Изменить цвет ТОЛЬКО последнего
    changeColor(colorHex) {
        this.currentColor = colorHex; 
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        
        lastObj.traverse((node) => {
            if (node.isMesh) node.material.color.set(colorHex);
        });
    }

    // Повернуть ТОЛЬКО последний (плавно)
    rotateLast() {
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        
        const targetRotation = lastObj.rotation.y + (Math.PI / 4);
        const startTime = performance.now();
        const duration = 300;
        const startRotation = lastObj.rotation.y;

        const animateRotation = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            lastObj.rotation.y = startRotation + (targetRotation - startRotation) * ease;
            if (progress < 1) requestAnimationFrame(animateRotation);
        };
        requestAnimationFrame(animateRotation);
    }

    // Переключить модель для следующих объектов
    toggleModel() {
        this.currentModelKey = this.currentModelKey === 'pin' ? 'sovunya' : 'pin';
        console.log('Следующая модель:', this.currentModelKey);
    }

    // Удалить ВСЕ объекты
    clearAll() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = []; 
    }
}