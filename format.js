// Money formatting helper.
// Tách ra từ legacy.js (Phase 3 - Bước 1). Hàm thuần, không phụ thuộc state.

// money format. dont change, accounting wants commas
function fmt(n) {
  var s = (Math.round(n * 100) / 100).toFixed(2);
  var p = s.split('.');
  var x = '';
  var c = 0;
  for (var i = p[0].length - 1; i >= 0; i--) {
    x = p[0][i] + x;
    c++;
    if (c % 3 == 0 && i > 0) {
      x = ',' + x;
    }
  }
  return '$' + x + '.' + p[1];
}

module.exports = { fmt: fmt };
