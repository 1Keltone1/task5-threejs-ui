import { ARScene } from './ARScene.js';
import { ObjectManager } from './ObjectManager.js';
import { UI } from './UI.js';

async function main() {
    const arScene = new ARScene();
    await arScene.init();

    const objectManager = new ObjectManager(arScene.scene);
    new UI(objectManager, arScene);
}

main();