const body = document.querySelector('body');
const index = document.querySelector('#index');
const choice = document.querySelector('#choice');
const light = document.querySelector('#light');
const settingBtn = document.querySelectorAll('.setting');
const setting = document.querySelector('#setting');
const returnIndex = document.querySelector('#returnIndex');
const exit = document.querySelector('#exit');
(() => {
    let timer;
    let page = [index, choice],
    now = 0,
    set = 0;
    const show = (e, f) => {
        let opacity = +window.getComputedStyle(e).opacity;
        if (timer != null || opacity != 0) {
            return;
        }
        e.style.display = 'block';
        timer = setInterval(() => {
            if (opacity < 1) {
                e.style.opacity = +((opacity += 0.01).toFixed(2));
            } else {
                e.style.opacity = 1;
                clearInterval(timer);
                timer = null;
                f != null ? f() : 0;
            }
        }, 5);
    };
    const display = (e, f) => {
        let opacity = +window.getComputedStyle(e).opacity;
        if (timer != null || opacity != 1) {
            return;
        }
        timer = setInterval(() => {
            if (opacity > 0) {
                e.style.opacity = +((opacity -= 0.01).toFixed(2));
            } else {
                Object.assign(e.style, {
                    display: 'none',
                    opacity: 0
                });
                clearInterval(timer);
                timer = null;
                f != null ? f() : 0;
            }
        }, 5);
    };
    index.addEventListener('click', () => {
        document.querySelector('html').requestFullscreen();
        display(index, () => {
            show(choice, () => {
                now = 1;
            });
        });
    });
    choice.addEventListener('click', () => {
        display(choice, () => {
            show(light, () => {
                now = 2;
            });
        });
    });
    for (let i = 0; i < settingBtn.length; i++) {
        settingBtn[i].addEventListener('click', () => {
            show(setting, () => {
                set = 1;
            });
        });
    }
    setting.addEventListener('click', (e) => {
        if (e.target == setting) {
            display(setting, () => {
                set = 0;
            });
        }
    });
    returnIndex.addEventListener('click', () => {
        display(setting, () => {
            set = 0;
            display(page[now], () => {
                show(index, () => {
                    now = 0;
                })
            });
        });
    });
    exit.addEventListener('click', () => {
        if (window.opener != null) {
            window.close();
        }
        if (document.fullscreenElement != null) {
            document.exitFullscreen();
        }
        returnIndex.click();
    });
    body.addEventListener('keydown', (e) => {
        if (!now) {
            display(index, () => {
                show(choice, () => {
                    now = 1;
                });
            });
        } else {
            if (e.key == 'Escape') {
                if (!set) {
                    display(choice, () => {
                        show(index, () => {
                            now = 0;
                        });
                    });
                } else {
                    display(setting, () => {
                        set = 0;
                    });
                }
            }
        }
    });
})();
(() => {
    const player = document.createElement('div');
    player.classList.add('player');
    const playerImg = document.createElement('div');
    playerImg.classList.add('img');
    player.appendChild(playerImg);
    Object.assign(player.style, {
        top: 0,
        left: 0
    });
    light.appendChild(player);
    const key = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    const move = () => {
        const canvas = light,
        width = canvas.offsetWidth,
        height = canvas.offsetHeight,
        size = player.offsetWidth;
        if (key.up) {
            if (player.offsetTop - 5 > 0) {
                player.style.top = +(player.style.top.replace('px', '')) - 5 + 'px';
            } else {
                player.style.top = 0;
            }
        }
        if (key.down) {
            if (player.offsetTop + 5 < height - size) {
                player.style.top = +(player.style.top.replace('px', '')) + 5 + 'px';
            } else {
                player.style.top = height - size + 'px';
            }
        }
        if (key.left) {
            if (player.offsetLeft - 5 > 0) {
                player.style.left = +(player.style.left.replace('px', '')) - 5 + 'px';
            } else {
                player.style.left = 0;
            }
        }
        if (key.right) {
            if (player.offsetLeft + 5 < width - size) {
                player.style.left = +(player.style.left.replace('px', '')) + 5 + 'px';
            } else {
                player.style.left = width - size + 'px';
            }
        }
    };
    const getSite = () => {
        const size = player.offsetWidth;
        return {
            x: player.offsetLeft + size / 2,
            y: player.offsetTop + size / 2
        };
    };
    setInterval(() => {
        move();
        console.log(getSite());
    }, 10);
    body.addEventListener('keydown', (e) => {
        if (e.key == 'ArrowUp') {
            key.up = true;
        } else if (e.key == 'ArrowDown') {
            key.down = true;
        } else if (e.key == 'ArrowLeft') {
            key.left = true;
        } else if (e.key == 'ArrowRight') {
            key.right = true;
        }
    });
    body.addEventListener('keyup', (e) => {
        if (e.key == 'ArrowUp') {
            key.up = false;
        } else if (e.key == 'ArrowDown') {
            key.down = false;
        } else if (e.key == 'ArrowLeft') {
            key.left = false;
        } else if (e.key == 'ArrowRight') {
            key.right = false;
        }
    });
    body.addEventListener('touchstart', (e) => {
        if (e.touches[0].clientX < getSite().x) {
            key.left = true;
        } else {
            key.right = true;
        }
        if (e.touches[0].clientY < getSite().y) {
            key.up = true;
        } else {
            key.down = true;
        }
    });
    body.addEventListener('touchend', () => {
        key.up = false;
        key.down = false;
        key.left = false;
        key.right = false;
    });
    window.addEventListener('blur', () => {
        key.up = false;
        key.down = false;
        key.left = false;
        key.right = false;
    });
})();