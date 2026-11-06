import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObjectManager {
    constructor(scene, arScene) {
        this.scene = scene;
        this.arScene = arScene; // Нам нужен доступ к ретиклу
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
        } catch (error) {
            console.error('Ошибка загрузки моделей:', error);
        }
    }

    // Вызывается ТОЛЬКО по кнопке "Добавить"
    addModel() {
        const reticle = this.arScene.reticle;
        if (!reticle || !reticle.visible) {
            alert("Наведите камеру на ровную поверхность, чтобы добавить модель!");
            return;
        }

        const template = this.models[this.currentModelKey];
        if (!template) return;

        const clone = template.clone(true);
        
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

    getLastObject() {
        if (this.objects.length === 0) return null;
        return this.objects[this.objects.length - 1];
    }

    changeColor(colorHex) {
        this.currentColor = colorHex; 
        const lastObj = this.getLastObject();
        if (!lastObj) return;
        
        lastObj.traverse((node) => {
            if (node.isMesh) node.material.color.set(colorHex);
        });
    }

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

    toggleModel() {
        this.currentModelKey = this.currentModelKey === 'pin' ? 'sovunya' : 'pin';
    }

    clearAll() {
        this.objects.forEach(obj => this.scene.remove(obj));
        this.objects = []; 
    }
}