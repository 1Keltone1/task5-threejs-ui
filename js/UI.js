export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.setupUI();
        
        // Вызов создания объекта ТОЛЬКО по тапу в AR
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    setupUI() {
        // Убедитесь, что ID кнопок в HTML совпадают с этими
        document.getElementById('btn-rotate').onclick = () => this.om.rotateLast();
        document.getElementById('btn-clear').onclick = () => this.om.removeLast();
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