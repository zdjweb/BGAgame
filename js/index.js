const body = document.querySelector('body');
const index = document.querySelector('#index');
(() => {
    let timer;
    const outIndex = () => {
        let opacity = +window.getComputedStyle(index).opacity;
        if (timer != null && opacity != 1) {
            return;
        }
        timer = setInterval(() => {
            if (opacity > 0) {
                index.style.opacity = +((opacity -= 0.01).toFixed(2));
            } else {
                Object.assign(index.style, {
                    display: 'none',
                    opacity: 0
                });
                clearInterval(timer);
            }
        }, 10);
    };
    index.addEventListener('click', () => {
        outIndex();
    });
    body.addEventListener('keydown', () => {
        outIndex();
    });
})();
(() => {
    let timer;
    const returnIndex = () => {
        let opacity = +window.getComputedStyle(index).opacity;
        if (timer != null && opacity != 0) {
            return;
        }
        index.style.display = 'block';
        timer = setInterval(() => {
            if (opacity < 1) {
                index.style.opacity = +((opacity += 0.01).toFixed(2));
            } else {
                index.style.opacity = 1;
                clearInterval(timer);
            }
        }, 10);
    };
    body.addEventListener('keydown', (e) => {
        if (e.key == 'Escape') {
            returnIndex();
        }
    });
})();
body.webkitRequestFullScreen();