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
            console.log(this.now);
            if (this[this.now].offsetWidth > this[this.now].offsetHeight) {
                this.cell.y = 5;
                this.cell.height = this[this.now].offsetHeight / 5;
                this.cell.x = Math.round(this[this.now].offsetWidth / this.cell.height);
                this.cell.width = this[this.now].offsetWidth / this.cell.x;
            } else {
                this.cell.x = 5;
                this.cell.width = this[this.now].offsetWidth / 5;
                this.cell.y = Math.round(this[this.now].offsetHeight / this.cell.width);
                this.cell.height = this[this.now].offsetHeight / this.cell.y;
            }
        },
        // 获取元素位置
        getSite(obj) {
            const size = obj.offsetWidth;
            return {
                x: +(obj.offsetLeft + size / 2).toFixed(2),
                y: +(obj.offsetTop + size / 2).toFixed(2)
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
        // 用于计算玩家能量恢复
        times: 0,
        // 敌人能量
        foeEngine: [],
        // 用于计算敌人能量恢复
        foeTimes: 0,
        // 人物移动
        move(obj) {
            const person = obj.person,
            width = distance.width,
            height = distance.height,
            size = distance.size,
            speed = size / obj.step,
            end = obj.end,
            personSite = canvas.getSite(person),
            angle = obj.end == null ? (obj.angle != null ? obj.angle / 180 * Math.PI : null) : (() => {
                const distance = {
                    x: end.x - personSite.x,
                    y: end.y - personSite.y
                };
                distance.total = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
                let angle = Math.asin(distance.x / distance.total);
                if (distance.y > 0) {
                    angle = -(angle / Math.PI * 180) + 180;
                } else {
                    angle = angle / Math.PI * 180 + 360;
                }
                return angle / 180 * Math.PI;
            })();
            if (angle == null) {
                return;
            }
            let xSpeed = speed * +(Math.sin(angle).toFixed(2)),
            ySpeed = speed * +(Math.cos(angle).toFixed(2));
            ySpeed = -ySpeed;
            if (end) {
                if ((end.x < personSite.x && personSite.x + xSpeed < end.x) || (end.x > personSite.x && personSite.x + xSpeed > end.x)) {
                    xSpeed = end.x - personSite.x;
                }
                if ((end.y < personSite.y && personSite.y + ySpeed < end.y) || (end.y > personSite.y && personSite.y + ySpeed > end.y)) {
                    ySpeed = end.y - personSite.y;
                }
                if (Math.abs(parseInt(end.x) - parseInt(personSite.x)) <= 1 && Math.abs(parseInt(end.y) - parseInt(personSite.y)) <= 1) {
                    return;
                }
            }
            if (person.offsetTop + ySpeed < 0) {
                person.style.top = 0;
            } else if (person.offsetTop + ySpeed > height - size) {
                person.style.top = height - size + 'px';
            } else {
                person.style.top = +(person.style.top.replace('px', '')) + ySpeed + 'px';
            }
            if (person.offsetLeft + xSpeed < 0) {
                person.style.left = 0;
            } else if (person.offsetLeft + xSpeed > width - size) {
                person.style.left = width - size + 'px';
            } else {
                person.style.left = +(person.style.left.replace('px', '')) + xSpeed + 'px';
            }
        },
        // 生成人物
        create(type) {
            const person = document.createElement('div');
            person.classList.add(type);
            if (navigator.userAgent.toLowerCase().includes('mobile')) {
                person.classList.add('mobilePerson');
            } else {
                person.classList.add('person');
            }
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
                this.foeEngine[i] = 100;
            }
        },
        // 清空人物
        clear() {
            this.player = null;
            this.foe = null;
            this.engine = 100;
            this.times = 0;
            this.foeEngine = [];
            this.foeTimes = 0;
        }
    },
    // 闯关模式的火苗
    fire = {
        // 火苗
        fires: [],
        // 火苗种类
        type: [],
        // 可以放置火苗的位置
        can: [],
        // 火苗位置
        site: [],
        // 玩家火苗值
        score: 0,
        // 获取可以放置火苗的位置
        getSite() {
            for (let i = 1; i < canvas.cell.y - 1; i++) {
                this.site[i] = [];
                for (let j = 0; j < canvas.cell.x; j++) {
                    this.site[i][j] = j;
                }
            }
        },
        // 生成火苗
        create(type) {
            const fire = document.createElement('img');
            fire.src = 'img/fire' + ['Small', 'Middle', 'Big'][type] + '.png';
            fire.classList.add('fire');
            if (navigator.userAgent.toLowerCase().includes('mobile')) {
                fire.classList.add('mobileFire');
            }
            this.fires.push(fire);
            this.type.push(type);
            canvas[canvas.now].appendChild(fire);
            const number = (() => {
                let number = 0;
                for (const i in this.site) {
                    if (this.site[i]) {
                        number++;
                    }
                }
                return number;
            })(),
            siteY = (() => {
                let randomNumber = Math.floor(Math.random() * number);
                for (const i in this.site) {
                    if (this.site[i]) {
                        if (!randomNumber) {
                            return +i;
                        }
                        randomNumber--;
                    }
                }
            })(),
            siteX = (() => {
                const randomNumber = Math.floor(Math.random() * this.site[siteY].length);
                return this.site[siteY].splice(randomNumber, 1)[0];
            })();
            if (!this.site[siteY].length) {
                this.site[siteY] = null;
            }
            canvas.setSite(fire, siteX, siteY);
        },
        // 移除火苗
        delete(i) {
            canvas[canvas.now].removeChild(this.fires[i]);
            this.fires.splice(i, 1);
            return [1, 5, 10][this.type.splice(i, 1)[0]];
        },
        // 清空火苗
        clear() {
            this.fires = [];
            this.type = [];
            this.site = [];
            this.score = 0;
            this.getSite();
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
        get foe() {
            const arr = [];
            for (let i in person.foe) {
                arr[i] = this.get(canvas.getSite(person.player), canvas.getSite(person.foe[i]));
            }
            return arr;
        },
        // 玩家与闯关模式的火苗的距离
        get fire() {
            const arr = [];
            for (const i in fire.fires) {
                if (fire.fires[i]) {
                    arr[i] = this.get(canvas.getSite(person.player), canvas.getSite(fire.fires[i]));
                }
            }
            return arr;
        },
        // 敌人与闯关模式的火苗的距离
        get foeFire() {
            const arr = [];
            for (const i in person.foe) {
                arr[i] = [];
                for (const j in fire.fires) {
                    if (fire.fires[j]) {
                        arr[i][j] = this.get(canvas.getSite(person.foe[i]), canvas.getSite(fire.fires[j]));
                    }
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
            // 画布分格
            c.getCell();
            p.clear();
            f.clear();
            // 生成火苗并随机设置位置
            for (const i in fires) {
                for (let j = 0; j < fires[i]; j++) {
                    f.create(+i);
                }
            }
            p.get(foeNumber);
            // 生成敌人并随机设置位置
            const foeSite = [];
            for (let i = 0; i < c.cell.x; i++) {
                foeSite.push(i);
            }
            for (const i in p.foe) {
                const randomSite = Math.floor(Math.random() * foeSite.length);
                c.setSite(p.foe[i], foeSite.splice(randomSite, 1)[0], 0);
            }
            // 生成玩家并随机设置位置
            c.setSite(p.player, Math.floor(Math.random() * c.cell.x), c.cell.y - 1);
        };
        startSet({
            0: 1,
            2: 5,
        }, 1);
        body.onclick = () => {
            startSet({
                0: 2,
                2: 8
            }, 1);
        };
        setInterval(() => {
            let foeDistance = d.foe;
            let foeFireDistance = d.foeFire;
            if (p.times == 5) {
                if (p.engine < 100) {
                    p.engine++;
                }
                p.times = 0;
            }
            p.times++;
            if (p.foeTimes == 3) {
                for (const i in p.foeEngine) {
                    if (p.foeEngine[i] < 100) {
                        p.foeEngine[i]++;
                    }
                }
                p.foeTimes = 0;
            }
            p.foeTimes++;
            const angle = (() => {
                let angle = {
                    x: null,
                    y: null,
                };
                if (key.up != key.down) {
                    if (key.up) {
                        angle.y = 0;
                    } else {
                        angle.y = 180;
                    }
                }
                if (key.left != key.right) {
                    if (key.left) {
                        angle.x = 270;
                        if (angle.y == 0) {
                            angle.y = 360;
                        }
                    } else {
                        angle.x = 90;
                    }
                }
                if (angle.x != null || angle.y != null) {
                    return (+angle.x + +angle.y) / (+(angle.x != null) + +(angle.y != null));
                } else {
                    return null;
                }
            })();
            if (key.speed && p.engine > 0) {
                p.move({
                    person: p.player,
                    step: 50 / 1.5,
                    angle: angle
                });
                p.engine--;
            } else {
                p.move({
                    person: p.player,
                    step: 50,
                    angle: angle
                });
            }
            for (const i in foeDistance) {
                if (foeDistance[i] < d.size * 3) {
                    if (foeDistance[i] < d.size * 1.5 && p.foeEngine[i] > 0) {
                        p.move({
                            person: p.foe[i],
                            step: 50 / 0.7,
                            end: c.getSite(p.player)
                        });
                        p.foeEngine[i]--;
                    } else {
                        p.move({
                            person: p.foe[i],
                            step: 50 / 0.5,
                            end: c.getSite(p.player)
                        });
                    }
                } else {
                    if (f.fires.length) {
                        let min = 0;
                        for (let j = 1; j < foeFireDistance[i].length; j++) {
                            if (foeFireDistance[i][min] > foeFireDistance[i][j]) {
                                min = +j;
                            }
                        }
                        p.move({
                            person: p.foe[i],
                            step: 50 / 0.5,
                            end: c.getSite(f.fires[min])
                        });
                    } else {
                        p.move({
                            person: p.foe[i],
                            step: 50 / 0.5,
                            end: {
                                x: c[c.now].offsetWidth / 2,
                                y: c[c.now].offsetHeight / 2 
                            }
                        });
                    }
                }
            }
            const fireDistance = d.fire;
            for (let i = 0; i < f.fires.length; i) {
                if (fireDistance[i] < d.size / 2) {
                    f.score += f.delete(i);
                    fireDistance.splice(i, 1);
                    console.log(f.score);
                } else {
                    i++;
                }
            }
            foeFireDistance = d.foeFire;
            for (const i in foeFireDistance) {
                for (let j = 0; j < f.fires.length; j) {
                    if (foeFireDistance[i][j] < d.size / 2) {
                        f.delete(j);
                        foeFireDistance[i].splice(j, 1);
                    } else {
                        j++;
                    }
                }
            }
            foeDistance = d.foe;
            for (const i in foeDistance) {
                if (foeDistance[i] < d.size) {
                    //console.log(555);
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
        if (canvas.now) {
            canvas.getCell();
        }
    });
})();