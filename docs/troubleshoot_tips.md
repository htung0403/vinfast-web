# Troubleshooting Tips - VinFast Dealer Management

> Tài liệu này ghi lại các bài học kinh nghiệm từ quá trình debug thực tế.
> Mỗi lần gặp lỗi mới, hãy tham khảo file này trước khi bắt đầu debug từ đầu.

---

## Mục lục

1. [Nghiệp vụ & Thuật ngữ](#1-nghiệp-vụ--thuật-ngữ)
2. [Tính toán & Công thức](#2-tính-toán--công-thức)
3. [UI/UX & Print Layout](#3-uiux--print-layout)
4. [React & State Management](#4-react--state-management)
5. [Firebase Data](#5-firebase-data)

---

## 1. Nghiệp vụ & Thuật ngữ

### Rule #1: Phân biệt rõ các thuật ngữ tài chính

**Vấn đề gặp phải:**
Nhầm lẫn giữa "Tiền đối ứng" và "Hỗ trợ đổi xe", dẫn đến sửa code sai hướng.

**Nguyên nhân gốc:**
- Không hiểu rõ nghiệp vụ thực tế trước khi code
- Đặt giả định sai về ý nghĩa của thuật ngữ

**Bảng phân biệt thuật ngữ:**

| Thuật ngữ | Ý nghĩa | Công thức/Nguồn |
|-----------|---------|-----------------|
| **Tiền đối ứng** | Số tiền khách hàng tự bỏ ra (không vay) | `Giá hợp đồng - Số tiền vay` |
| **Hỗ trợ đổi xe** | Khoản hỗ trợ từ VinFast khi đổi xe xăng → điện | Tra cứu từ bảng `ho_tro_doi_xe` theo dòng xe |
| **Giá XHD** | Giá xuất hóa đơn | `Giá niêm yết - Fix discount - VinClub` |
| **Giá niêm yết** | Giá gốc của xe từ VinFast | Từ bảng `carPrices` theo model |
| **Tiền đặt cọc** | Tiền khách đặt trước khi ký hợp đồng | Nhập thủ công |
| **Số tiền vay** | Tiền vay ngân hàng | Nhập thủ công hoặc tính từ `Giá HĐ - Tiền cọc` |

**Quy tắc áp dụng:**
> Trước khi sửa logic tính toán tài chính, **LUÔN** hỏi lại người dùng về nghiệp vụ thực tế. Đừng đoán!

---

### Rule #2: Xác nhận nghiệp vụ trước khi code

**Checklist trước khi sửa logic nghiệp vụ:**
- [ ] Hiểu rõ thuật ngữ đang dùng
- [ ] Xác nhận công thức tính toán với người dùng
- [ ] Kiểm tra xem logic hiện tại đã đúng chưa (có thể đang đúng rồi!)
- [ ] Nếu không chắc, hỏi lại thay vì giả định

---

## 2. Tính toán & Công thức

### Rule #3: Kiểm tra logic hiện tại trước khi "sửa"

**Vấn đề gặp phải:**
Sửa code đang đúng thành sai, rồi phải sửa lại.

**Nguyên nhân gốc:**
- Giả định code hiện tại sai mà không kiểm tra kỹ
- Không hiểu đúng yêu cầu nghiệp vụ

**Quy tắc áp dụng:**
> Trước khi sửa bất kỳ công thức nào, **ĐỌC** và **HIỂU** logic hiện tại. Có thể nó đã đúng!

**Các công thức quan trọng trong dự án:**

```javascript
// Tiền đối ứng (số tiền khách tự trả)
tienDoiUng = giaHopDong - soTienVay

// Trả thẳng (không vay)
tienDoiUng = giaHopDong // 100%

// Số tiền vay (nếu trả góp, không nhập thủ công)
soTienVay = giaHopDong - tienDatCoc

// Giá XHD
giaXHD = giaNiemYet - fixDiscount - vinClubDiscount
```

---

### Rule #4: Trace data flow khi debug tính toán

**Khi gặp lỗi tính toán sai:**

1. **Tìm nguồn dữ liệu:**
   - Dữ liệu đến từ đâu? (Firebase, state, props, bảng lookup)
   - Dữ liệu có đúng format không? (string vs number)

2. **Trace qua các hàm:**
   - `parseValue()` - có parse đúng không?
   - Các điều kiện if/else có đúng không?

3. **Kiểm tra output:**
   - Console.log giá trị trước và sau tính toán
   - So sánh với kết quả mong đợi

**Ví dụ debug pattern:**
```javascript
const calculateSomething = (contract) => {
  console.log("Input contract:", contract);
  console.log("giaHopDong:", contract.giaHopDong);
  console.log("soTienVay:", contract.soTienVay);

  const result = parseValue(contract.giaHopDong) - parseValue(contract.soTienVay);
  console.log("Result:", result);

  return result;
};
```

---

## 3. UI/UX & Print Layout

### Rule #5: Print CSS cần test riêng biệt

**Vấn đề gặp phải:**
- Form tràn sang trang 2 khi in
- Đường kẻ ngang lơ lửng giữa trang
- Layout không như mong đợi trên màn hình

**Nguyên nhân gốc:**
- CSS cho màn hình khác với CSS cho in
- Không có `@media print` styles
- Thiếu các thuộc tính kiểm soát page break

**Checklist CSS Print:**
```css
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }

  /* Giới hạn nội dung trong 1 trang */
  #printable-content {
    max-height: 277mm !important;
    overflow: hidden !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Giảm font size nếu cần */
  body {
    font-size: 10pt !important;
    line-height: 1.2 !important;
  }
}
```

**Quy tắc áp dụng:**
> Luôn test print layout bằng Print Preview (Ctrl+P) sau mỗi thay đổi CSS.

---

### Rule #6: Flex layout cho signature sections

**Vấn đề gặp phải:**
Phần chữ ký không nằm ở cuối trang, hoặc khoảng trống phân bổ không đều.

**Giải pháp:**
```jsx
<div className="flex flex-col h-full">
  {/* Nội dung chính */}
  <div className="flex-grow">
    {/* Content */}
  </div>

  {/* Phần chữ ký - luôn ở cuối */}
  <div className="mt-auto">
    {/* Signatures */}
  </div>
</div>
```

---

## 4. React & State Management

### Rule #7: Tránh duplicate keys trong JSX

**Vấn đề gặp phải:**
Warning: "Each child in a list should have a unique key prop"

**Nguyên nhân gốc:**
- Copy-paste code tạo ra duplicate key
- Dùng index làm key khi list có thể thay đổi

**Cách kiểm tra:**
```bash
# Tìm duplicate keys trong file
grep -n "key=" src/pages/SomeFile.jsx | sort
```

**Quy tắc áp dụng:**
> Sau khi copy-paste component, **LUÔN** kiểm tra và đổi key prop.

---

### Rule #8: State sync giữa multiple sources

**Vấn đề gặp phải:**
Dữ liệu không đồng bộ giữa `contracts` và `exportedContracts` trong Firebase.

**Checklist khi làm việc với multiple data sources:**
- [ ] Khi update `contracts`, cũng update `exportedContracts` nếu cần
- [ ] Kiểm tra tất cả các nơi lưu dữ liệu (có thể có 2-3 chỗ save)
- [ ] Đảm bảo field names nhất quán (camelCase vs Vietnamese)

**Pattern đồng bộ dữ liệu:**
```javascript
// Khi save contract
await update(contractRef, updateData);

// Đồng thời update exportedContracts nếu status là "xuất"
if (status === "xuất") {
  await set(exportedContractRef, exportedData);
}
```

---

## 5. Firebase Data

### Rule #9: Field name mapping

**Vấn đề gặp phải:**
Dữ liệu có nhiều tên field khác nhau cho cùng một ý nghĩa.

**Mapping table:**

| Ý nghĩa | Các tên có thể gặp |
|---------|-------------------|
| Số tiền vay | `soTienVay`, `tienVayNganHang`, `loanAmount`, `tienVay` |
| Tiền cọc | `soTienCoc`, `tienDatCoc`, `deposit`, `Tiền đặt cọc` |
| Giá hợp đồng | `giaHopDong`, `giaHD`, `contractPrice`, `Giá Hợp Đồng` |
| Dòng xe | `dongXe`, `model`, `Dòng xe` |

**Pattern để handle multiple field names:**
```javascript
const getValue = (contract) => {
  return contract.soTienVay ||
         contract.tienVayNganHang ||
         contract.loanAmount ||
         contract.tienVay ||
         "";
};
```

---

### Rule #10: Parse value safely

**Vấn đề gặp phải:**
- String "500,000,000" không parse được thành number
- Null/undefined gây crash

**Utility function chuẩn:**
```javascript
const parseValue = (val) => {
  if (!val) return 0;
  if (typeof val === "string") {
    return parseFloat(val.replace(/[^\d]/g, "")) || 0;
  }
  return typeof val === "number" ? val : 0;
};
```

---

## Quick Reference

### Khi gặp bug mới, hỏi:

1. **Đây là bug UI hay logic?**
   - UI → Xem Rule #5, #6
   - Logic → Xem Rule #3, #4

2. **Có liên quan đến nghiệp vụ tài chính?**
   - Có → Xem Rule #1, #2 - XÁC NHẬN với user trước!

3. **Dữ liệu có đồng bộ không?**
   - Không → Xem Rule #8, #9

4. **Có warning trong console?**
   - Duplicate key → Xem Rule #7

---

## Changelog

| Ngày | Thêm/Sửa | Mô tả |
|------|----------|-------|
| 2025-12-18 | Thêm | Rule #1-10 từ debug session tiền đối ứng, print layout |

---

> **Lưu ý:** File này cần được cập nhật sau mỗi lần debug phức tạp.
> Sử dụng prompt: "Based on your analysis, please generalize this finding and add to troubleshoot_tips.md"
