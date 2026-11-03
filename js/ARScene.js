import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class ARScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.onSelectCallback = null;
    }

    async init() {
        // Рендерер
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Кнопка AR
        document.body.appendChild(ARButton.createButton(this.renderer, {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],           // ← Включаем наложение HTML
            domOverlay: { root: document.getElementById('ui-panel') } // ← Указываем, какой блок показывать
        }));

        // Освещение (базовое, HDRI добавится позже)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        hemiLight.position.set(0.5, 1, 0.25);
        this.scene.add(hemiLight);

        // Ретикл
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial()
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        // HDRI-освещение
        await this.loadEnvironment('hdr/puresky.hdr');

        // Контроллер для тапов
        const controller = this.renderer.xr.getController(0);
        controller.addEventListener('select', () => this.onSelect());
        this.scene.add(controller);

        // Ресайз
        window.addEventListener('resize', () => this.onWindowResize());

        this.renderer.setAnimationLoop((t, frame) => this.render(t, frame));
    }

    async loadEnvironment(url) {
        return new Promise((resolve, reject) => {
            new RGBELoader().load(url, (hdr) => {
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = hdr; // PBR-материалы автоматически подхватят это
                resolve();
            }, undefined, reject);
        });
    }

    onSelect() {
        if (this.reticle.visible && this.onSelectCallback) {
            this.onSelectCallback(this.reticle);
        }
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if (!this.hitTestSourceRequested) {
                session.requestReferenceSpace('viewer').then((refSpace) => {
                    session.requestHitTestSource({ space: refSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });
                session.addEventListener('end', () => {
                    this.hitTestSourceRequested = false;
                    this.hitTestSource = null;
                });
                this.hitTestSourceRequested = true;
            }

            if (this.hitTestSource) {
                const results = frame.getHitTestResults(this.hitTestSource);
                if (results.length) {
                    const hit = results[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}