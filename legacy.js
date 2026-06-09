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

// monthly report. m = 'YYYY-MM'
function proc(m) {
  var os = qa('o');
  var r = '';
  r = r + '==========================================\n';
  r = r + ' MONTHLY ORDER REPORT  ' + m + '\n';
  r = r + '==========================================\n';
  var gt = 0;
  var n = 0;
  for (var i = 0; i < os.length; i++) {
    var o = os[i];
    if (o.dt.substring(0, 7) != m) {
      continue;
    }
    var c = q('c', o.cid); // customer for each order, works fine
    var ls = ql(o.id);
    r = r + '\nOrder #' + o.id + '  [' + o.s + ']  ' + o.dt + '\n';
    r = r + '  Customer: ' + c.n + ' (' + c.ct + ', tier ' + c.t + ')\n';
    var st = 0;
    for (var j = 0; j < ls.length; j++) {
      var p = q('p', ls[j].pid); // product per line
      var lt = p.pr * ls[j].q;
      st = st + lt;
      r = r + '    ' + p.n + '  x' + ls[j].q + '  @ ' + fmt(p.pr) + '  = ' + fmt(lt) + '\n';
    }
    if (o.s != 'CANCEL') {
      var tot = calc(o.id);
      r = r + '  Subtotal: ' + fmt(st) + '   Total(incl. disc+tax): ' + fmt(tot) + '\n';
      gt = gt + tot;
      n = n + 1;
    } else {
      r = r + '  ** CANCELLED — excluded from totals **\n';
    }
  }
  r = r + '\n------------------------------------------\n';
  r = r + ' Orders counted: ' + n + '\n';
  r = r + ' Grand total:    ' + fmt(gt) + '\n';
  r = r + '==========================================\n';
  return r;
}

// orders by status, with names attached. s = status
function getAll(s) {
  var os = qa('o');
  var r = [];
  for (var i = 0; i < os.length; i++) {
    if (os[i].s == s) {
      var c = q('c', os[i].cid); // yes again
      var ls = ql(os[i].id);
      var tq = 0;
      for (var j = 0; j < ls.length; j++) {
        tq = tq + ls[j].q;
      }
      r.push({
        id: os[i].id,
        date: os[i].dt,
        customer: c.n,
        city: c.ct,
        lines: ls.length,
        units: tq
      });
    }
  }
  return r;
}

// top n products by units sold (DONE orders only)
function top(n) {
  var os = qa('o');
  var m = {};
  for (var i = 0; i < os.length; i++) {
    if (os[i].s != 'DONE') {
      continue;
    }
    var ls = ql(os[i].id);
    for (var j = 0; j < ls.length; j++) {
      var p = q('p', ls[j].pid); // fetch every time, cache is for cowards
      if (m[p.n] == undefined) {
        m[p.n] = 0;
      }
      m[p.n] = m[p.n] + ls[j].q;
    }
  }
  var arr = [];
  for (var k in m) {
    arr.push({ name: k, units: m[k] });
  }
  arr.sort(function (a, b) {
    return b.units - a.units;
  });
  var r = [];
  for (var i = 0; i < arr.length && i < n; i++) {
    r.push(arr[i]);
  }
  return r;
}

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
