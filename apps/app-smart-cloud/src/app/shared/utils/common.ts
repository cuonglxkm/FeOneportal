export class TimeCommon {
  public static readonly timeOutSearch = 1200;
}

export function checkPossiblePressNumber(event: KeyboardEvent) {
  const key = event.key;
  if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
    event.preventDefault();
  }
}
