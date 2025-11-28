/**
 * Đọc một nhóm 3 chữ số (hàng trăm, chục, đơn vị)
 * @param {number} n - Số từ 0 đến 999
 * @returns {string} - Chuỗi chữ số bằng tiếng Việt
 */
function readNumberGroup(n) {
  const units = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];

  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  const words = [];

  // Hàng trăm
  if (hundreds > 0) {
    words.push(units[hundreds] + " trăm");
  }

  // Hàng chục và đơn vị
  if (tens === 0) {
    if (ones > 0) {
      if (hundreds > 0) {
        words.push("lẻ");
      }
      words.push(units[ones]);
    }
  } else if (tens === 1) {
    words.push("mười");
    if (ones === 5) {
      words.push("lăm");
    } else if (ones > 0) {
      words.push(units[ones]);
    }
  } else {
    words.push(units[tens] + " mươi");
    if (ones === 1) {
      words.push("mốt");
    } else if (ones === 5) {
      words.push("lăm");
    } else if (ones > 0) {
      words.push(units[ones]);
    }
  }

  return words.join(" ");
}

/**
 * Chuyển đổi số tiền VNĐ sang chữ bằng tiếng Việt
 * @param {string|number} amount - Số tiền cần chuyển đổi
 * @returns {string} - Số tiền bằng chữ (ví dụ: "một triệu đồng")
 */
export function vndToWords(amount) {
  // Xử lý input: chuyển string sang number, loại bỏ ký tự không phải số
  let num = 0;
  if (typeof amount === "string") {
    const numericAmount = amount.replace(/\D/g, "");
    num = parseInt(numericAmount, 10);
  } else if (typeof amount === "number") {
    num = Math.floor(amount);
  }

  if (isNaN(num) || num === 0) {
    return "không đồng";
  }

  // Tách số thành các nhóm 3 chữ số
  const groups = [];
  let remaining = num;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  // Các đơn vị
  const units = [
    "",
    "nghìn",
    "triệu",
    "tỷ",
    "nghìn tỷ",
    "triệu tỷ",
  ];

  const words = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (group > 0) {
      let groupWords = readNumberGroup(group);
      const unit = units[i];
      if (unit) {
        groupWords += " " + unit;
      }
      words.push(groupWords);
    }
  }

  // Đảo ngược các nhóm để đọc từ lớn đến bé
  words.reverse();

  let result = words.join(" ") + " đồng";

  // Chuẩn hóa khoảng trắng (loại bỏ khoảng trắng thừa)
  result = result.replace(/\s+/g, " ").trim();

  // Viết hoa chữ cái đầu
  return result.charAt(0).toUpperCase() + result.slice(1);
}

