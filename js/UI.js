export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.setupUI();
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    setupUI() {
        document.getElementById('btn-rotate').onclick = () => this.om.rotateLast();
        document.getElementById('btn-clear').onclick = () => this.om.clearAll();
        document.getElementById('btn-model').onclick = () => this.om.toggleModel();

        const circles = document.querySelectorAll('.color-circle');
        circles.forEach(circle => {
            circle.onclick = () => {
                const color = parseInt(circle.getAttribute('data-color'));
                this.om.changeColor(color);
            };
        });

        // Защита от "проваливания" кликов в 3D
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