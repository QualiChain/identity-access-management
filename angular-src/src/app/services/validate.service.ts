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

  validateRegisterCompany(company)  {
    if (company.name == null || company.email == null
        || company.description == null || company.location == null
        || company.contact == null || company.password == null
        || company.confirmPassword == null) {
      return false;
    } else {
      return true;
    }
  }

  validateLogin(item) {
    console.log(item);
    return item;
  }

  samePasswords(password, confirmPassoword)  {
    return password === confirmPassoword;
  }


}
