export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.setupUI();
        
        // Связываем тап по AR-сцене с добавлением объекта
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    setupUI() {
        // Привязка кнопок
        document.getElementById('btn-rotate').onclick = () => this.om.rotateLast();
        document.getElementById('btn-clear').onclick = () => this.om.clearAll();
        document.getElementById('btn-model').onclick = () => this.om.toggleModel();

        // Палитра цветов
        const circles = document.querySelectorAll('.color-circle');
        circles.forEach(circle => {
            circle.onclick = () => {
                const color = parseInt(circle.getAttribute('data-color'));
                this.om.changeColor(color);
            };
        });

        // ЗАЩИТА: блокируем проваливание кликов в 3D-сцену (чтобы кнопки не спавнили модели)
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