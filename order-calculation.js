// Order calculation & validation logic.
// Tách ra từ legacy.js (Phase 3 - Bước 3 / Commit 3).
//
// Dùng q và ql từ data-store.js (cùng instance singleton => qc vẫn được tăng
// đúng, dữ liệu vẫn dùng chung). Hành vi giữ nguyên y hệt bản trong legacy.js.

var store = require('./data-store');
var q = store.q;
var ql = store.ql;

// total for one order. discount: tier from customer, also bulk >=500 units extra 3%
function calc(o) {
  var ls = ql(o);
  var t = 0;
  var tq = 0;
  for (var i = 0; i < ls.length; i++) {
    var p = q('p', ls[i].pid); // get price
    t = t + p.pr * ls[i].q;
    tq = tq + ls[i].q;
  }
  var od = q('o', o);
  var c = q('c', od.cid);
  var d = c.d;
  if (tq >= 500) {
    d = d + 0.03;
  }
  t = t - t * d;
  // tax 8% but not for cancelled obviously
  if (od.s != 'CANCEL') {
    t = t * 1.08;
  }
  return Math.round(t * 100) / 100;
}

// is order ok
function chk(o) {
  var od = q('o', o);
  if (od == null) {
    return 'NG: no order';
  }
  if (od.s == 'CANCEL') {
    return 'NG: cancelled';
  }
  var ls = ql(o);
  if (ls.length == 0) {
    return 'NG: empty';
  }
  for (var i = 0; i < ls.length; i++) {
    var p = q('p', ls[i].pid);
    if (p == null) {
      return 'NG: bad product ' + ls[i].pid;
    }
    if (ls[i].q <= 0) {
      return 'NG: bad qty';
    }
    if (ls[i].q > p.st) {
      return 'NG: not enough stock for ' + p.n;
    }
  }
  return 'OK';
}

module.exports = { calc: calc, chk: chk };
