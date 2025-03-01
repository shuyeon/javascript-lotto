var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _numbers, _result, _LottoResult_instances, validate_fn, addRankingCount_fn, findPrize_fn, _winningLotto, _bonusNumber, _lottoList;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const DOM = {
  winningForm: document.querySelector(".winning-form"),
  restartButton: document.querySelector(".restart-button"),
  statisticsModal: document.querySelector(".statistics-modal"),
  modalBackdrop: document.querySelector(".modal-backdrop"),
  lottoInput: document.querySelector(".lotto-input input"),
  winningInputList: document.querySelector(".winning-input-list"),
  bonusInput: document.querySelector(".bonus-input input"),
  purchaseResult: document.querySelector(".lotto-result .small-text"),
  lottoTicketListContainer: document.querySelector(".lotto-ticket-list"),
  purchaseButton: document.querySelector(".lotto-form button"),
  inputPrice: document.querySelector(".lotto-form input"),
  winningButton: document.querySelector(".winning-form button"),
  winningNumberInputs: [...document.querySelectorAll(".winning-input-list input")],
  closeButton: document.querySelector(".close-button"),
  winningRateText: document.querySelector(".winning-rate-text"),
  purchaseErrorText: document.querySelector(".purchase-error-text"),
  winningErrorText: document.querySelector(".winning-error-text"),
  bonusErrorText: document.querySelector(".bonus-error-text")
};
function openModal() {
  DOM.statisticsModal.style.visibility = "visible";
  DOM.modalBackdrop.style.visibility = "visible";
}
function closeModal() {
  DOM.statisticsModal.style.visibility = "hidden";
  DOM.modalBackdrop.style.visibility = "hidden";
}
DOM.closeButton.addEventListener("click", closeModal);
DOM.modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
const matchLotto = {
  winningNumbers(winningLotto, lotto) {
    return winningLotto.matchedWinningCount(lotto);
  },
  bonusNumber(winningLotto, lotto) {
    return winningLotto.isBonusMatched(lotto);
  }
};
const LOTTO_CONDITION = {
  COUNT: 6,
  MIN_NUMBER: 1,
  MAX_NUMBER: 45,
  PRICE: 1e3,
  MAX_PRICE: 1e5
};
const LOTTO_NUMBER_ERROR_MESSAGES = {
  COUNT: `${LOTTO_CONDITION.COUNT}자리 숫자를 입력해주세요.`,
  INTIGER: "정수를 입력해주세요.",
  RANGE: `${LOTTO_CONDITION.MIN_NUMBER}~${LOTTO_CONDITION.MAX_NUMBER} 사이의 숫자를 입력해주세요.`,
  DUPLICATE: "중복된 숫자가 존재합니다."
};
const PURCHASE_NUMBER_ERROR_MESSAGES = {
  INTIGER: "정수를 입력해주세요.",
  UNIT: `${LOTTO_CONDITION.PRICE}원 단위로 입력해주세요.`,
  RANGE: `${LOTTO_CONDITION.PRICE}원 이상 ${LOTTO_CONDITION.MAX_PRICE}미만의 금액을 입력해주세요.`
};
const PRICE_ERROR = "올바르지 않은 가격입니다.";
const BONUS_NUMBER_ERROR_MESSAGES = {
  INTIGER: "정수를 입력해주세요.",
  RANGE: `${LOTTO_CONDITION.MIN_NUMBER}~${LOTTO_CONDITION.MAX_NUMBER} 사이의 숫자를 입력해주세요.`,
  DUPLICATE: "당첨 번호와 중복되었습니다."
};
const RANKING = {
  FIRST: { RANK: 1, MATCH_COUNT: 6, PRIZE: 2e9 },
  SECOND: { RANK: 2, MATCH_COUNT: 5, PRIZE: 3e7 },
  THIRD: { RANK: 3, MATCH_COUNT: 5, PRIZE: 15e5 },
  FOURTH: { RANK: 4, MATCH_COUNT: 4, PRIZE: 5e4 },
  FIFTH: { RANK: 5, MATCH_COUNT: 3, PRIZE: 5e3 }
};
function getRandomNumber(min, max) {
  const numbers = /* @__PURE__ */ new Set();
  while (numbers.size < LOTTO_CONDITION.COUNT) {
    const randomNumber = Math.floor(Math.random() * max) + min;
    numbers.add(randomNumber);
  }
  return [...numbers];
}
const runValidators = (validators, ...input) => validators.forEach((validate) => validate(...input));
const numberUtils = {
  isInteger(number) {
    return Number.isInteger(number);
  },
  isLottoRange(number) {
    return number >= LOTTO_CONDITION.MIN_NUMBER && number <= LOTTO_CONDITION.MAX_NUMBER;
  }
};
const lottoNumberValidator = {
  isValidCount(numbers) {
    return numbers.length !== LOTTO_CONDITION.COUNT;
  },
  isDuplicated(numbers) {
    const lottoSet = new Set(numbers);
    return numbers.length !== lottoSet.size;
  }
};
const validateLottoCount = (numbers) => {
  if (lottoNumberValidator.isValidCount(numbers)) {
    throw new Error(LOTTO_NUMBER_ERROR_MESSAGES.COUNT);
  }
};
const validateLottoNumberInteger = (numbers) => {
  numbers.forEach((numbers2) => {
    if (!numberUtils.isInteger(numbers2)) throw new Error(LOTTO_NUMBER_ERROR_MESSAGES.INTIGER);
  });
};
const validateLottoNumberRange = (numbers) => {
  numbers.forEach((number) => {
    if (!numberUtils.isLottoRange(number)) throw new Error(LOTTO_NUMBER_ERROR_MESSAGES.RANGE);
  });
};
const validateLottoNumberDuplicate = (numbers) => {
  if (lottoNumberValidator.isDuplicated(numbers)) {
    throw new Error(LOTTO_NUMBER_ERROR_MESSAGES.DUPLICATE);
  }
};
const validateLottoNumber = (lottoNumbers) => runValidators(
  [validateLottoCount, validateLottoNumberInteger, validateLottoNumberRange, validateLottoNumberDuplicate],
  lottoNumbers
);
class Lotto {
  constructor(numbers) {
    __privateAdd(this, _numbers);
    __privateSet(this, _numbers, Object.freeze(numbers.sort((a, b) => a - b)));
    validateLottoNumber(__privateGet(this, _numbers));
  }
  hasNumber(winningNumber) {
    return this.numbers.includes(winningNumber);
  }
  get numbers() {
    return __privateGet(this, _numbers);
  }
}
_numbers = new WeakMap();
const purchaseLotto = (purchaseMoney) => {
  const purchaeCount = purchaseMoney / LOTTO_CONDITION.PRICE;
  return Array.from(
    { length: purchaeCount },
    () => createLotto(getRandomNumber(LOTTO_CONDITION.MIN_NUMBER, LOTTO_CONDITION.MAX_NUMBER))
  );
};
const createLotto = (randomNumbers) => {
  return new Lotto(randomNumbers);
};
const calculateRank = (matchCount, isBonusMatch) => {
  if (matchCount === RANKING.FIRST.MATCH_COUNT) return RANKING.FIRST.RANK;
  if (matchCount === RANKING.SECOND.MATCH_COUNT && isBonusMatch) return RANKING.SECOND.RANK;
  if (matchCount === RANKING.THIRD.MATCH_COUNT) return RANKING.THIRD.RANK;
  if (matchCount === RANKING.FOURTH.MATCH_COUNT) return RANKING.FOURTH.RANK;
  if (matchCount === RANKING.FIFTH.MATCH_COUNT) return RANKING.FIFTH.RANK;
  return null;
};
class LottoResult {
  constructor(rankingList) {
    __privateAdd(this, _LottoResult_instances);
    __privateAdd(this, _result);
    __privateSet(this, _result, {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    });
    rankingList.forEach((ranking) => {
      __privateMethod(this, _LottoResult_instances, validate_fn).call(this, ranking);
      __privateMethod(this, _LottoResult_instances, addRankingCount_fn).call(this, ranking);
    });
  }
  get result() {
    return Object.freeze({ ...__privateGet(this, _result) });
  }
  get totalPrize() {
    return Object.entries(__privateGet(this, _result)).reduce((total, [rank, count]) => {
      return total + __privateMethod(this, _LottoResult_instances, findPrize_fn).call(this, rank) * count;
    }, 0);
  }
}
_result = new WeakMap();
_LottoResult_instances = new WeakSet();
validate_fn = function(ranking) {
  const isValidRanking = Object.values(RANKING).some((rank) => rank.RANK === ranking);
  if (!isValidRanking && ranking !== null) {
    throw new Error(RANKING_ERROR_MESSAGES);
  }
};
addRankingCount_fn = function(ranking) {
  if (ranking !== null) __privateGet(this, _result)[ranking]++;
};
findPrize_fn = function(rank) {
  if (rank === null) {
    return 0;
  }
  const rankingKey = Object.keys(RANKING).find((key) => RANKING[key].RANK === Number(rank));
  return RANKING[rankingKey].PRIZE;
};
const calculateWinningRate = (price, prize) => {
  if (price <= 0) {
    throw new Error(PRICE_ERROR);
  }
  const rate = prize / price * 100;
  if (rate % 1 === 0) return Number(rate.toString());
  return Number(rate.toFixed(2));
};
const webLottoService = {
  purchaseLotto(purchaseMoney) {
    return purchaseLotto(purchaseMoney);
  },
  calculateLottoResult(lottoList, winningLotto) {
    const rankingList = lottoList.map((lotto) => {
      return calculateRank(matchLotto.winningNumbers(winningLotto, lotto), matchLotto.bonusNumber(winningLotto, lotto));
    });
    return new LottoResult(rankingList);
  },
  calculateWinningRate(lottoResult, lottoList) {
    return calculateWinningRate(LOTTO_CONDITION.PRICE * lottoList.length, lottoResult.totalPrize);
  }
};
const handlePurchaseClick = (purchaseMoney) => {
  const lottoList = webLottoService.purchaseLotto(purchaseMoney);
  DOM.purchaseButton.disabled = true;
  DOM.inputPrice.disabled = true;
  DOM.winningForm.style.visibility = "visible";
  DOM.winningNumberInputs[0].focus();
  return lottoList;
};
const handleWinningClick = (lottoList, winningLotto) => {
  openModal();
  DOM.winningNumberInputs.forEach((input) => {
    input.disabled = true;
  });
  DOM.bonusInput.disabled = true;
  const lottoResult = webLottoService.calculateLottoResult(lottoList, winningLotto);
  const winningRate = webLottoService.calculateWinningRate(lottoResult, lottoList);
  return { lottoResult, winningRate };
};
const handleRestartClick = () => {
  DOM.lottoInput.value = "";
  DOM.winningInputList.querySelectorAll("input").forEach((input) => input.value = "");
  DOM.bonusInput.value = "";
  DOM.statisticsModal.style.visibility = "hidden";
  DOM.modalBackdrop.style.visibility = "hidden";
  DOM.winningForm.style.visibility = "hidden";
  DOM.purchaseResult.textContent = "";
  DOM.lottoTicketListContainer.innerHTML = "";
  DOM.purchaseButton.disabled = false;
  DOM.inputPrice.disabled = false;
  DOM.winningNumberInputs.forEach((input) => {
    input.disabled = false;
  });
  DOM.bonusInput.disabled = false;
};
const purchaseMoneyValidator = {
  isValidUnit(input) {
    return input % LOTTO_CONDITION.PRICE === 0;
  },
  isValidRange(input) {
    return LOTTO_CONDITION.PRICE <= input && LOTTO_CONDITION.MAX_PRICE >= input;
  }
};
const validatePurchaseMoneyInteger = (input) => {
  if (!numberUtils.isInteger(input)) {
    throw new Error(PURCHASE_NUMBER_ERROR_MESSAGES.INTIGER);
  }
};
const validateUnit = (input) => {
  if (!purchaseMoneyValidator.isValidUnit(input)) {
    throw new Error(PURCHASE_NUMBER_ERROR_MESSAGES.UNIT);
  }
};
const validateRange$1 = (input) => {
  if (!purchaseMoneyValidator.isValidRange(input)) {
    throw new Error(PURCHASE_NUMBER_ERROR_MESSAGES.RANGE);
  }
};
const validatePurchaseMoney = (input) => runValidators([validatePurchaseMoneyInteger, validateRange$1, validateUnit], input);
const bonusNumberValidator = {
  isDuplicated(winningNumbers, bonusNumber) {
    return winningNumbers.hasNumber(bonusNumber);
  }
};
const validateInteger = (winningNumbers, bonusNumber) => {
  if (!numberUtils.isInteger(bonusNumber)) {
    throw new Error(BONUS_NUMBER_ERROR_MESSAGES.INTIGER);
  }
};
const validateRange = (winningNumbers, bonusNumber) => {
  if (!numberUtils.isLottoRange(bonusNumber)) {
    throw new Error(BONUS_NUMBER_ERROR_MESSAGES.RANGE);
  }
};
const validateDuplicate = (winningNumbers, bonusNumber) => {
  if (bonusNumberValidator.isDuplicated(winningNumbers, bonusNumber)) {
    throw new Error(BONUS_NUMBER_ERROR_MESSAGES.DUPLICATE);
  }
};
const validateBonusNumber = (winningNumbers, bonusNumber) => runValidators([validateInteger, validateRange, validateDuplicate], winningNumbers, bonusNumber);
class WinningLotto {
  constructor(winningLotto, bonusNumber) {
    __privateAdd(this, _winningLotto);
    __privateAdd(this, _bonusNumber);
    __privateSet(this, _winningLotto, winningLotto);
    __privateSet(this, _bonusNumber, bonusNumber);
    validateBonusNumber(__privateGet(this, _winningLotto), __privateGet(this, _bonusNumber));
  }
  matchedWinningCount(lotto) {
    return __privateGet(this, _winningLotto).numbers.filter((number) => lotto.hasNumber(number)).length;
  }
  isBonusMatched(lotto) {
    return lotto.hasNumber(__privateGet(this, _bonusNumber));
  }
}
_winningLotto = new WeakMap();
_bonusNumber = new WeakMap();
const webInputHandler = {
  purchaseMoney() {
    try {
      DOM.purchaseErrorText.textContent = "";
      const purchaseMoney = DOM.inputPrice.value;
      validatePurchaseMoney(Number(purchaseMoney));
      return purchaseMoney;
    } catch (e) {
      DOM.inputPrice.value = "";
      DOM.purchaseErrorText.textContent = e.message;
      return null;
    }
  },
  winningNumbers() {
    try {
      DOM.winningErrorText.textContent = "";
      const winningNumbers = Array.from(DOM.winningNumberInputs).map((input) => Number(input.value));
      return new Lotto(winningNumbers.map((num) => Number(num)));
    } catch (e) {
      DOM.winningNumberInputs.forEach((input) => input.value = "");
      DOM.winningErrorText.textContent = e.message;
      return null;
    }
  },
  bonusNumber(winningNumbersLotto) {
    if (winningNumbersLotto === null) return null;
    try {
      DOM.bonusErrorText.textContent = "";
      const bonusNumber = Number(DOM.bonusInput.value);
      return new WinningLotto(winningNumbersLotto, bonusNumber);
    } catch (e) {
      DOM.bonusInput.value = "";
      DOM.bonusErrorText.textContent = e.message;
      return null;
    }
  }
};
const webOutputView = {
  displayLottoNumber(lottoList) {
    DOM.purchaseResult.textContent = `총 ${lottoList.length}개 구매했습니다.`;
    DOM.lottoTicketListContainer.innerHTML = lottoList.map((lotto) => `
                    <div class="lotto-ticket">
                    <p class="ticket-icon">🎟️</p>
                     <p class="ticket-numbers">${lotto.numbers.join(", ")}</p>
                </div>
            `).join("");
    DOM.winningForm.style.visibility = "visible";
  },
  result(lottoResult) {
    const rankingRows = document.querySelectorAll(".statistics-table tbody tr");
    const rankingKeys = ["5", "4", "3", "2", "1"];
    rankingRows.forEach((row, index) => {
      const rank = rankingKeys[index];
      const countCell = row.querySelector("td:last-child");
      countCell.textContent = `${lottoResult.result[rank]}개`;
    });
  },
  winningRate(winningRate) {
    DOM.winningRateText.textContent = `당신의 총 수익률은 ${winningRate}%입니다.`;
  }
};
class WebLottoController {
  constructor() {
    __privateAdd(this, _lottoList);
  }
  handlePurchaseClick(event) {
    event.preventDefault();
    const purchaseMoney = webInputHandler.purchaseMoney();
    if (purchaseMoney !== null) {
      __privateSet(this, _lottoList, handlePurchaseClick(purchaseMoney));
      webOutputView.displayLottoNumber(__privateGet(this, _lottoList));
    }
  }
  handleWinningClick(event) {
    event.preventDefault();
    const winningNumber = webInputHandler.winningNumbers();
    const winningLotto = webInputHandler.bonusNumber(winningNumber);
    if (winningNumber !== null && winningLotto !== null) {
      const result = handleWinningClick(__privateGet(this, _lottoList), winningLotto);
      webOutputView.result(result.lottoResult);
      webOutputView.winningRate(result.winningRate);
    }
  }
  handleRestartClick(event) {
    handleRestartClick();
  }
}
_lottoList = new WeakMap();
const start = () => {
  const webLottoController = new WebLottoController();
  DOM.purchaseButton.addEventListener("click", (event) => webLottoController.handlePurchaseClick(event));
  DOM.winningButton.addEventListener("click", (event) => webLottoController.handleWinningClick(event));
  DOM.restartButton.addEventListener("click", (event) => webLottoController.handleRestartClick(event));
};
start();
