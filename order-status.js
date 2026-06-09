// Order status update.
// Tách ra từ legacy.js (Phase 3 - Bước 5 / Commit 5).
//
// Dùng q từ data-store.js (cùng instance singleton). upd CÓ side-effect: ghi
// od.s = s lên object lấy từ q('o', id) — vì q trả tham chiếu thật vào D nên
// mutation vẫn tác động đúng dataset dùng chung. Hành vi giữ nguyên y hệt.

var q = require('./data-store').q;

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

module.exports = { upd: upd };
