const board = document.getElementsByClassName('canvas')[0];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

onselectstart = (e) => {e.preventDefault()}

canvas.width = board.clientWidth;
canvas.height = board.clientHeight;
ctx.font = "40px Arial";

const w = canvas.width, h = canvas.height;
const n = 9, c = 3
const cw = w / n, ch = h / n;
const line_w = 5;

const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
let cases = [];
let taken = [];

function initialize() {
    ctx.lineWidth = line_w;
    for (let j = 0; j < c; ++j) {
        for (let i = 0; i < c; ++i) {
            ctx.strokeRect(i * 3 * cw, j * c * ch, 3 * cw, 3 * ch);
        }
    }

    ctx.lineWidth = 1;
    for (let j = 0; j < n; ++j) {
        cases[j] = [];
        for (let i = 0; i < n; ++i) {
            cases[j][i] = null;
            ctx.strokeRect(i * cw, j * ch, cw, ch);
        }
    }
}

function set(j, i, k) {
    cases[j][i] = k;
    ctx.save(); {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(i * cw + line_w, j * ch + line_w, cw - (2 * line_w), ch - (2 * line_w));
    } ctx.restore();
    if (k !== null) ctx.fillText(k, (i + .5) * cw - 12, (j + .5) * ch + 15);
}

function example() {
    let ex = [
        [null, 5, null, 3, null, null, null, 7, null],
        [1, null, null, null, 2, null, 8, null, null],
        [null, 2, null, 4, null, 9, null, null, null],
        [null, null, 3, 1, null, null, 7, null, 6],
        [null, 4, null, null, 6, null, null, 5, null],
        [5, null, 6, null, null, 3, 4, null, null],
        [null, null, null, 8, null, 2, null, 3, null],
        [null, null, 7, null, 9, null, null, null, 2],
        [null, 6, null, null, null, 1, null, 8, null]
    ]
    ctx.save(); {
        ctx.fillStyle = '#0000CC';
        for (let j = 0; j < n; ++j) {
            for (let i = 0; i < n; ++i) {
                set(j, i, ex[j][i]);
            }
        }
    } ctx.restore();
}

canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const i = Math.floor(x / cw), j = Math.floor(y / ch);

    ctx.save(); {
        ctx.fillStyle = '#0000CC';
        switch (cases[j][i]) {
            case null:
                set(j, i, 1);
                break;
            case 9:
                set(j, i, null);
                break;
            default:
                set(j, i, cases[j][i] + 1);
        }
    } ctx.restore();
})

function row(array, j) {
    return array[j];
}

function column(array, i) {
    let col = [];
    for (let row of array) {
        col.push(row[i]);
    } return col;
}

function unique(array) {
    let viewed = new Set()
    for (let val of array) {
        if (viewed.has(val)) {
            return false;
        } else {
            viewed.add(val);
        }
    } return true;
}

function correct() {
    let boxes = [], r, line;
    for (let i = 0; i < n; ++i) { boxes[i] = []; }

    for (let j = 0; j < n; ++j) {
        r = row(cases, j);
        if (!unique(r)) { return false; }
        line = 3 * Math.floor(j / 3);
        for (let i = 0; i < n; ++i) {
            boxes[line + Math.floor(i / 3)].push(r[i]);
        }
    }
    for (let box of boxes) { if (!unique(box)) return false; }
    for (let i = 0; i < n; ++i) { if (!unique(column(cases, i))) return false; }
    return true;
}

let interval;
function step() {
    taken = [];
    for (let j = 0; j < n; ++j) {
        taken[j] = [];
        for (let i = 0; i < n; ++i) {
            taken[j][i] = new Set();
        }
    }
    let val;
    for (let j = 0; j < n; ++j) {
        for (let i = 0; i < n; ++i) {
            val = cases[j][i];
            if (val) {
                for (let vj = 0; vj < n; ++vj) {
                    if (!cases[vj][i]) taken[vj][i].add(val);
                }
                for (let vi = 0; vi < n; ++vi) {
                    if (!cases[j][vi]) taken[j][vi].add(val);
                }
                let bj = Math.floor(j / 3), bi = Math.floor(i / 3);
                for (let cj = 3 * bj; cj < 3 * (bj + 1); ++cj) {
                    for (let ci = 3 * bi; ci < 3 * (bi + 1); ++ci) {
                        if (!cases[cj][ci]) taken[cj][ci].add(val);
                    }
                }
            }
        }
    }

    let boxes = [], r, line, groups, free, diff, found, cell;
    for (let i = 0; i < n; ++i) { boxes[i] = []; }
    for (let j = 0; j < n; ++j) {
        r = row(taken, j);
        line = 3 * Math.floor(j / 3);
        for (let i = 0; i < n; ++i) {
            boxes[line + Math.floor(i / 3)].push(r[i]);
        }
    }
    for (let i = 0; i < n; ++i) {
        groups = [];
        for (let c = 0; c < n; ++c) {
            cell = boxes[i][c]
            if (cell.size > 1 && cell.size < (n - 1)) {
                free = new Set([...possible].filter(x => !cell.has(x)));
                found = false;
                for (let i = 0; i < groups.length; ++i) {
                    if (groups[i][0].size >= free.size) diff = new Set([...groups[i][0]].filter(x => !free.has(x)));
                    else diff = new Set([...free].filter(x => !groups[i][0].has(x)));
                    if (!diff.size) {
                        ++groups[i][1];
                        groups[i][2].add(c);
                        found = true;
                        break;
                    }
                }
                if (!found) groups.push([free, 1, new Set([c])]);
            }
        }
        for (let group of groups) {
            if (group[1] !== 1 && group[0].size === group[1]) {
                let bj = Math.floor(i / 3);
                let bi = i - (3 * bj);
                for (let cj = 3 * bj; cj < 3 * (bj + 1); ++cj) {
                    for (let ci = 3 * bi; ci < 3 * (bi + 1); ++ci) {
                        if (!cases[cj][ci]) {
                            if (!group[2].has(3 * Math.floor(cj / 3) + Math.floor(ci / 3))) {
                                for (let val of group[0]) {
                                    taken[cj][ci].add(val);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    for (let j = 0; j < n; ++j) {
        for (let i = 0; i < n; ++i) {
            if (!cases[j][i] && taken[j][i].size === n - 1) {
                for (let k of possible) {
                    if (!taken[j][i].has(k)) {
                        set(j, i, k);
                        console.log('[' + j + ', ' + i + '] can only be a ' + k);
                        return;
                    }
                }
            }
        }
    }
    for (let j = 0; j < n; ++j) {
        for (let i = 0; i < n; ++i) {
            if (!cases[j][i]) {
                free = new Set([...possible].filter(x => !taken[j][i].has(x)));
                for (let k of free) {
                    let can = true;
                    let bj = Math.floor(j / 3), bi = Math.floor(i / 3);
                    for (let cj = 3 * bj; cj < 3 * (bj + 1); ++cj) {
                        for (let ci = 3 * bi; ci < 3 * (bi + 1); ++ci) {
                            if ((cj !== j || ci !== i) && !cases[cj][ci] && !taken[cj][ci].has(k)) {
                                can = false;
                                break;
                            }
                        } if (!can) break;
                    }
                    if (can) {
                        set(j, i, k);
                        console.log('[' + j + ', ' + i + '] needs to be a ' + k);
                        return;
                    }
                }
            }
        }
    }
    clearInterval(interval);
    console.log(correct());
}

function solve() {
    interval = setInterval(step, 100);
}

initialize();
example();
