const methodCodes = {
    12 : 'CardPurchase',
    34 : 'ACH',
    56: 'Wire',
    78: 'Fee',
}

methodCodes.Incoming = 'Incoming';
methodCodes.Outgoing = 'Outgoing';

// Convert the methodCodes object into a DTO array
const methodCodesDTO = Object.keys(methodCodes)
    .filter((key) => !isNaN(key))
    .map((code) => ({
        code: parseInt(code),
        name: methodCodes[code],
    }));

exports.methodCodes = methodCodes;
exports.methodCodesDTO = methodCodesDTO;