import * as THREE from 'three';
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
        this.xrSession = null;
    }

    async init() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        hemiLight.position.set(0.5, 1, 0.25);
        this.scene.add(hemiLight);

        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        await this.loadEnvironment('hdr/puresky.hdr');

        const controller = this.renderer.xr.getController(0);
        controller.addEventListener('select', () => this.onSelect());
        this.scene.add(controller);

        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.setAnimationLoop((t, frame) => this.render(t, frame));
    }

    async loadEnvironment(url) {
        return new Promise((resolve, reject) => {
            new RGBELoader().load(url, (hdr) => {
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = hdr;
                resolve();
            }, undefined, reject);
        });
    }

    async startAR() {
        if (!navigator.xr) {
            alert("WebXR не поддерживается вашим браузером. Используйте Chrome на Android.");
            return;
        }

        try {
            this.xrSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'local-floor'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.getElementById('ar-overlay') }
            });

            await this.renderer.xr.setSession(this.xrSession);

            // Переключаем UI
            document.getElementById('start-ar-btn').style.display = 'none';
            document.getElementById('ar-overlay').style.display = 'flex';

            // Возвращаем UI при выходе
            this.xrSession.addEventListener('end', () => {
                document.getElementById('start-ar-btn').style.display = 'block';
                document.getElementById('ar-overlay').style.display = 'none';
                this.xrSession = null;
            });

        } catch (error) {
            console.error("Ошибка запуска AR:", error);
            alert("Не удалось запустить AR: " + error.message);
        }
    }

    onSelect() {
        if (this.reticle.visible && this.onSelectCallback) {
            this.onSelectCallback(this.reticle);
        }
    }

    render(timestamp, frame) {
        if (frame && this.xrSession) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();

            if (!this.hitTestSourceRequested) {
                this.xrSession.requestReferenceSpace('viewer').then((refSpace) => {
                    this.xrSession.requestHitTestSource({ space: refSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });
                this.xrSession.addEventListener('end', () => {
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