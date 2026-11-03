export class UI {
    constructor(objectManager, arScene) {
        this.om = objectManager;
        this.arScene = arScene;
        this.createPanel();
        this.arScene.onSelectCallback = (reticle) => this.om.placeObject(reticle);
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'ui-panel';
        panel.innerHTML = `
            <button id="btn-color">Сменить цвет</button>
            <button id="btn-rotate">Повернуть</button>
            <button id="btn-clear">Очистить</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('btn-color').onclick = () => {
            const colors = [0xff5733, 0x33ff57, 0x3357ff, 0xff33f1, 0xffd733, 0x44aaff];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.om.changeColor(randomColor);
        };

        document.getElementById('btn-rotate').onclick = () => {
            this.om.rotateAll();
        };

        document.getElementById('btn-clear').onclick = () => {
            this.om.clearAll();
        };
    }
}