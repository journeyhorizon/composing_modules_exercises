import crypto from 'crypto';
import config from '../config';

export const generatePassword = (str) => {
  const buffer = Buffer.from(str, 'utf-8');
  const base64 = buffer.toString('base64');
  const hash = crypto.createHash('sha256').update(base64).digest('hex');
  const newStr = `${hash}${config.sharetribeFlex.page.secret}`;
  return crypto.createHash('md5').update(newStr).digest('hex');
}