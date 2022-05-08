(() => {
    // 页面
    const html = document.querySelector('html'),
    // body
    body = document.querySelector('body'),
    // 小页面
    page = {
        // 当前页面
        _now: 'index',
        // 当前页面
        get now() {
            return this._now;
        },
        set now(now) {
            this._now = now;
            if (now == 'fire') {
                canvas.now = 'fire';
                getFire(canvas, person, fire, distance);
            }
        },
        // 设置页面显示前的页面
        set: null,
        // 首页
        index: document.querySelector('#index'),
        // 选择页面
        choice: document.querySelector('#choice'),
        // 闯关模式
        fire: document.querySelector('#fire'),
        // 设置页面
        setting: document.querySelector('#setting'),
        // 定时器
        timer: null,
        // 显示页面
        show(e, f) {
            const newE = e;
            e = this[e];
            let opacity = +window.getComputedStyle(e).opacity;
            if (this.timer || opacity) {
                return;
            }
            e.style.display = 'block';
            this.now = newE;
            this.timer = setInterval(() => {
                if (opacity < 1) {
                    e.style.opacity = +((opacity += 0.01).toFixed(2));
                } else {
                    e.style.opacity = 1;
                    clearInterval(page.timer);
                    page.timer = null;
                    f ? f() : 0;
                }
            }, 5);
        },
        // 隐藏页面
        display(e, f) {
            e = this[e];
            let opacity = +window.getComputedStyle(e).opacity;
            if (this.timer || !opacity) {
                return;
            }
            this.timer = setInterval(() => {
                if (opacity > 0) {
                    e.style.opacity = +((opacity -= 0.01).toFixed(2));
                } else {
                    Object.assign(e.style, {
                        display: 'none',
                        opacity: 0
                    });
                    clearInterval(page.timer);
                    page.timer = null;
                    f ? f() : 0;
                }
            }, 5);
        }
    },
    // 设置按钮
    settingBtn = document.querySelectorAll('.setting'),
    // 返回首页按钮
    returnIndex = document.querySelector('#returnIndex'),
    // 退出游戏按钮
    exit = document.querySelector('#exit');
    // 页面控制
    ((p) => {
        // 点击进入选择页面
        p.index.addEventListener('click', () => {
            p.display('index', () => {
                p.show('choice');
            });
        });
        // 点击进入闯关模式
        p.choice.addEventListener('click', (e) => {
            for (const i in settingBtn) {
                if (settingBtn[i] == e.target) {
                    return;
                }
            }
            p.display('choice', () => {
                p.show('fire');
            });
        });
        // 点击进入设置页面
        for (let i = 0; i < settingBtn.length; i++) {
            settingBtn[i].addEventListener('click', () => {
                if (!p.timer) {
                    p.set = p.now;
                    p.show('setting');
                }
            });
        }
        // 点击退出设置页面
        p.setting.addEventListener('click', function(e) {
            if (e.target == this) {
                p.display('setting', () => {
                    p.now = p.set;
                });
            }
        });
        // 点击返回首页
        returnIndex.addEventListener('click', () => {
            p.display('setting', () => {
                p.display(p.set, () => {
                    p.show('index');
                });
            });
        });
        // 点击退出游戏
        exit.addEventListener('click', () => {
            if (window.opener) {
                window.close();
            }
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            returnIndex.click();
        });
        // 点击进入全屏
        body.addEventListener('click', (e) => {
            if (e.target != exit && !document.fullscreenElement) {
                html.requestFullscreen();
            }
        });
        // 按键切换页面
        body.addEventListener('keydown', (e) => {
            if (p.now == 'index') {
                p.display('index', () => {
                    p.show('choice');
                });
            } else {
                if (e.key == 'Escape') {
                    if (p.now != 'setting') {
                        p.display(p.now, () => {
                            p.show('index');
                        });
                    } else {
                        p.display('setting', () => {
                            p.display(p.set, () => {
                                p.show('index');
                            });
                        });
                    }
                }
            }
        });
    })(page);
    // 画布
    const canvas = {
        // 当前画布
        now: null,
        // 闯关模式画布
        fire: page.fire,
        // 格子信息
        cell: {
            // 横向数量
            x: 0,
            // 竖向数量
            y: 0,
            // 宽度
            width: 0,
            //高度
            height: 0,
            has: {}
        },
        // 画布分割
        getCell() {
            if (window.innerWidth > window.innerHeight) {
                this.cell.y = 5;
                this.cell.height = window.innerHeight / 5;
                this.cell.x = Math.round(window.innerWidth / this.cell.height);
                this.cell.width = window.innerWidth / this.cell.x;
            } else {
                this.cell.x = 5;
                this.cell.width = window.innerWidth / 5;
                this.cell.y = Math.round(window.innerHeight / this.cell.width);
                this.cell.height = window.innerHeight / this.cell.y;
            }
        },
        // 获取元素位置
        getSite(obj) {
            const size = obj.offsetWidth;
            return {
                x: obj.offsetLeft + size / 2,
                y: obj.offsetTop + size / 2
            };
        },
        // 设置元素位置
        setSite(obj, x, y) {
            const width = this.cell.width,
            height = this.cell.height;
            x = {
                min: x * width,
                max: (x + 1) * width - obj.offsetWidth
            },
            y = {
                min: y * height,
                max: (y + 1) * height - obj.offsetHeight
            };
            x = Math.random() * (x.max - x.min + 1) + x.min,
            y = Math.random() * (y.max - y.min + 1) + y.min;
            Object.assign(obj.style, {
                top: y + 'px',
                left: x + 'px'
            });
        },
        // 清空画布
        clear() {
            const children = this[this.now].children;
            for (let i = 0; i < children.length; i) {
                this[this.now].removeChild(children[i]);
            }
        }
    },
    // 人物
    person = {
        // 玩家
        player: null,
        // 敌人
        foe: null,
        // 玩家能量
        engine: 100,
        // 用于计算能量恢复
        times: 0,
        // 人物移动
        move(person, step , obj) {
            const width = distance.width,
            height = distance.height,
            size = distance.size,
            speed = size / step;
            if (obj.up) {
                if (person.offsetTop - speed > 0) {
                    person.style.top = +(person.style.top.replace('px', '')) - speed + 'px';
                } else {
                    person.style.top = 0;
                }
            }
            if (obj.down) {
                if (person.offsetTop + speed < height - size) {
                    person.style.top = +(person.style.top.replace('px', '')) + speed + 'px';
                } else {
                    person.style.top = height - size + 'px';
                }
            }
            if (obj.left) {
                if (person.offsetLeft - speed > 0) {
                    person.style.left = +(person.style.left.replace('px', '')) - speed + 'px';
                } else {
                    person.style.left = 0;
                }
            }
            if (obj.right) {
                if (person.offsetLeft + speed < width - size) {
                    person.style.left = +(person.style.left.replace('px', '')) + speed + 'px';
                } else {
                    person.style.left = width - size + 'px';
                }
            }
        },
        // 生成人物
        create(type) {
            const person = document.createElement('div');
            person.classList.add(type);
            const img = document.createElement('div');
            img.classList.add('img');
            person.appendChild(img);
            canvas[canvas.now].appendChild(person);
            return person;
        },
        // 获取人物
        get(n) {
            this.player = this.create('player');
            this.foe = [];
            for (let i = 0; i < n; i++) {
                this.foe[i] = this.create('foe');
            }
        },
        // 清空人物
        clear() {
            this.player = null;
            this.foe = null;
            this.engine = 100;
            this.times = 0;
        }
    },
    // 闯关模式的火苗
    fire = {
        // 火苗
        fires: [],
        // 火苗种类
        type: [],
        // 玩家火苗值
        number: 0,
        // 生成火苗
        create(type) {
            const fire = document.createElement('img');
            fire.src = 'img/fire' + ['Small', 'Middle', 'Big'][type] + '.png';
            fire.classList.add('fire');
            Object.assign(fire.style, {
                top: '500px',
                left: 0
            });
            this.fires.push(fire);
            this.type.push(type);
            canvas[canvas.now].appendChild(fire);
        },
        // 清空火苗
        clear() {
            this.fires = [];
            this.type = [];
            this.number = 0;
        }
    },
    // 常用距离
    distance = {
        // 获取两点之间的距离
        get(...obj) {
            return Math.sqrt(Math.pow(Math.abs(obj[0].x - obj[1].x), 2) + Math.pow(Math.abs(obj[0].y - obj[1].y), 2));
        },
        // 画布宽度
        get width() {
            return canvas[canvas.now].offsetWidth;
        },
        // 画布高度
        get height() {
            return canvas[canvas.now].offsetHeight;
        },
        // 人物大小
        get size() {
            return person.player.offsetWidth;
        },
        // 玩家与敌人的距离
        get combat() {
            const arr = [];
            for (let i in person.foe) {
                arr[i] = this.get(canvas.getSite(person.player), canvas.getSite(person.foe[i]));
            }
            return arr;
        },
        // 玩家与闯关模式的火苗的距离
        get fires() {
            const arr = [];
            for (const i in fire.fires) {
                if (fire.fires[i] != null) {
                    arr[i] = this.get(canvas.getSite(person.player), canvas.getSite(fire.fires[i]));
                }
            }
            return arr;
        }
    },
    // 玩家按键状态
    key = {
        up: false,
        down: false,
        left: false,
        right: false,
        speed: false
    };
    // 闯关模式
    const getFire = (c, p, f, d) => {
        const startSet = (fires, foeNumber) => {
            c.clear();
            p.clear();
            f.clear();
            for (const i in fires) {
                for (let j = 0; j < fires[i]; j++) {
                    f.create(i);
                }
            }
            p.get(foeNumber);
            c.getCell();
            const foeSite = [];
            for (let i = 0; i < c.cell.x; i++) {
                foeSite.push(i);
            }
            for (const i in p.foe) {
                const randomSite = Math.floor(Math.random() * foeSite.length);
                c.setSite(p.foe[i], foeSite.splice(randomSite, 1)[0], 0);
            }
            c.setSite(p.player, Math.floor(Math.random() * c.cell.x), c.cell.y - 1);
        };
        startSet({
            0: 1,
            2: 5,
        }, 3);
        body.onclick = () => {
            startSet({
                0: 2,
                2: 8
            }, 5);
        };
        setInterval(() => {
            let combatDistance = d.combat;
            for (const i in combatDistance) {
                if (combatDistance[i] < d.size * 2) {
                    p.move(p.foe[i], 50 / 1.5, key);
                } else {
                    p.move(p.foe[i], 50 / 0.8, key);
                }
            }
            if (p.times == 5) {
                if (p.engine < 100) {
                    p.engine++;
                }
                p.times = 0;
            }
            p.times++;
            if (key.speed && p.engine > 0) {
                p.engine--;
                p.move(p.player, 50 / 2, key);
            } else {
                p.move(p.player, 50, key);
            }
            combatDistance = d.combat;
            const firesDistance = d.fires;
            for (const i in f.fires) {
                if (firesDistance[i] < d.size / 2 && f.fires[i]) {
                    c[c.now].removeChild(f.fires[i]);
                    f.fires[i] = null;
                    f.number += [1, 5, 10][f.type[i]];
                    console.log(f.number);
                }
            }
            for (const i in combatDistance) {
                if (combatDistance[i] < d.size) {
                    console.log(555);
                }
            }
        }, 10);
    };
    // 按下按键时改变按键状态
    body.addEventListener('keydown', (e) => {
        if (e.key == 'ArrowUp') {
            key.up = true;
        } else if (e.key == 'ArrowDown') {
            key.down = true;
        } else if (e.key == 'ArrowLeft') {
            key.left = true;
        } else if (e.key == 'ArrowRight') {
            key.right = true;
        } else if (e.key == ' ') {
            key.speed = true;
        }
    });
    // 松开按键时改变按键状态
    body.addEventListener('keyup', (e) => {
        if (e.key == 'ArrowUp') {
            key.up = false;
        } else if (e.key == 'ArrowDown') {
            key.down = false;
        } else if (e.key == 'ArrowLeft') {
            key.left = false;
        } else if (e.key == 'ArrowRight') {
            key.right = false;
        } else if (e.key == ' ') {
            key.speed = false;
        }
    });
    // 离开页面时取消移动状态
    window.addEventListener('blur', () => {
        key.up = false;
        key.down = false;
        key.left = false;
        key.right = false;
    });
    // 页面大小改变时重新进行画布分割
    window.addEventListener('resize', () => {
        canvas.getCell();
    });
})();