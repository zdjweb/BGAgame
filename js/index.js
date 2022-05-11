(() => {
    // html页面
    const html = document.querySelector('html'),
    // body
    body = document.querySelector('body'),
    // 页面对象
    page = {
        // 当前页面
        now: null,
        // 设置页面显示前的页面
        set: null,
        // 定时器
        timer: null,
        // 获取对应名字的页面
        get(name) {
            return document.querySelector('#' + name);
        },
        // 显示页面
        show(e, f) {
            const newE = e;
            e = p.get(p.now = e);
            let opacity = +window.getComputedStyle(e).opacity;
            if (p.timer || opacity) {
                return;
            }
            e.style.display = 'block';
            if (newE == 'fire') {
                c.now = e;
                fireStart(1);
            }
            p.timer = setInterval(() => {
                if (opacity < 1) {
                    e.style.opacity = +((opacity += 0.01).toFixed(2));
                } else {
                    e.style.opacity = 1;
                    clearInterval(p.timer);
                    p.timer = null;
                    f ? f() : 0;
                }
            }, 5);
        },
        // 隐藏页面
        display(e, f) {
            e = p.get(e);
            let opacity = +window.getComputedStyle(e).opacity;
            if (p.timer || !opacity) {
                return;
            }
            p.timer = setInterval(() => {
                if (opacity > 0) {
                    e.style.opacity = +((opacity -= 0.01).toFixed(2));
                } else {
                    Object.assign(e.style, {
                        display: 'none',
                        opacity: 0
                    });
                    clearInterval(p.timer);
                    p.timer = null;
                    f ? f() : 0;
                }
            }, 5);
        }
    },
    p = page,
    // 画布对象
    canvas = {
        // 当前画布
        now: null,
        // 获取画布
        get(name) {
            return p.get(name);
        },
        // 格子信息
        cell: {
            // 横向数量
            x: 0,
            // 竖向数量
            y: 0,
            // 宽度
            width: 0,
            //高度
            height: 0
        },
        // 画布分割
        getCell() {
            const w = c.now.offsetWidth,
            h = c.now.offsetHeight;
            if (w > h) {
                c.cell.y = 5;
                c.cell.height = h / 5;
                c.cell.x = Math.round(w / c.cell.height);
                c.cell.width = w / c.cell.x;
            } else {
                c.cell.x = 5;
                c.cell.width = w / 5;
                c.cell.y = Math.round(h / c.cell.width);
                c.cell.height = h / c.cell.y;
            }
        },
        // 获取元素所在的分格
        getCellSite(obj) {
            obj = c.getSite(obj);
            const w = c.cell.width,
            h = c.cell.height;
            for (let i = 0; i < c.cell.x; i++) {
                if (obj.x >= i * w && obj.x <= (i + 1) * w) {
                    obj.x = i;
                    break;
                }
            }
            for (let i = 0; i < c.cell.y; i++) {
                if (obj.y >= i * h && obj.y <= (i + 1) * h) {
                    obj.y = i;
                    break;
                }
            }
            return obj;
        },
        // 获取元素位置
        getSite(obj) {
            return {
                x: obj.offsetLeft + obj.offsetWidth / 2,
                y: obj.offsetTop + obj.offsetHeight / 2
            };
        },
        // 设置元素位置
        setSite(obj, x, y) {
            const w = c.cell.width,
            h = c.cell.height;
            x = {
                min: x * w,
                max: (x + 1) * w - obj.offsetWidth
            },
            y = {
                min: y * h,
                max: (y + 1) * h - obj.offsetHeight
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
            const children = c.now.children;
            for (let i = 0; i < children.length;) {
                c.now.removeChild(children[i]);
            }
        }
    },
    c = canvas,
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
        foeEngine: null,
        // 用于计算敌人能量恢复
        foeTimes: 0,
        // 人物移动
        move(obj) {
            const person = obj.person,
            w = distance.width,
            h = distance.height,
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
                if (Math.abs(end.x - personSite.x) <= 1 && Math.abs(end.y - personSite.y) <= 1) {
                    return;
                }
            }
            if (person.offsetTop + ySpeed < 0) {
                person.style.top = 0;
            } else if (person.offsetTop + ySpeed > h - size) {
                person.style.top = h - size + 'px';
            } else {
                person.style.top = +(person.style.top.replace('px', '')) + ySpeed + 'px';
            }
            if (person.offsetLeft + xSpeed < 0) {
                person.style.left = 0;
            } else if (person.offsetLeft + xSpeed > w - size) {
                person.style.left = w - size + 'px';
            } else {
                person.style.left = +(person.style.left.replace('px', '')) + xSpeed + 'px';
            }
        },
        // 生成人物
        create(type) {
            const person = document.createElement('div');
            person.classList.add('person');
            person.classList.add(type);
            if (navigator.userAgent.toLowerCase().includes('mobile')) {
                person.classList.add('mobilePerson');
            }
            person.appendChild(document.createElement('div'));
            c.now.appendChild(person);
            return person;
        },
        // 获取人物
        get(n) {
            // 生成玩家并随机设置位置
            h.player = h.create('player');
            c.setSite(h.player, Math.floor(Math.random() * c.cell.x), c.cell.y - 1);
            // 生成敌人并随机设置位置
            h.foe = [],
            h.foeEngine = [];
            const foeSite = [];
            for (let i = 0; i < c.cell.x; i++) {
                foeSite.push(i);
            }
            for (let i = 0; i < n; i++) {
                h.foe[i] = h.create('foe');
                h.foeEngine[i] = 100;
                const randomSite = Math.floor(Math.random() * foeSite.length);
                c.setSite(h.foe[i], foeSite.splice(randomSite, 1)[0], 0);
            }
        },
        // 清空人物
        clear() {
            h.player = null;
            h.foe = null;
            h.engine = 100;
            h.times = 0;
            h.foeTimes = 0;
        }
    },
    h = person,
    // 玩家按键状态
    key = {
        up: false,
        down: false,
        left: false,
        right: false,
        speed: false
    },
    k = key,
    // 闯关模式的火苗
    fire = {
        // 火苗
        fires: [],
        // 火苗种类
        type: [],
        // 玩家火苗值
        score: 0,
        // 生成火苗
        create(type) {
            const fire = document.createElement('img');
            fire.src = 'img/fire' + ['Small', 'Medium', 'Big'][type] + '.png';
            fire.classList.add('fire');
            if (navigator.userAgent.toLowerCase().includes('mobile')) {
                fire.classList.add('mobileFire');
            }
            const site = [];
            for (let i = 0; i < c.cell.y; i++) {
                site[i] = [];
                for (let j = 0; j < c.cell.x; j++) {
                    site[i][j] = j;
                }
            }
            const playerSite = c.getCellSite(h.player);
            let siteY = site[playerSite.y];
            siteY.splice(siteY.indexOf(playerSite.x), 1);
            const foeSite = [];
            for (const i in h.foe) {
                foeSite[i] = canvas.getCellSite(h.foe[i]);
                siteY = site[foeSite[i].y];
                if (siteY) {
                    if (!siteY.length) {
                        siteY = null;
                    } else if (siteY.includes(foeSite[i].x)) {
                        siteY.splice(siteY.indexOf(foeSite[i].x), 1);
                    }
                }
            }
            const fireSite = [];
            for (const i in f.fires) {
                fireSite[i] = c.getCellSite(f.fires[i]);
                siteY = site[fireSite[i].y];
                if (siteY) {
                    if (!siteY.length) {
                        siteY = null;
                    } else if (siteY.includes(fireSite[i].x)) {
                        siteY.splice(siteY.indexOf(fireSite[i].x), 1);
                    }
                }
            }
            let number = 0;
            for (const i in site) {
                if (site[i]) {
                    number++;
                }
            }
            let randomNumber = Math.floor(Math.random() * number);
            for (const i in site) {
                if (site[i]) {
                    if (!randomNumber) {
                        siteY = +i;
                        break;
                    }
                    randomNumber--;
                }
            }
            randomNumber = Math.floor(Math.random() * site[siteY].length);
            const siteX = site[siteY].splice(randomNumber, 1)[0];
            c.get('fire').appendChild(fire);
            c.setSite(fire, siteX, siteY);
            f.fires.push(fire);
            f.type.push(type);
        },
        // 移除火苗
        delete(i) {
            c.get('fire').removeChild(f.fires[i]);
            f.fires.splice(i, 1);
            return [1, 5, 10][f.type.splice(i, 1)[0]];
        },
        // 清空火苗
        clear() {
            f.fires = [];
            f.type = [];
            f.score = 0;
        }
    },
    f = fire,
    // 常用距离
    distance = {
        // 获取两元素中心点之间的距离
        get(...obj) {
            return Math.sqrt(Math.pow(Math.abs(obj[0].x - obj[1].x), 2) + Math.pow(Math.abs(obj[0].y - obj[1].y), 2));
        },
        // 画布宽度
        get width() {
            return c.now.offsetWidth;
        },
        // 画布高度
        get height() {
            return c.now.offsetHeight;
        },
        // 人物大小
        get size() {
            return h.player.offsetWidth;
        },
        // 玩家与敌人的距离
        get foe() {
            const arr = [];
            for (let i in h.foe) {
                arr[i] = d.get(c.getSite(h.player), c.getSite(person.foe[i]));
            }
            return arr;
        },
        // 玩家与闯关模式的火苗的距离
        get fire() {
            const arr = [];
            for (const i in f.fires) {
                if (f.fires[i]) {
                    arr[i] = d.get(c.getSite(h.player), c.getSite(f.fires[i]));
                }
            }
            return arr;
        },
        // 敌人与闯关模式的火苗的距离
        get foeFire() {
            const arr = [];
            for (const i in h.foe) {
                arr[i] = [];
                for (const j in f.fires) {
                    if (f.fires[j]) {
                        arr[i][j] = d.get(c.getSite(h.foe[i]), c.getSite(f.fires[j]));
                    }
                }
            }
            return arr;
        }
    },
    d = distance;
    // 定时器
    let timer = null;
    p._now = p.get('index');
    // 闯关模式
    const fireStart = (number) => {
        let fires,
        foeNumber;
        if (number == 1) {
            fires = {
                0: 3
            };
            foeNumber = 1;
        } else if (number == 2) {
            fires = {
                0: 3,
                1: 2
            };
            foeNumber = 1;
        } else if (number == 3) {
            fires = {
                0: 3,
                1: 2,
                2: 1
            };
            foeNumber = 1;
        }
        c.clear();
        // 画布分格
        c.getCell();
        // 清空人物
        h.clear();
        // 清空火苗
        f.clear();
        // 生成人物
        h.get(foeNumber);
        // 生成火苗
        for (const i in fires) {
            for (let j = 0; j < fires[i]; j++) {
                f.create(+i);
            }
        }
        timer = setInterval(() => {
            let foeDistance = d.foe;
            let foeFireDistance = d.foeFire;
            if (h.times == 5) {
                if (h.engine < 100) {
                    h.engine++;
                }
                h.times = 0;
            }
            h.times++;
            if (h.foeTimes == 3) {
                for (const i in h.foeEngine) {
                    if (h.foeEngine[i] < 100) {
                        h.foeEngine[i]++;
                    }
                }
                h.foeTimes = 0;
            }
            h.foeTimes++;
            const angle = (() => {
                let angle = {
                    x: null,
                    y: null,
                };
                if (k.up != k.down) {
                    if (k.up) {
                        angle.y = 0;
                    } else {
                        angle.y = 180;
                    }
                }
                if (k.left != k.right) {
                    if (k.left) {
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
            if (k.speed && h.engine > 0) {
                h.move({
                    person: h.player,
                    step: 50 / 1.5,
                    angle: angle
                });
                h.engine--;
            } else {
                h.move({
                    person: h.player,
                    step: 50,
                    angle: angle
                });
            }
            for (const i in foeDistance) {
                if (foeDistance[i] < d.size * 3) {
                    if (foeDistance[i] < d.size * 1.5 && h.foeEngine[i] > 0) {
                        h.move({
                            person: h.foe[i],
                            step: 50 / 0.7,
                            end: c.getSite(h.player)
                        });
                        h.foeEngine[i]--;
                    } else {
                        h.move({
                            person: h.foe[i],
                            step: 50 / 0.5,
                            end: c.getSite(h.player)
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
                        h.move({
                            person: h.foe[i],
                            step: 50 / 0.5,
                            end: c.getSite(f.fires[min])
                        });
                    } else {
                        h.move({
                            person: h.foe[i],
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
    p.get('fire').addEventListener('click', () => {
        clearInterval(timer);
        fireStart(3);
    });
    // 页面控制部分
    (() => {
        // 设置按钮
        const settingBtn = document.querySelectorAll('.setting'),
        // 返回首页按钮
        returnIndex = p.get('returnIndex'),
        // 退出游戏按钮
        exit = p.get('exit');
        // 点击进入选择页面
        p.get('index').addEventListener('click', () => {
            p.display('index', () => {
                p.show('choice');
            });
        });
        // 点击进入闯关模式
        p.get('choice').addEventListener('click', (e) => {
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
        p.get('setting').addEventListener('click', function(e) {
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
    })();
    // 按键控制部分
    (() => {
        // 按下按键时改变按键状态
        body.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowUp') {
                k.up = true;
            } else if (e.key == 'ArrowDown') {
                k.down = true;
            } else if (e.key == 'ArrowLeft') {
                k.left = true;
            } else if (e.key == 'ArrowRight') {
                k.right = true;
            } else if (e.key == ' ') {
                k.speed = true;
            }
        });
        // 松开按键时改变按键状态
        body.addEventListener('keyup', (e) => {
            if (e.key == 'ArrowUp') {
                k.up = false;
            } else if (e.key == 'ArrowDown') {
                k.down = false;
            } else if (e.key == 'ArrowLeft') {
                k.left = false;
            } else if (e.key == 'ArrowRight') {
                k.right = false;
            } else if (e.key == ' ') {
                k.speed = false;
            }
        });
        // 离开页面时取消移动状态
        window.addEventListener('blur', () => {
            for (const i in k) {
                k[i] = false;
            }
        });
        // 页面大小改变时重新进行画布分割
        window.addEventListener('resize', () => {
            if (c.now) {
                c.getCell();
            }
        });
    })();
})();