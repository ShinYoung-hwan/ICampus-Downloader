// 비디오 로드 시 다운로드 버튼 삽입
function insertDownloadButton() {
  // 이미 버튼이 있으면 중복 생성 방지
  if (document.querySelector('div.vc-pctrl-download-btn')) return;

  const playerBtnsBar = document.querySelector('div.vc-pctrl-buttons-bar');
  if (!playerBtnsBar) return;

  const downloadBtn = document.createElement('div');
  downloadBtn.classList.add('vc-pctrl-download-btn');
  downloadBtn.title = '다운로드';

  playerBtnsBar.appendChild(downloadBtn);

  downloadBtn.onclick = async () => {
    // 비디오 src 추출 
    // 단일 비디오
    let videoComponent = document.querySelector('div#video-play-video1');
    let videoElem = videoComponent?.querySelector('video.vc-vplay-video1');
    let videoUrl = videoElem?.getAttribute('src');
    if (videoUrl) {
      await startDownload(videoUrl);
      return;
    }

    // 듀얼 비디오
    // TODO: 추후 듀얼 비디오 선택 기능 추가
    videoComponent = document.querySelector('div#video-play-video2');
    videoElem = videoComponent?.querySelector('video.vc-vplay-video1');
    videoUrl = videoElem?.getAttribute('src');
    if (videoUrl) {
      await startDownload(videoUrl);
    } else {
      alert('비디오를 찾을 수 없습니다.');
    }
  };
}

// 비디오가 로드될 때까지 MutationObserver로 감시 후 버튼 삽입
const observerTarget = document.body;
let observer: MutationObserver | null = null;
function checkAndInsertButton() {
  const isVideoLoaded = !!document.querySelector('video.vc-vplay-video1');
  if (isVideoLoaded) {
    insertDownloadButton();
    if (observer) observer.disconnect();
  }
}
observer = new MutationObserver(() => {
  checkAndInsertButton();
});
observer.observe(observerTarget, { childList: true, subtree: true });

// 다운로드 로직 및 진행률 표시
async function startDownload(videoUrl: string): Promise<void> {
  const titleElem = document.querySelector('.vc-content-meta-title-text');
  const title = titleElem ? titleElem.textContent ?? 'video' : 'video';

  const fname = window.prompt('저장할 파일 이름을 입력해주세요', title);
  if (fname === null) {
    console.log('cancel to download video');
    return;
  }

  const downloadBtn = document.querySelector('div.vc-pctrl-download-btn') as HTMLDivElement | null;
  const defaultOnClick = downloadBtn?.onclick;

  if (downloadBtn) {
    downloadBtn.className = 'vc-pctrl-loading-btn';
    downloadBtn.onclick = () => {};
  }

  // ProgressBar 생성
  let progressBar = document.getElementById('icampus-download-progress') as HTMLProgressElement | null;
  if (!progressBar) {
    progressBar = document.createElement('progress');
    progressBar.id = 'icampus-download-progress';
    progressBar.max = 100;
    progressBar.value = 0;

    const videoPlayer = document.querySelector('#video-play-wrapper');
    if (videoPlayer) {
        videoPlayer.appendChild(progressBar);
    } else {
        console.log('No video player found, not adding progress bar');
    }

  }

  // Fetch API로 다운로드 및 진행률 업데이트
  try {
    const response = await fetch(videoUrl);
    const total = Number(response.headers.get('content-length')) || 0;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');

    let loaded = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total > 0) {
        progressBar.value = Math.floor((loaded / total) * 100);
      }
    }

    const blob = new Blob(chunks, { type: 'video/mp4' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fname}.mp4`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
    progressBar.remove();
  } catch (err) {
    alert('다운로드 실패: ' + String(err));
    progressBar?.remove();
  }

  // 버튼 원래 상태로 복구
  if (downloadBtn) {
    downloadBtn.className = 'vc-pctrl-download-btn';
    downloadBtn.onclick = defaultOnClick ?? null;
  }
}

function setDownloadBtnBackground(downloadurl?: string, loadingurl?: string) {
  const style = document.createElement('style');
  style.textContent = `
    .vc-pctrl-download-btn {
      background-image: url("${downloadurl}")
    }
    .vc-pctrl-loading-btn {
      background-image: url("${loadingurl}")
    }
  `;
  
  document.head.appendChild(style);
}
const downloadImg = chrome.runtime.getURL('images/download30.png');
const loadingImg = chrome.runtime.getURL('images/loading30.png');
setDownloadBtnBackground(downloadImg, loadingImg);

// PDF 변환 함수 (TODO: 추후 구현 예정)
// export async function extractAndConvertPDF(filePath: string): Promise<string> {
//   // FFmpeg.js 등으로 프레임 추출 및 PDF 변환 예정
//   return "";
// }

// for debugging
// setInterval(( ) => {
//   const playerBtnsBar = document.querySelector('div#play-controller');
//   if (playerBtnsBar) {
//     console.log('playerBtnsBar display:', (playerBtnsBar as HTMLElement).style.display);
//     (playerBtnsBar as HTMLElement).style.display = 'block';
//   } else {
//     console.log('no playerBtnsBar');
//   }
// }, 100); 