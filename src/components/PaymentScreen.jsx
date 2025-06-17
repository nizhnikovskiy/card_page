import React, { useState, useCallback } from 'react';

// Constants
const VALIDATION_LIMITS = {
  CARD_NUMBER_MIN: 13,
  CARD_NUMBER_MAX: 19,
  CARD_NUMBER_DISPLAY_MAX: 19, // 16 digits + 3 spaces
  EXPIRY_DATE_MAX: 5,
  CVV_MIN: 3,
  CVV_MAX: 4,
  AMOUNT_MAX: 99999.99,
  NAME_MIN: 2
};

const REGEX_PATTERNS = {
  CARD_NUMBER: /(.{4})/g,
  EXPIRY_DATE: /(\d{2})(\d)/,
  EXPIRY_FORMAT: /^\d{2}\/\d{2}$/,
  DIGITS_ONLY: /\D/g,
  AMOUNT_FORMAT: /[^\d.]/g
};

// Reusable InputField Component
const InputField = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  disabled = false,
  prefix = null,
  className = "",
  ...props 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-3 text-gray-500">{prefix}</span>
      )}
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${prefix ? 'pl-8 pr-4' : 'px-4'} py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const PaymentScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: ''
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = useCallback((value) => {
    const cleanValue = value.replace(/\s/g, '');
    const formattedValue = cleanValue.replace(REGEX_PATTERNS.CARD_NUMBER, '$1 ').trim();
    return formattedValue.length > VALIDATION_LIMITS.CARD_NUMBER_DISPLAY_MAX ? value : formattedValue;
  }, []);

  const formatExpiryDate = useCallback((value) => {
    const cleanValue = value.replace(REGEX_PATTERNS.DIGITS_ONLY, '');
    const formattedValue = cleanValue.replace(REGEX_PATTERNS.EXPIRY_DATE, '$1/$2');
    return formattedValue.length > VALIDATION_LIMITS.EXPIRY_DATE_MAX ? value : formattedValue;
  }, []);

  const formatCvv = useCallback((value) => {
    const cleanValue = value.replace(REGEX_PATTERNS.DIGITS_ONLY, '');
    return cleanValue.length > VALIDATION_LIMITS.CVV_MAX ? value : cleanValue;
  }, []);

  const formatAmount = useCallback((value) => {
    const cleanValue = value.replace(REGEX_PATTERNS.AMOUNT_FORMAT, '');
    // Prevent multiple decimal points
    if ((cleanValue.match(/\./g) || []).length > 1) return value;
    return cleanValue;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field type
    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        formattedValue = formatCvv(value);
        break;
      case 'amount':
        formattedValue = formatAmount(value);
        break;
      default:
        formattedValue = value;
    }

    // Only update if value actually changed
    if (formattedValue !== value && name !== 'name') {
      if (formattedValue === value) return; // Prevent unnecessary updates
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formatCardNumber, formatExpiryDate, formatCvv, formatAmount, errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < VALIDATION_LIMITS.NAME_MIN) {
      newErrors.name = `Name must be at least ${VALIDATION_LIMITS.NAME_MIN} characters`;
    }

    // Card number validation
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCardNumber.length < VALIDATION_LIMITS.CARD_NUMBER_MIN || 
               cleanCardNumber.length > VALIDATION_LIMITS.CARD_NUMBER_MAX) {
      newErrors.cardNumber = `Card number must be between ${VALIDATION_LIMITS.CARD_NUMBER_MIN}-${VALIDATION_LIMITS.CARD_NUMBER_MAX} digits`;
    } else if (!/^\d+$/.test(cleanCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!REGEX_PATTERNS.EXPIRY_FORMAT.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < VALIDATION_LIMITS.CVV_MIN || 
               formData.cvv.length > VALIDATION_LIMITS.CVV_MAX) {
      newErrors.cvv = `CVV must be ${VALIDATION_LIMITS.CVV_MIN}-${VALIDATION_LIMITS.CVV_MAX} digits`;
    }

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > VALIDATION_LIMITS.AMOUNT_MAX) {
      newErrors.amount = `Amount cannot exceed $${VALIDATION_LIMITS.AMOUNT_MAX.toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      console.log('Payment Data:', {
        name: formData.name,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        amount: parseFloat(formData.amount).toFixed(2)
      });
      
      alert('Payment processed successfully! Check console for details.');
      setIsProcessing(false);
    }, 2000);
  }, [formData, validateForm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
            <p className="text-gray-600 mt-2">Enter your payment details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <InputField
              label="Cardholder Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              disabled={isProcessing}
              placeholder="John Doe"
              aria-describedby={errors.name ? "name-error" : undefined}
              autoComplete="cc-name"
            />

            {/* Card Number Field */}
            <InputField
              label="Card Number"
              id="cardNumber"
              name="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={handleInputChange}
              error={errors.cardNumber}
              disabled={isProcessing}
              placeholder="1234 5678 9012 3456"
              aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
              autoComplete="cc-number"
            />

            {/* Expiry Date and CVV Row */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Expiry Date"
                id="expiryDate"
                name="expiryDate"
                type="text"
                value={formData.expiryDate}
                onChange={handleInputChange}
                error={errors.expiryDate}
                disabled={isProcessing}
                placeholder="MM/YY"
                aria-describedby={errors.expiryDate ? "expiryDate-error" : undefined}
                autoComplete="cc-exp"
              />

              <InputField
                label="CVV"
                id="cvv"
                name="cvv"
                type="password"
                value={formData.cvv}
                onChange={handleInputChange}
                error={errors.cvv}
                disabled={isProcessing}
                placeholder="123"
                aria-describedby={errors.cvv ? "cvv-error" : undefined}
                autoComplete="cc-csc"
              />
            </div>

            {/* Amount Field */}
            <InputField
              label="Amount (USD)"
              id="amount"
              name="amount"
              type="text"
              value={formData.amount}
              onChange={handleInputChange}
              error={errors.amount}
              disabled={isProcessing}
              placeholder="0.00"
              prefix="$"
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              aria-describedby="submit-button-status"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Process Payment'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your payment information is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen; 