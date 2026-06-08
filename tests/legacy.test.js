// Characterisation tests for legacy.js (Phase 2).
//
// MỤC ĐÍCH: "chụp ảnh" (pin) hành vi HIỆN TẠI của legacy.js — kể cả khi hành vi
// trông xấu/kỳ lạ. KHÔNG sửa production code, KHÔNG refactor. Nếu sau này có ai
// thay đổi logic, các test này sẽ đỏ và buộc phải xem xét lại.
//
// LƯU Ý KỸ THUẬT:
//  - legacy.js dùng biến toàn cục `qc` (đếm query) và dữ liệu `D` có thể bị
//    mutate (vd: upd ghi đè trạng thái đơn). Để mỗi test độc lập & xác định,
//    ta nạp lại module mới tinh trước mỗi test bằng jest.resetModules().

let legacy;

beforeEach(() => {
  jest.resetModules();
  legacy = require('../legacy.js');
});

// ---------------------------------------------------------------------------
// q(t, k) — lấy 1 bản ghi theo id từ bảng t
// ---------------------------------------------------------------------------
describe('q(t, k)', () => {
  test('trả về object khách hàng khi id khớp', () => {
    expect(legacy.q('c', 1)).toEqual({
      id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi',
    });
  });

  test('trả về object sản phẩm khi id khớp', () => {
    expect(legacy.q('p', 105)).toEqual({
      id: 105, n: 'Denim Jeans', pr: 14.0, cat: 'BOT', st: 350,
    });
  });

  test('trả về null khi không tìm thấy id', () => {
    expect(legacy.q('o', 999999)).toBeNull();
  });

  test('trả về THAM CHIẾU thật tới dữ liệu nguồn (không phải bản sao)', () => {
    const a = legacy.q('c', 2);
    const b = legacy.q('c', 2);
    expect(a).toBe(b); // cùng một object => caller có thể mutate D
  });

  test('dùng so sánh lỏng (==): id dạng chuỗi "1" vẫn khớp id số 1', () => {
    expect(legacy.q('c', '1')).not.toBeNull();
    expect(legacy.q('c', '1').n).toBe('Hanoi Garment Co');
  });
});

// ---------------------------------------------------------------------------
// qa(t) — lấy toàn bộ bảng
// ---------------------------------------------------------------------------
describe('qa(t)', () => {
  test('trả về toàn bộ mảng orders (10 đơn)', () => {
    const os = legacy.qa('o');
    expect(Array.isArray(os)).toBe(true);
    expect(os).toHaveLength(10);
  });

  test('trả về mảng sản phẩm (8) và khách hàng (5)', () => {
    expect(legacy.qa('p')).toHaveLength(8);
    expect(legacy.qa('c')).toHaveLength(5);
  });

  test('bảng không tồn tại trả về undefined (KHÔNG phải [])', () => {
    expect(legacy.qa('khong_co')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ql(x) — các dòng đơn của order x
// ---------------------------------------------------------------------------
describe('ql(x)', () => {
  test('trả về đúng các dòng của đơn 1002 (3 dòng)', () => {
    expect(legacy.ql(1002)).toEqual([
      { oid: 1002, pid: 102, q: 120 },
      { oid: 1002, pid: 105, q: 80 },
      { oid: 1002, pid: 101, q: 300 },
    ]);
  });

  test('đơn 1005 chỉ có 1 dòng', () => {
    expect(legacy.ql(1005)).toHaveLength(1);
  });

  test('đơn không có dòng nào trả về mảng rỗng []', () => {
    expect(legacy.ql(999999)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// cnt() — bộ đếm query toàn cục qc
// ---------------------------------------------------------------------------
describe('cnt()', () => {
  test('khởi điểm bằng 0 khi module vừa nạp', () => {
    expect(legacy.cnt()).toBe(0);
  });

  test('mỗi lần gọi q/qa/ql đều tăng qc lên 1', () => {
    legacy.q('o', 1001); // +1
    legacy.qa('o');      // +1
    legacy.ql(1001);     // +1
    expect(legacy.cnt()).toBe(3);
  });

  test('bản thân cnt() KHÔNG làm tăng bộ đếm', () => {
    legacy.q('o', 1001); // qc = 1
    legacy.cnt();
    legacy.cnt();
    expect(legacy.cnt()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// fmt(n) — định dạng tiền tệ
// ---------------------------------------------------------------------------
describe('fmt(n)', () => {
  test('số nhỏ: thêm $ và 2 chữ số thập phân', () => {
    expect(legacy.fmt(4.5)).toBe('$4.50');
  });

  test('số 0', () => {
    expect(legacy.fmt(0)).toBe('$0.00');
  });

  test('chèn dấu phẩy ngăn cách hàng nghìn', () => {
    expect(legacy.fmt(1475)).toBe('$1,475.00');
  });

  test('số hàng triệu: nhiều dấu phẩy', () => {
    expect(legacy.fmt(1234567.5)).toBe('$1,234,567.50');
  });
});

// ---------------------------------------------------------------------------
// calc(orderId) — tổng tiền 1 đơn (chiết khấu tier + bulk 3% + thuế 8%)
// ---------------------------------------------------------------------------
describe('calc(orderId)', () => {
  test('đơn 1001 (DONE, tier A 10%, không bulk, có thuế)', () => {
    // (900+575)=1475 ; -10% = 1327.5 ; *1.08 = 1433.7
    expect(legacy.calc(1001)).toBe(1433.7);
  });

  test('đơn 1002 (DONE, tier B 5% + bulk 3% vì tq=500, có thuế)', () => {
    // 3340 ; -8% = 3072.8 ; *1.08 = 3318.624 -> 3318.62
    expect(legacy.calc(1002)).toBe(3318.62);
  });

  test('đơn 1003 (CANCEL => KHÔNG cộng thuế)', () => {
    // 480 ; tier A -10% = 432 ; cancelled => không *1.08
    expect(legacy.calc(1003)).toBe(432);
  });

  test('đơn 1005 (OPEN, tier C 0% + bulk 3% vì tq=500, có thuế)', () => {
    // 2875 ; -3% = 2788.75 ; *1.08 = 3011.85
    expect(legacy.calc(1005)).toBe(3011.85);
  });

  test('đơn không tồn tại => NÉM exception (không có null-check)', () => {
    expect(() => legacy.calc(999999)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// chk(orderId) — kiểm tra hợp lệ, trả chuỗi "OK"/"NG: ..."
// ---------------------------------------------------------------------------
describe('chk(orderId)', () => {
  test('đơn hợp lệ trả về "OK"', () => {
    expect(legacy.chk(1001)).toBe('OK');
  });

  test('đơn không tồn tại trả về "NG: no order"', () => {
    expect(legacy.chk(999999)).toBe('NG: no order');
  });

  test('đơn đã hủy trả về "NG: cancelled"', () => {
    expect(legacy.chk(1003)).toBe('NG: cancelled');
  });
});

// ---------------------------------------------------------------------------
// proc(month) — báo cáo tháng dạng chuỗi nhiều dòng
// ---------------------------------------------------------------------------
describe('proc(month)', () => {
  test('báo cáo tháng 2026-01 chứa các phần đặc trưng', () => {
    const r = legacy.proc('2026-01');
    expect(typeof r).toBe('string');
    expect(r).toContain('MONTHLY ORDER REPORT  2026-01');
    expect(r).toContain('Order #1001');
    expect(r).toContain('Customer: Hanoi Garment Co (Hanoi, tier A)');
    // đơn 1003 bị hủy => bị loại khỏi tổng
    expect(r).toContain('** CANCELLED — excluded from totals **');
    // chỉ 1001 + 1002 được tính => 2 đơn
    expect(r).toContain('Orders counted: 2');
    // grand total = 1433.7 + 3318.62 = 4752.32
    expect(r).toContain('$4,752.32');
  });

  test('tháng không có đơn => báo cáo rỗng, tổng = $0.00', () => {
    const r = legacy.proc('2099-12');
    expect(r).toContain('Orders counted: 0');
    expect(r).toContain('Grand total:    $0.00');
  });

  test('toàn bộ chuỗi báo cáo khớp snapshot (pin định dạng nguyên trạng)', () => {
    expect(legacy.proc('2026-01')).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// getAll(status) — danh sách đơn theo trạng thái, kèm thông tin
// ---------------------------------------------------------------------------
describe('getAll(status)', () => {
  test('OPEN trả về 3 đơn với hình dạng object cố định', () => {
    expect(legacy.getAll('OPEN')).toEqual([
      { id: 1005, date: '2026-02-09', customer: 'Hue Trading', city: 'Hue', lines: 1, units: 500 },
      { id: 1007, date: '2026-02-21', customer: 'Can Tho Apparel', city: 'Can Tho', lines: 2, units: 320 },
      { id: 1009, date: '2026-03-08', customer: 'Hanoi Garment Co', city: 'Hanoi', lines: 1, units: 400 },
    ]);
  });

  test('DONE trả về 6 đơn', () => {
    expect(legacy.getAll('DONE')).toHaveLength(6);
  });

  test('CANCEL trả về 1 đơn', () => {
    expect(legacy.getAll('CANCEL')).toHaveLength(1);
  });

  test('trạng thái không tồn tại trả về mảng rỗng []', () => {
    expect(legacy.getAll('KHONG_CO')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// top(n) — top n sản phẩm bán chạy (chỉ đơn DONE), sort giảm dần
// ---------------------------------------------------------------------------
describe('top(n)', () => {
  test('top 3 sản phẩm bán chạy nhất (gộp theo TÊN sản phẩm)', () => {
    expect(legacy.top(3)).toEqual([
      { name: 'T-Shirt Basic', units: 650 },
      { name: 'Polo Shirt', units: 270 },
      { name: 'Track Shorts', units: 130 },
    ]);
  });

  test('n lớn hơn số sản phẩm => trả về tất cả 8 sản phẩm, đã sort', () => {
    expect(legacy.top(100)).toEqual([
      { name: 'T-Shirt Basic', units: 650 },
      { name: 'Polo Shirt', units: 270 },
      { name: 'Track Shorts', units: 130 },
      { name: 'Windbreaker', units: 105 },
      { name: 'Denim Jeans', units: 80 },
      { name: 'Hoodie Fleece', units: 75 },
      { name: 'Cargo Pants', units: 50 },
      { name: 'Puffer Vest', units: 30 },
    ]);
  });

  test('top(0) trả về mảng rỗng []', () => {
    expect(legacy.top(0)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// upd(orderId, status) — cập nhật trạng thái (CÓ side-effect) + log audit
// ---------------------------------------------------------------------------
describe('upd(orderId, status)', () => {
  test('cập nhật thành công trả về dòng log "OK|..." và GHI vào dữ liệu', () => {
    expect(legacy.upd(1009, 'DONE')).toBe('OK|1009|OPEN->DONE|Hanoi Garment Co');
    // side-effect: trạng thái đã bị đổi ngay trong D
    expect(legacy.q('o', 1009).s).toBe('DONE');
  });

  test('đơn không tồn tại => "ERR|<id>|no such order"', () => {
    expect(legacy.upd(999999, 'DONE')).toBe('ERR|999999|no such order');
  });

  test('trạng thái không hợp lệ => "ERR|<id>|bad status <s>"', () => {
    expect(legacy.upd(1001, 'FOO')).toBe('ERR|1001|bad status FOO');
  });

  test('đơn đã hủy không sửa được => "ERR|<id>|already cancelled"', () => {
    expect(legacy.upd(1003, 'DONE')).toBe('ERR|1003|already cancelled');
  });

  test('đơn DONE không thể mở lại OPEN => "ERR|<id>|cannot reopen"', () => {
    expect(legacy.upd(1001, 'OPEN')).toBe('ERR|1001|cannot reopen');
  });
});
