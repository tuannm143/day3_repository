// order report module v2 final FINAL (do not touch, hieu knows how it works)
// last modified 2023-?? by someone
//
// Phase 3 hoàn tất: legacy.js giờ là BARREL thuần — chỉ gom và re-export API
// công khai từ các module nhỏ. Hành vi & API giữ nguyên y hệt bản gốc.
//   data-store.js        -> q, qa, ql, cnt
//   format.js            -> fmt
//   order-calculation.js -> calc, chk
//   order-reports.js     -> proc, getAll, top
//   order-status.js      -> upd

var store = require('./data-store');
var fmt = require('./format').fmt;
var oc = require('./order-calculation');
var reports = require('./order-reports');
var upd = require('./order-status').upd;

module.exports = {
  q: store.q,
  qa: store.qa,
  ql: store.ql,
  cnt: store.cnt,
  fmt: fmt,
  calc: oc.calc,
  chk: oc.chk,
  proc: reports.proc,
  getAll: reports.getAll,
  top: reports.top,
  upd: upd
};
