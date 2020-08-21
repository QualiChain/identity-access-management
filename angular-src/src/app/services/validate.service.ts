import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateAddress(address)  {
    const re = /^0x[a-fA-F0-9]{40}$/;
    return re.test(address.toLowerCase());
  }


  validateCivilID(civilID)  {
    return parseInt(civilID);
  }

  validateCertificate(uploded, certificate)  {
    if (!uploded || certificate === null)  {
      return false;
    }
    const re = /^.*\.(pdf|PDF)$/;
    return re.test(certificate.name.toLowerCase());
  }

}
