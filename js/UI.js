export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.setupUI();
        
        // Вызов создания объекта ТОЛЬКО по тапу в AR (по сцене)
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    setupUI() {
        // 1. Привязка кнопок к правильным методам ObjectManager
        document.getElementById('btn-rotate').onclick = () => this.om.rotateLast();
        document.getElementById('btn-clear').onclick = () => this.om.clearAll(); // Удаляет ВСЁ
        document.getElementById('btn-model').onclick = () => this.om.toggleModel();

        // 2. Палитра цветов (меняет цвет последнего объекта)
        const circles = document.querySelectorAll('.color-circle');
        circles.forEach(circle => {
            circle.onclick = () => {
                const color = parseInt(circle.getAttribute('data-color'));
                this.om.changeColor(color);
            };
        });

        // 3. Блокировка "проваливания" кликов в 3D-сцену
        // Без этого WebXR воспринимает клик по кнопке как тап по экрану
        const uiPanel = document.getElementById('ar-overlay');
        if (uiPanel) {
            const eventsToBlock = ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend', 'mousedown', 'mouseup'];
            eventsToBlock.forEach(eventType => {
                uiPanel.addEventListener(eventType, (e) => {
                    e.stopPropagation();
                }, { passive: false });
            });
        }
    }
}