import { ARScene } from './ARScene.js';
import { ObjectManager } from './ObjectManager.js';
import { UI } from './UI.js';

async function main() {
    const arScene = new ARScene();
    await arScene.init();

    const objectManager = new ObjectManager(arScene.scene, arScene);
    await objectManager.init();

    new UI(objectManager);

    document.getElementById('start-ar-btn').addEventListener('click', () => {
        arScene.startAR();
    });
}

main();