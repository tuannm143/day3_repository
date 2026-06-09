// Data access layer.
// Tách ra từ legacy.js (Phase 3 - Bước 2).
//
// Module này SỞ HỮU dataset `D` và bộ đếm query `qc`. Vì Node cache module theo
// đường dẫn, `require('./data-store')` luôn trả về CÙNG một instance => `D` và
// `qc` là singleton dùng chung cho mọi nơi import. q() trả về tham chiếu thật
// vào `D`, nên side-effect (vd upd ghi od.s) vẫn mutate đúng instance này.

var D = {
  c: [
    { id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi' },
    { id: 2, n: 'Saigon Textile', t: 'B', d: 0.05, ct: 'HCMC' },
    { id: 3, n: 'Danang Fabrics', t: 'A', d: 0.1, ct: 'Danang' },
    { id: 4, n: 'Hue Trading', t: 'C', d: 0, ct: 'Hue' },
    { id: 5, n: 'Can Tho Apparel', t: 'B', d: 0.05, ct: 'Can Tho' }
  ],
  p: [
    { id: 101, n: 'T-Shirt Basic', pr: 4.5, cat: 'TOP', st: 1200 },
    { id: 102, n: 'Polo Shirt', pr: 7.25, cat: 'TOP', st: 800 },
    { id: 103, n: 'Hoodie Fleece', pr: 12.0, cat: 'TOP', st: 450 },
    { id: 104, n: 'Cargo Pants', pr: 11.5, cat: 'BOT', st: 600 },
    { id: 105, n: 'Denim Jeans', pr: 14.0, cat: 'BOT', st: 350 },
    { id: 106, n: 'Track Shorts', pr: 5.75, cat: 'BOT', st: 900 },
    { id: 107, n: 'Windbreaker', pr: 18.5, cat: 'OUT', st: 200 },
    { id: 108, n: 'Puffer Vest', pr: 22.0, cat: 'OUT', st: 150 }
  ],
  o: [
    { id: 1001, cid: 1, dt: '2026-01-05', s: 'DONE' },
    { id: 1002, cid: 2, dt: '2026-01-12', s: 'DONE' },
    { id: 1003, cid: 1, dt: '2026-01-20', s: 'CANCEL' },
    { id: 1004, cid: 3, dt: '2026-02-02', s: 'DONE' },
    { id: 1005, cid: 4, dt: '2026-02-09', s: 'OPEN' },
    { id: 1006, cid: 2, dt: '2026-02-15', s: 'DONE' },
    { id: 1007, cid: 5, dt: '2026-02-21', s: 'OPEN' },
    { id: 1008, cid: 3, dt: '2026-03-01', s: 'DONE' },
    { id: 1009, cid: 1, dt: '2026-03-08', s: 'OPEN' },
    { id: 1010, cid: 4, dt: '2026-03-15', s: 'DONE' }
  ],
  l: [
    { oid: 1001, pid: 101, q: 200 },
    { oid: 1001, pid: 104, q: 50 },
    { oid: 1002, pid: 102, q: 120 },
    { oid: 1002, pid: 105, q: 80 },
    { oid: 1002, pid: 101, q: 300 },
    { oid: 1003, pid: 103, q: 40 },
    { oid: 1004, pid: 107, q: 60 },
    { oid: 1004, pid: 101, q: 150 },
    { oid: 1005, pid: 106, q: 500 },
    { oid: 1006, pid: 108, q: 30 },
    { oid: 1006, pid: 102, q: 90 },
    { oid: 1007, pid: 104, q: 220 },
    { oid: 1007, pid: 105, q: 100 },
    { oid: 1008, pid: 103, q: 75 },
    { oid: 1008, pid: 106, q: 130 },
    { oid: 1009, pid: 101, q: 400 },
    { oid: 1010, pid: 107, q: 45 },
    { oid: 1010, pid: 102, q: 60 }
  ]
};

var qc = 0; // query counter, dont reset

// gets one row. t = table, k = key
function q(t, k) {
  qc = qc + 1;
  var a = D[t];
  for (var i = 0; i < a.length; i++) {
    if (a[i].id == k) {
      return a[i];
    }
  }
  return null;
}

// gets all rows for table
function qa(t) {
  qc = qc + 1;
  return D[t];
}

// lines for order
function ql(x) {
  qc = qc + 1;
  var r = [];
  for (var i = 0; i < D.l.length; i++) {
    if (D.l[i].oid == x) {
      r.push(D.l[i]);
    }
  }
  return r;
}

function cnt() {
  return qc;
}

module.exports = { q: q, qa: qa, ql: ql, cnt: cnt };
