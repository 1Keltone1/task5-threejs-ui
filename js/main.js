import { ARScene } from './ARScene.js';
import { ObjectManager } from './ObjectManager.js';
import { UI } from './UI.js';

async function main() {
    // 1. Инициализация Three.js и WebXR
    const arScene = new ARScene();
    await arScene.init();

    // 2. Загрузка моделей
    const objectManager = new ObjectManager(arScene.scene);
    await objectManager.init();

    // 3. Настройка UI
    new UI(objectManager, arScene);

    // 4. Привязка кнопки "Запустить AR"
    document.getElementById('start-ar-btn').addEventListener('click', () => {
        arScene.startAR();
    });
}

main();