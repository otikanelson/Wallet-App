const crypto = require('crypto');
const { CRYPTOJSPW } = require('../config/env');

 
async function encryptData(id) { 
    try {

        const text = JSON.stringify(id); 
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(CRYPTOJSPW);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex'); 
        
        return {  message: iv.toString('hex') + ':' + encrypted };
    } catch (error) {
        return {
            error: {
                status: error.status,
                code: error.code,
                message: error.message,
                moreInfo: error.moreInfo,
            },
        };
    }
}

async function deEncryption(id) {
    try {

        if (typeof id !== 'string') {
            throw new Error('Invalid input type. id must be a string.');
          }
      

        const [ivString, ciphertext] = id.split(':');
        const iv = Buffer.from(ivString, 'hex');
        const key = Buffer.from(CRYPTOJSPW);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8'); 


        

        return { success: 'Message sent', message: JSON.parse(decrypted) };
    } catch (error) {
        return {
            error: {
                status: error.status,
                code: error.code,
                message: error.message,
                moreInfo: error.moreInfo,
            },
        };
    }
}


function generatePassword(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()+-=[]{}|;:<>/?';
    let password = '';
    for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
    }
    return password;
    } 

module.exports = {
    encryptData,deEncryption,generatePassword
}