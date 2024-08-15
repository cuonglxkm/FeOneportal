export class TimeCommon {
  public static readonly timeOutSearch = 1200;
}

export function checkPossiblePressNumber(event: KeyboardEvent) {
  const key = event.key;
  if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
    event.preventDefault();
  }
}

export function checkProperSslWithDomain(domain: string, domainList: string[]){
  for (let i = 0; i < domainList.length; i++) {
    let pattern = domainList[i];

    if (pattern.startsWith('*.')) {
        let basePattern = pattern.substring(2);
        if (domain.endsWith(basePattern)) {
            let subdomains = domain.split('.');
            if (subdomains.length > 2 && domain.endsWith('.' + basePattern)) {
                return true;
            } else if (domain === basePattern) {
                return true;
            }
        }
    } else {
        if (domain === pattern) {
            return true;
        }
    }
}
return false;
}
