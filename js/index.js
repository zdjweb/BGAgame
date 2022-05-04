const body = document.querySelector('body');
const index = document.querySelector('#index');
const choice = document.querySelector('#choice');
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
