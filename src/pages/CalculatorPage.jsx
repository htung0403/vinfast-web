import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  phi_duong_bo,
  phi_cap_bien_so,
  phi_kiem_dinh,
  chi_phi_dich_vu_dang_ky,
  lai_suat_vay_hang_nam,
  uu_dai_vin_club,
  ho_tro_doi_xe,
  gia_tri_dat_coc,
  quy_doi_2_nam_bhvc,
  thong_tin_ky_thuat_xe,
  danh_sach_xe,
  carPriceData,
  uniqueNgoaiThatColors,
  uniqueNoiThatColors,
  getDataByKey,
  formatCurrency,
  getCarImageUrl,
} from '../data/calculatorData';

// Import images
import logoImage from '../assets/images/logo1.jpg';
import vf3Full from '../assets/images/vf3_full.jpg';
import vf3Interior from '../assets/images/vf3_in.jpg';
import vf5Full from '../assets/images/vf5_full.webp';
import vf5Interior from '../assets/images/vf5_in.jpg';

// Color images
import whiteColor from '../assets/images/colors/white.png';
import redColor from '../assets/images/colors/red.png';
import greyColor from '../assets/images/colors/grey.png';
import yellowColor from '../assets/images/colors/yellow.png';
import blueLightColor from '../assets/images/colors/blue-light.png';
import purpleGreyColor from '../assets/images/colors/purple-grey.png';
import greenGreyColor from '../assets/images/colors/green-grey.png';

const locationMap = {
  hcm: "ho_chi_minh",
  hanoi: "ha_noi",
  danang: "da_nang",
  cantho: "can_tho",
  haiphong: "hai_phong",
  other: "tinh_khac",
};

// Map color codes to images
const colorImageMap = {
  'CE18': whiteColor,
  'CE1M': redColor,
  'CE1V': greyColor,
  'yellow': yellowColor,
  'blue-light': blueLightColor,
  'purple-grey': purpleGreyColor,
  'green-grey': greenGreyColor,
};

// Get car image from carPriceData (same logic as HTML)
const getCarImage = (model, version, exteriorColor) => {
  if (!model || !version || !exteriorColor) {
    // Return default image if no selection
    return vf3Full;
  }

  if (!Array.isArray(carPriceData)) {
    return vf3Full;
  }

  // Find exact match: model + trim + exterior_color
  const exact = carPriceData.find(e => {
    const m = String(e.model || '').trim();
    const t = String(e.trim || '').trim();
    const ext = String(e.exterior_color || '').trim();
    return m === model && t === version && ext === exteriorColor;
  });

  if (exact && exact.car_image_url) {
    const imageUrl = getCarImageUrl(exact.car_image_url);
    if (imageUrl) return imageUrl;
  }

  // Fallback: find any image for this model/version combination
  const fallback = carPriceData.find(e => {
    const m = String(e.model || '').trim();
    const t = String(e.trim || '').trim();
    return m === model && t === version && e.car_image_url;
  });

  if (fallback && fallback.car_image_url) {
    const imageUrl = getCarImageUrl(fallback.car_image_url);
    if (imageUrl) return imageUrl;
  }

  // Final fallback to default images
  if (model === 'VF 3') {
    return vf3Full;
  } else if (model === 'VF 5') {
    return vf5Full;
  }
  return vf3Full;
};

const getInteriorImage = (model) => {
  if (model === 'VF 3') {
    return vf3Interior;
  } else if (model === 'VF 5') {
    return vf5Interior;
  }
  return vf3Interior; // default
};

// Enhanced color data with actual images from uniqueNgoaiThatColors and uniqueNoiThatColors
// These already have icon URLs from shop.vinfastauto.com
const enhancedExteriorColors = uniqueNgoaiThatColors.map(color => ({
  ...color,
  // Use icon from uniqueNgoaiThatColors (already has correct URL)
  icon: color.icon || colorImageMap[color.code] || whiteColor,
}));

const enhancedInteriorColors = uniqueNoiThatColors.map(color => ({
  ...color,
  // Use icon from uniqueNoiThatColors (already has correct URL)
  icon: color.icon || colorImageMap[color.code] || whiteColor,
}));

export default function CalculatorPage() {
  const navigate = useNavigate();
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerType, setCustomerType] = useState('ca_nhan');
  const [businessType, setBusinessType] = useState('khong_kinh_doanh');
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDate, setDepositDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Car configuration
  const [carModel, setCarModel] = useState('');
  const [carVersion, setCarVersion] = useState('');
  const [exteriorColor, setExteriorColor] = useState('');
  const [interiorColor, setInteriorColor] = useState('');
  const [registrationLocation, setRegistrationLocation] = useState('hcm');
  const [registrationFee, setRegistrationFee] = useState(chi_phi_dich_vu_dang_ky);

  // Discounts and promotions
  const [discount2, setDiscount2] = useState(false);
  const [discount3, setDiscount3] = useState(false);
  const [discountBhvc2, setDiscountBhvc2] = useState(false);
  const [discountPremiumColor, setDiscountPremiumColor] = useState(false);
  const [convertCheckbox, setConvertCheckbox] = useState(false);
  const [vinClubVoucher, setVinClubVoucher] = useState('none');

  // Loan options
  const [loanToggle, setLoanToggle] = useState(true);
  const [loanRatio, setLoanRatio] = useState(70);
  const [loanTerm, setLoanTerm] = useState(60);
  const [customInterestRate, setCustomInterestRate] = useState('');

  const [imageFade, setImageFade] = useState(false);

  // Helper function to format currency for input (without ₫ symbol)
  const formatCurrencyInput = (value) => {
    if (!value && value !== 0) return '';
    const numericValue = String(value).replace(/\D/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
  };

  // Helper function to parse currency from formatted string
  const parseCurrencyInput = (value) => {
    if (!value) return 0;
    const numericValue = String(value).replace(/\D/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
  };

  // Build derived versions from carPriceData
  const derivedVersions = useMemo(() => {
    if (!Array.isArray(carPriceData)) return [];
    
    const groups = {};
    carPriceData.forEach((entry) => {
      const model = String(entry.model || '').trim();
      const trim = String(entry.trim || '').trim();
      if (!model) return;
      const key = model + '||' + trim;
      if (!groups[key]) {
        groups[key] = {
          model: model,
          trim: trim,
          min_price_vnd: Infinity,
          exterior_colors: new Set(),
          interior_colors: new Set()
        };
      }

      const g = groups[key];
      const price = Number(entry.price_vnd || 0) || 0;
      if (price > 0 && price < g.min_price_vnd) g.min_price_vnd = price;

      const ext = entry.exterior_color;
      if (ext) g.exterior_colors.add(String(ext).trim());

      const interior = entry.interior_color;
      if (interior) g.interior_colors.add(String(interior).trim());
    });
    
    return Object.keys(groups).map((k) => {
      const v = groups[k];
      return {
        model: v.model,
        trim: v.trim,
        price_vnd: v.min_price_vnd === Infinity ? 0 : v.min_price_vnd,
        exterior_colors: Array.from(v.exterior_colors),
        interior_colors: Array.from(v.interior_colors),
      };
    });
  }, []);

  // Get unique car models
  const carModels = useMemo(() => {
    const uniqueModels = {};
    derivedVersions.forEach((xe) => {
      if (!uniqueModels[xe.model]) {
        uniqueModels[xe.model] = xe.model;
      }
    });
    return uniqueModels;
  }, [derivedVersions]);

  // Get available versions for selected model
  const availableVersions = useMemo(() => {
    if (!carModel) return [];
    return derivedVersions.filter(v => v.model === carModel);
  }, [carModel, derivedVersions]);

  // Get selected dong_xe code
  const selectedDongXe = useMemo(() => {
    if (!carModel) return '';
    const found = danh_sach_xe.find(x => 
      (x.ten_hien_thi || '').toString().trim().toLowerCase() === carModel.toLowerCase()
    );
    if (found && found.dong_xe) return found.dong_xe;
    
    const norm = carModel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const found2 = danh_sach_xe.find(x => x.dong_xe === norm || x.dong_xe === norm.replace(/__+/g, '_'));
    return found2?.dong_xe || '';
  }, [carModel]);

  // Get available colors for selected version
  const availableExteriorColors = useMemo(() => {
    if (!carModel || !carVersion) return [];
    const selectedCar = derivedVersions.find(xe => xe.model === carModel && xe.trim === carVersion);
    if (!selectedCar) return [];
    return enhancedExteriorColors.filter(color => selectedCar.exterior_colors.includes(color.code));
  }, [carModel, carVersion, derivedVersions]);

  const availableInteriorColors = useMemo(() => {
    if (!carModel || !carVersion) return [];
    const selectedCar = derivedVersions.find(xe => xe.model === carModel && xe.trim === carVersion);
    if (!selectedCar) return [];
    return selectedCar.interior_colors.map(code => {
      return enhancedInteriorColors.find(c => c.code === code);
    }).filter(c => c);
  }, [carModel, carVersion, derivedVersions]);

  // Get car image URL
  const carImageUrl = useMemo(() => {
    return getCarImage(carModel, carVersion, exteriorColor);
  }, [carModel, carVersion, exteriorColor]);

  const interiorImageUrl = useMemo(() => {
    return getInteriorImage(carModel);
  }, [carModel]);

  // Get car price
  const getCarPrice = () => {
    if (!Array.isArray(carPriceData)) return 0;
    
    const exact = carPriceData.find(e => {
      const m = String(e.model || '').trim();
      const t = String(e.trim || '').trim();
      const ext = String(e.exterior_color || '').trim();
      const inti = String(e.interior_color || '').trim();
      return m === carModel && t === carVersion && ext === exteriorColor && inti === interiorColor;
    });
    if (exact && typeof exact.price_vnd !== 'undefined') return Number(exact.price_vnd);

    const candidates = carPriceData.filter(e => {
      const m = String(e.model || '').trim();
      const t = String(e.trim || '').trim();
      return m === carModel && t === carVersion;
    });
    if (candidates.length > 0) {
      const prices = candidates.map(c => Number(c.price_vnd || 0) || 0).filter(p => p > 0);
      if (prices.length > 0) return Math.min(...prices);
    }

    return 0;
  };

  // Initialize default values
  useEffect(() => {
    // Set default car model
    if (Object.keys(carModels).length > 0 && !carModel) {
      const firstModel = Object.keys(carModels)[0];
      setCarModel(firstModel);
    }
  }, [carModels, carModel]);

  // Update deposit amount when car model changes
  useEffect(() => {
    if (selectedDongXe) {
      const depositData = gia_tri_dat_coc.find(item => item.dong_xe === selectedDongXe);
      if (depositData) {
        setDepositAmount(depositData.gia_tri);
      }
    }
  }, [selectedDongXe]);

  // Set default version when model changes
  useEffect(() => {
    if (availableVersions.length > 0 && !carVersion) {
      setCarVersion(availableVersions[0].trim);
    }
  }, [availableVersions, carVersion]);

  // Reset BHVC 2-year discount when model changes (only for VF3 and VF5)
  useEffect(() => {
    if (carModel && carModel !== 'VF 3' && carModel !== 'VF 5') {
      setDiscountBhvc2(false);
    }
  }, [carModel]);

  // Set default colors when version changes
  useEffect(() => {
    if (availableExteriorColors.length > 0 && !exteriorColor) {
      setExteriorColor(availableExteriorColors[0].code);
    }
  }, [availableExteriorColors, exteriorColor]);

  useEffect(() => {
    if (availableInteriorColors.length > 0 && !interiorColor) {
      setInteriorColor(availableInteriorColors[0].code);
    }
  }, [availableInteriorColors, interiorColor]);

  // Handle exterior color change with fade animation
  const handleExteriorColorChange = (colorCode) => {
    setImageFade(true);
    setTimeout(() => {
      setExteriorColor(colorCode);
      setImageFade(false);
    }, 250);
  };

  // Calculate all costs
  const calculations = useMemo(() => {
    const basePrice = getCarPrice();

    // Discounts
    const discount2Potential = discount2 ? 50000000 : 0;
    const discount3Potential = discount3 ? Math.round(basePrice * 0.04) : 0;

    // BHVC 2-year
    let bhvc2Potential = 0;
    if (selectedDongXe) {
      const entry = quy_doi_2_nam_bhvc.find(e => e.dong_xe === selectedDongXe);
      if (entry && entry.gia_tri) bhvc2Potential = Number(entry.gia_tri) || 0;
    }
    const bhvc2 = discountBhvc2 ? bhvc2Potential : 0;

    // Premium color
    let premiumColorPotential = 0;
    if (selectedDongXe) {
      const exteriorColorObj = enhancedExteriorColors.find(c => c.code === exteriorColor);
      const exteriorText = exteriorColorObj?.name || '';
      
      if (selectedDongXe === 'vf_3') {
        if (/Vàng Nóc Trắng|Xanh Lá Nhạt|Hồng Nóc Trắng|Xanh Nóc Trắng/i.test(exteriorText)) {
          premiumColorPotential = 8000000;
        }
      } else if (selectedDongXe === 'vf_5') {
        if (/Vàng Nóc Trắng|Xanh Lá Nhạt|Xanh Nóc Trắng/i.test(exteriorText)) {
          premiumColorPotential = 12000000;
        }
      }
    }
    const premiumColor = discountPremiumColor ? premiumColorPotential : 0;

    // Convert support
    let convertSupportDiscount = 0;
    if (convertCheckbox && selectedDongXe) {
      const supportEntry = ho_tro_doi_xe.find(h => h.dong_xe === selectedDongXe);
      if (supportEntry && supportEntry.gia_tri) convertSupportDiscount = Number(supportEntry.gia_tri) || 0;
    }

    // Promotions
    const promotionDiscountTotal = discount2Potential + discount3Potential;
    const priceAfterBasicPromotions = Math.max(0, basePrice - promotionDiscountTotal);

    // Amount before VinClub
    const amountBeforeVinClub = Math.max(0, priceAfterBasicPromotions - convertSupportDiscount - bhvc2 - premiumColor);

    // VinClub discount
    let vinClubDiscount = 0;
    if (vinClubVoucher !== 'none') {
      const vinClubData = getDataByKey(uu_dai_vin_club, 'hang', vinClubVoucher);
      if (vinClubData) {
        vinClubDiscount = Math.round(amountBeforeVinClub * vinClubData.ty_le);
      }
    }

    // Final payable
    const finalPayable = Math.max(0, amountBeforeVinClub - vinClubDiscount);
    const totalDiscount = promotionDiscountTotal + vinClubDiscount + convertSupportDiscount + bhvc2 + premiumColor;
    const priceAfterDiscount = Math.max(0, basePrice - totalDiscount);

    // On-road costs
    const locationKey = locationMap[registrationLocation] || 'tinh_khac';
    const plateFeeData = getDataByKey(phi_cap_bien_so, 'khu_vuc', locationKey);
    const plateFee = plateFeeData ? plateFeeData.gia_tri : getDataByKey(phi_cap_bien_so, 'khu_vuc', 'tinh_khac').gia_tri;

    const roadFeeData = getDataByKey(phi_duong_bo, 'loai', customerType);
    const roadFee = roadFeeData ? roadFeeData.gia_tri : getDataByKey(phi_duong_bo, 'loai', 'ca_nhan').gia_tri;

    const carInfo = getDataByKey(thong_tin_ky_thuat_xe, 'dong_xe', selectedDongXe);
    const liabilityInsurance = carInfo
      ? businessType === 'khong_kinh_doanh' ? carInfo.phi_tnds_ca_nhan : carInfo.phi_tnds_kinh_doanh
      : getDataByKey(thong_tin_ky_thuat_xe, 'dong_xe', 'vf_7').phi_tnds_ca_nhan;

    const inspectionFee = phi_kiem_dinh;
    const bhvcRate = 0.014;
    const bodyInsurance = Math.round((finalPayable + bhvc2 + premiumColor) * bhvcRate);
    const registrationFeeValue = Number(registrationFee) || 0;

    const totalOnRoadCost = plateFee + roadFee + liabilityInsurance + inspectionFee + bodyInsurance + registrationFeeValue;
    const totalCost = finalPayable + totalOnRoadCost;

    // Loan calculations
    let loanData = {
      downPayment: 0,
      loanAmount: 0,
      totalInterest: 0,
      monthlyPayment: 0,
    };

    if (loanToggle) {
      const loanRatioDecimal = loanRatio / 100;
      let annualRate = lai_suat_vay_hang_nam;
      if (customInterestRate && !isNaN(Number(customInterestRate)) && Number(customInterestRate) >= 0) {
        annualRate = Number(customInterestRate) / 100;
      }
      const monthlyRate = annualRate / 12;

      // Calculate loan amount based on total cost
      const loanAmount = Math.round(totalCost * loanRatioDecimal);
      const downPayment = totalCost - loanAmount;

      // Calculate monthly payment using annuity formula
      let monthlyPayment = 0;
      if (monthlyRate > 0 && loanTerm > 0) {
        // Annuity formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
        // where P = principal, r = monthly rate, n = number of months
        const numerator = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm));
        const denominator = Math.pow(1 + monthlyRate, loanTerm) - 1;
        monthlyPayment = numerator / denominator;
      } else if (loanTerm > 0) {
        // If no interest rate, just divide loan amount by term
        monthlyPayment = loanAmount / loanTerm;
      }

      // Calculate total payment and interest
      // Important: Use unrounded monthlyPayment for accurate totalInterest calculation
      const totalPayment = monthlyPayment * loanTerm;
      const totalInterest = totalPayment - loanAmount;

      loanData = {
        downPayment: Math.round(downPayment),
        loanAmount,
        totalInterest: Math.round(totalInterest),
        monthlyPayment: Math.round(monthlyPayment),
      };
    }

    return {
      basePrice,
      discount2Potential,
      discount3Potential,
      promotionDiscountTotal,
      priceAfterBasicPromotions,
      convertSupportDiscount,
      bhvc2,
      bhvc2Potential,
      premiumColor,
      premiumColorPotential,
      vinClubDiscount,
      amountBeforeVinClub,
      finalPayable,
      totalDiscount,
      priceAfterDiscount,
      plateFee,
      plateFeeData,
      roadFee,
      liabilityInsurance,
      inspectionFee,
      bodyInsurance,
      registrationFee: registrationFeeValue,
      totalOnRoadCost,
      totalCost,
      loanData,
    };
  }, [
    carModel,
    carVersion,
    exteriorColor,
    interiorColor,
    discount2,
    discount3,
    discountBhvc2,
    discountPremiumColor,
    convertCheckbox,
    vinClubVoucher,
    customerType,
    businessType,
    registrationLocation,
    selectedDongXe,
    loanToggle,
    loanRatio,
    loanTerm,
    customInterestRate,
    registrationFee,
  ]);

  // Collect invoice data
  const collectInvoiceData = () => {
    const data = {
      // Customer info
      customerName: customerName || 'QUÝ KHÁCH HÀNG',
      customerAddress: customerAddress || 'Thành phố Hồ Chí Minh',
      customerType: customerType || 'ca_nhan',
      businessType: businessType || 'khong_kinh_doanh',
      depositAmount: depositAmount || 0,
      depositDate: depositDate || '',
      deliveryDate: deliveryDate || '',

      // Car info
      carModel: carModel || '',
      carVersion: carVersion || '',
      exteriorColor: exteriorColor || '',
      interiorColor: interiorColor || '',
      carDongXe: selectedDongXe || '',
      
      // Get color names
      exteriorColorName: enhancedExteriorColors.find(c => c.code === exteriorColor)?.name || exteriorColor,
      interiorColorName: enhancedInteriorColors.find(c => c.code === interiorColor)?.name || interiorColor,

      // Prices
      carBasePrice: calculations.basePrice || 0,
      carPriceAfterPromotions: calculations.priceAfterBasicPromotions || 0,
      carTotal: calculations.finalPayable || 0,
      priceFinalPayment: calculations.finalPayable || 0,

      // Discounts
      vinClubDiscount: calculations.vinClubDiscount || 0,
      convertSupportDiscount: calculations.convertSupportDiscount || 0,
      premiumColorDiscount: calculations.premiumColorPotential || 0,
      bhvc2Discount: calculations.bhvc2Potential || 0,

      // On-road costs
      registrationLocation: getRegistrationLocationLabel(),
      plateFee: calculations.plateFee || 0,
      liabilityInsurance: calculations.liabilityInsurance || 0,
      inspectionFee: calculations.inspectionFee || 0,
      roadFee: calculations.roadFee || 0,
      registrationFee: calculations.registrationFee || 0,
      bodyInsurance: calculations.bodyInsurance || 0,
      totalOnRoadCost: calculations.totalOnRoadCost || 0,

      // Loan info
      hasLoan: loanToggle || false,
      loanRatio: loanRatio || 0,
      loanAmount: calculations.loanData?.loanAmount || 0,
      downPayment: calculations.loanData?.downPayment || 0,
    };

    // Save to localStorage
    localStorage.setItem('invoiceData', JSON.stringify(data));
    
    // Navigate to invoice page
    navigate('/in-bao-gia-2');
  };

  // Helper to get registration location label
  const getRegistrationLocationLabel = () => {
    const locationLabels = {
      hcm: 'TP. Hồ Chí Minh',
      hanoi: 'Hà Nội',
      danang: 'Đà Nẵng',
      cantho: 'Cần Thơ',
      haiphong: 'Hải Phòng',
      other: 'Tỉnh thành khác',
    };
    return locationLabels[registrationLocation] || 'TP. Hồ Chí Minh';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/menu")}
            className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden bg-white border-2 border-gray-200">
              <img src={logoImage} alt="VinFast Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="flex-1 text-2xl font-bold text-gray-900 ml-5">
            Công cụ tính giá xe VinFast
          </h1>
        </div>

        {/* Content Grid - 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Customer Info Card */}
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
              <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b-2 border-gray-200">
                Thông tin khách hàng & Giao dịch
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Họ tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Loại khách hàng
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white cursor-pointer"
                  >
                    <option value="ca_nhan">Cá nhân</option>
                    <option value="cong_ty">Công ty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Loại sử dụng
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white cursor-pointer"
                  >
                    <option value="khong_kinh_doanh">Không kinh doanh</option>
                    <option value="kinh_doanh">Kinh doanh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Số tiền cọc
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 font-semibold">
                    {formatCurrency(depositAmount)}
                  </div>
                </div>
              </div>
            </div>

          {/* Main Configuration Card */}
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
              {/* Car Image */}
              <div className="w-full aspect-[1.8] rounded-lg overflow-hidden mb-5 bg-gray-800 relative">
                <img
                  src={carImageUrl}
                  alt="Ngoại thất"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageFade ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                  Ngoại thất
                </div>
              </div>

              {/* Configuration Sections */}
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">1. Chọn mẫu xe</div>
                  <select
                    value={carModel}
                    onChange={(e) => {
                      setCarModel(e.target.value);
                      setCarVersion('');
                      setExteriorColor('');
                      setInteriorColor('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white cursor-pointer"
                  >
                    {Object.keys(carModels).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">2. Chọn phiên bản</div>
                  <div className="space-y-2">
                    {availableVersions.map((version) => (
                      <label
                        key={version.trim}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          carVersion === version.trim
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="carVersion"
                          value={version.trim}
                          checked={carVersion === version.trim}
                          onChange={(e) => setCarVersion(e.target.value)}
                          className="w-5 h-5 mr-3 text-blue-600"
                        />
                        <span className="flex-1 font-medium text-gray-700">{version.trim}</span>
                        <span className="text-blue-600 font-semibold">{formatCurrency(version.price_vnd)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">3. Ngoại thất</div>
                  <div className="flex gap-3 flex-wrap">
                    {availableExteriorColors.map((color) => (
                      <div
                        key={color.code}
                        onClick={() => handleExteriorColorChange(color.code)}
                        className={`rounded-xl cursor-pointer transition-all ${
                          exteriorColor === color.code
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-transparent hover:scale-110'
                        }`}
                        style={{ width: '60px', height: '60px', borderWidth: '3px', borderStyle: 'solid' }}
                      >
                        <img
                          src={color.icon}
                          alt={color.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">4. Nội thất</div>
                  <div className="flex gap-3 flex-wrap">
                    {availableInteriorColors.map((color) => (
                      <div
                        key={color.code}
                        onClick={() => setInteriorColor(color.code)}
                        className={`rounded-xl cursor-pointer transition-all ${
                          interiorColor === color.code
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-transparent hover:scale-110'
                        }`}
                        style={{ width: '60px', height: '60px', borderWidth: '3px', borderStyle: 'solid' }}
                      >
                        <img
                          src={color.icon}
                          alt={color.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">5. Chọn nơi đăng ký biển số</div>
                  <select
                    value={registrationLocation}
                    onChange={(e) => setRegistrationLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white cursor-pointer"
                  >
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="other">Tỉnh thành khác</option>
                  </select>
                </div>
              </div>
            </div>

          {/* Cost Estimation Card */}
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
              <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b-2 border-gray-200">
                Dự toán chi phí cho {carModel} {carVersion}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Giá xe (gồm VAT)</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(calculations.basePrice)}</span>
                </div>

                <div className="my-4">
                  <div className="text-sm font-medium text-gray-600 mb-3">Chọn ưu đãi áp dụng</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={discount3}
                        onChange={(e) => setDiscount3(e.target.checked)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="flex-1 text-sm text-gray-700">Ưu đãi Lái xe Xanh (VN3)</span>
                      <span className="text-red-600 font-semibold">
                        -{formatCurrency(calculations.discount3Potential)}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={discount2}
                        onChange={(e) => setDiscount2(e.target.checked)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="flex-1 text-sm text-gray-700">Ưu đãi tháng 10</span>
                      <span className="text-red-600 font-semibold">
                        -{formatCurrency(calculations.discount2Potential)}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Giá sau ưu đãi</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(calculations.priceAfterBasicPromotions)}
                  </span>
                </div>

                <div className="my-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Hạng thành viên</label>
                    <div className="flex gap-4 justify-between items-center">
                      <select
                        value={vinClubVoucher}
                        onChange={(e) => setVinClubVoucher(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="none">Không áp dụng</option>
                        <option value="gold">Gold (0.5%)</option>
                        <option value="platinum">Platinum (1%)</option>
                        <option value="diamond">Diamond (1.5%)</option>
                      </select>
                      <div className="text-red-600 font-semibold">{formatCurrency(calculations.vinClubDiscount)}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={convertCheckbox}
                        onChange={(e) => setConvertCheckbox(e.target.checked)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Xăng → Điện (áp dụng chi phí đổi)</span>
                    </label>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(calculations.convertSupportDiscount)}
                    </span>
                  </div>

                  {(carModel === 'VF 3' || carModel === 'VF 5') && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <label className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={discountBhvc2}
                          onChange={(e) => setDiscountBhvc2(e.target.checked)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Quy đổi 2 năm bảo hiểm (BHVC)</span>
                      </label>
                      <span className="text-red-600 font-semibold">
                        -{formatCurrency(calculations.bhvc2Potential)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={discountPremiumColor}
                        onChange={(e) => setDiscountPremiumColor(e.target.checked)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Miễn Phí Màu Nâng Cao</span>
                    </label>
                    <span className="text-red-600 font-semibold">
                      -{formatCurrency(calculations.premiumColorPotential)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Giá thanh toán thực tế</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(calculations.finalPayable)}</span>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold text-gray-600 mb-3">Chi phí lăn bánh dự tính</div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí 01 năm BH Dân sự</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(calculations.liabilityInsurance)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">
                        Phí biển số ({calculations.plateFeeData?.ten_khu_vuc || 'N/A'})
                      </span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(calculations.plateFee)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí kiểm định</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(calculations.inspectionFee)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí bảo trì đường bộ</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(calculations.roadFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <input
                        type="text"
                        value={formatCurrencyInput(registrationFee)}
                        onChange={(e) => {
                          const parsedValue = parseCurrencyInput(e.target.value);
                          setRegistrationFee(Math.max(0, parsedValue));
                        }}
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">BHVC bao gồm Pin</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(calculations.bodyInsurance)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between py-4 mt-4 border-t-2 border-gray-200">
                  <span className="text-xl font-bold text-blue-600">TỔNG CHI PHÍ</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(calculations.totalCost)}</span>
                </div>
              </div>
            </div>

          {/* Loan Options Card */}
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
              <h2 className="text-base font-bold text-gray-900 mb-5">Tùy chọn & Chi tiết trả góp</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Vay mua xe trả góp</span>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={loanToggle}
                      onChange={(e) => setLoanToggle(e.target.checked)}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                        loanToggle ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white top-1 transition-transform ${
                          loanToggle ? 'translate-x-6 left-1' : 'left-1'
                        }`}
                      />
                    </span>
                  </label>
                </div>

                {loanToggle && (
                  <>
                    <div className="flex items-center gap-3 py-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700 flex-shrink-0">Tỷ lệ vay</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={loanRatio}
                          onChange={(e) => setLoanRatio(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={loanRatio}
                        onChange={(e) => setLoanRatio(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm font-semibold text-blue-600 min-w-[120px] text-right">
                        {loanRatio}% giá trị xe
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Thời hạn vay</span>
                      <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white cursor-pointer max-w-[200px]"
                      >
                        <option value="12">12 tháng</option>
                        <option value="24">24 tháng</option>
                        <option value="36">36 tháng</option>
                        <option value="48">48 tháng</option>
                        <option value="60">60 tháng (5 năm)</option>
                        <option value="72">72 tháng</option>
                        <option value="84">84 tháng (7 năm)</option>
                        <option value="96">96 tháng (8 năm)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Lãi suất ngân hàng</span>
                      <input
                        type="number"
                        value={customInterestRate}
                        onChange={(e) => setCustomInterestRate(e.target.value)}
                        placeholder="Lãi suất (%)"
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mt-5 pt-5 border-t-2 border-gray-200">
                      <div className="text-sm font-semibold text-gray-600 mb-3">Chi tiết trả góp dự tính</div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Số tiền trả trước</span>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(calculations.loanData.downPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Số tiền vay</span>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(calculations.loanData.loanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Tổng lãi phải trả</span>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(calculations.loanData.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between py-4 mt-4 border-t-2 border-gray-200">
                          <span className="text-xl font-bold text-blue-600">Gốc & lãi hàng tháng</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(calculations.loanData.monthlyPayment)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex gap-3 mt-5">
          <button 
            onClick={collectInvoiceData}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            In Báo Giá 2
          </button>
          <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Gửi Email Báo Giá
          </button>
        </div>
      </div>
    </div>
  );
}
