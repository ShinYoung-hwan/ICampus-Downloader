// src/background.ts
// 다운로드 및 PDF 변환 요청 처리
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'convertPDF') {
    // extractAndConvertPDF 호출 예정
  }
});
