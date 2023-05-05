const fs = require('fs');
const forge = require('node-forge');

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
const attrs = [{
    name: 'commonName',
    value: 'example.com'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'California'
}, {
    name: 'localityName',
    value: 'San Francisco'
}, {
    name: 'organizationName',
    value: 'Test'
}, {
    shortName: 'OU',
    value: 'Test'
}];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
}, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
}, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
}, {
    name: 'nsCertType',
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
}, {
    name: 'subjectAltName',
    altNames: [{
        type: 6, // URI
        value: 'http://example.com/webid#me'
    }, {
        type: 7, // IP
        ip: '127.0.0.1'
    }]
}, {
    name: 'subjectKeyIdentifier'
}]);
cert.sign(keys.privateKey);

const pem = {
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    certificate: forge.pki.certificateToPem(cert)
};

fs.writeFileSync('key.pem', pem.privateKey);
fs.writeFileSync('cert.pem', pem.certificate);