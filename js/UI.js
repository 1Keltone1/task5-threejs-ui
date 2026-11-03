export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.setupUI();
        
        // При клике на экран в AR вызываем placeObject
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    setupUI() {
        // Кнопки
        document.getElementById('btn-rotate').onclick = () => this.om.rotateAll();
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
    }
}