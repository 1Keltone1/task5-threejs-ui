export class UI {
    constructor(objectManager) {
        this.om = objectManager;
        this.setupUI();
    }

    setupUI() {
        // Привязка кнопок к методам
        document.getElementById('btn-add').onclick = () => this.om.addModel();
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
    }
}