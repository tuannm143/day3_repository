// order report module v2 final FINAL (do not touch, hieu knows how it works)
// last modified 2023-?? by someone

// Phase 3 - Bước 1: fmt được tách sang format.js (API công khai giữ nguyên).
var fmt = require('./format').fmt;

// Phase 3 - Bước 2: tầng truy cập dữ liệu (D, qc, q, qa, ql, cnt) tách sang
// data-store.js. require() trả về cùng một instance => D và qc vẫn là singleton.
var store = require('./data-store');
var q = store.q;
var qa = store.qa;
var ql = store.ql;
var cnt = store.cnt;

// Phase 3 - Bước 3 (Commit 3): calc & chk tách sang order-calculation.js.
var oc = require('./order-calculation');
var calc = oc.calc;
var chk = oc.chk;

// Phase 3 - Bước 4 (Commit 4): proc, getAll, top tách sang order-reports.js.
var reports = require('./order-reports');
var proc = reports.proc;
var getAll = reports.getAll;
var top = reports.top;

// update order status. returns log line for audit (dat said keep the format)
function upd(id, s) {
  var od = q('o', id);
  if (od == null) {
    return 'ERR|' + id + '|no such order';
  }
  if (s != 'OPEN' && s != 'DONE' && s != 'CANCEL') {
    return 'ERR|' + id + '|bad status ' + s;
  }
  if (od.s == 'CANCEL') {
    return 'ERR|' + id + '|already cancelled';
  }
  if (od.s == 'DONE' && s == 'OPEN') {
    return 'ERR|' + id + '|cannot reopen';
  }
  var old = od.s;
  od.s = s;
  var c = q('c', od.cid);
  return 'OK|' + id + '|' + old + '->' + s + '|' + c.n;
}

module.exports = { q: q, qa: qa, ql: ql, cnt: cnt, fmt: fmt, calc: calc, chk: chk, proc: proc, getAll: getAll, top: top, upd: upd };
