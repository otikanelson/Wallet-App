/**
 * Test mode configuration for utility services
 * Set TEST_MODE=true in .env to use mock responses instead of real API calls
 */

const TEST_MODE = process.env.TEST_MODE === 'true';

/**
 * Mock successful airtime purchase
 */
const mockAirtimePurchase = (network, service, phone, amount) => {
    return {
        status: 'success',
        message: 'Airtime purchase successful (TEST MODE)',
        data: {
            reference: `TEST-${Date.now()}`,
            network,
            service,
            phone,
            amount,
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Mock successful data purchase
 */
const mockDataPurchase = (network, code, phone) => {
    return {
        status: 'success',
        message: 'Data purchase successful (TEST MODE)',
        data: {
            reference: `TEST-${Date.now()}`,
            network,
            code,
            phone,
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Mock successful electricity purchase
 */
const mockElectricityPurchase = (disco, meterNumber, amount) => {
    return {
        status: 'success',
        message: 'Electricity purchase successful (TEST MODE)',
        data: {
            reference: `TEST-${Date.now()}`,
            disco,
            meterNumber,
            amount,
            token: '1234-5678-9012-3456-7890',
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Mock successful TV purchase
 */
const mockTVPurchase = (tvType, code, smartCardNo) => {
    return {
        status: 'success',
        message: 'TV subscription successful (TEST MODE)',
        data: {
            reference: `TEST-${Date.now()}`,
            tvType,
            code,
            smartCardNo,
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Mock data plans
 */
const mockDataPlans = {
    MTNDATA: [
        { code: 'MTN-1GB', name: '1GB - 30 Days', price: 300, validity: '30 days' },
        { code: 'MTN-2GB', name: '2GB - 30 Days', price: 500, validity: '30 days' },
        { code: 'MTN-5GB', name: '5GB - 30 Days', price: 1200, validity: '30 days' },
        { code: 'MTN-10GB', name: '10GB - 30 Days', price: 2000, validity: '30 days' },
    ],
    AIRTELDATA: [
        { code: 'AIRTEL-1GB', name: '1GB - 30 Days', price: 300, validity: '30 days' },
        { code: 'AIRTEL-2GB', name: '2GB - 30 Days', price: 500, validity: '30 days' },
        { code: 'AIRTEL-5GB', name: '5GB - 30 Days', price: 1200, validity: '30 days' },
    ],
    GLODATA: [
        { code: 'GLO-1GB', name: '1GB - 30 Days', price: 300, validity: '30 days' },
        { code: 'GLO-2GB', name: '2GB - 30 Days', price: 500, validity: '30 days' },
    ],
    '9MOBILEDATA': [
        { code: '9MOBILE-1GB', name: '1GB - 30 Days', price: 300, validity: '30 days' },
        { code: '9MOBILE-2GB', name: '2GB - 30 Days', price: 500, validity: '30 days' },
    ]
};

/**
 * Mock TV packages
 */
const mockTVPackages = {
    dstv: [
        { code: 'DSTV-COMPACT', name: 'DStv Compact', price: 10500 },
        { code: 'DSTV-PREMIUM', name: 'DStv Premium', price: 24500 },
        { code: 'DSTV-FAMILY', name: 'DStv Family', price: 4500 },
    ],
    gotv: [
        { code: 'GOTV-MAX', name: 'GOtv Max', price: 4850 },
        { code: 'GOTV-JOLLI', name: 'GOtv Jolli', price: 3300 },
        { code: 'GOTV-JINJA', name: 'GOtv Jinja', price: 2250 },
    ],
    startimes: [
        { code: 'STARTIMES-BASIC', name: 'Startimes Basic', price: 1200 },
        { code: 'STARTIMES-SMART', name: 'Startimes Smart', price: 2600 },
        { code: 'STARTIMES-CLASSIC', name: 'Startimes Classic', price: 2200 },
    ]
};

/**
 * Mock electricity DISCOs
 */
const mockElectricityDISCOs = [
    { code: 'EKEDC', name: 'Eko Electric' },
    { code: 'IKEDC', name: 'Ikeja Electric' },
    { code: 'AEDC', name: 'Abuja Electric' },
    { code: 'PHED', name: 'Port Harcourt Electric' },
    { code: 'KEDCO', name: 'Kano Electric' },
];

/**
 * Mock meter validation
 */
const mockValidateMeter = (disco, meterNumber) => {
    return {
        status: 'success',
        data: {
            customerName: 'Test Customer',
            meterNumber,
            disco,
            address: '123 Test Street, Lagos'
        }
    };
};

/**
 * Mock smart card validation
 */
const mockValidateSmartCard = (billerId, smartCardNo) => {
    return {
        status: 'success',
        data: {
            customerName: 'Test Customer',
            smartCardNo,
            billerId
        }
    };
};

module.exports = {
    TEST_MODE,
    mockAirtimePurchase,
    mockDataPurchase,
    mockElectricityPurchase,
    mockTVPurchase,
    mockDataPlans,
    mockTVPackages,
    mockElectricityDISCOs,
    mockValidateMeter,
    mockValidateSmartCard
};
