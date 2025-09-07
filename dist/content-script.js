"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 비디오 로드 시 다운로드 버튼 삽입
function insertDownloadButton() {
    // 이미 버튼이 있으면 중복 생성 방지
    if (document.querySelector('button.vc-pctrl-download-btn'))
        return;
    const playerBtnsBar = document.querySelector('div.vc-pctrl-buttons-bar');
    if (!playerBtnsBar)
        return;
    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('vc-pctrl-download-btn');
    downloadBtn.title = '다운로드';
    downloadBtn.textContent = '⬇'; // 아이콘 또는 텍스트
    playerBtnsBar.appendChild(downloadBtn);
    downloadBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
        // 비디오 src 추출 (단일 비디오 기준)
        const videoComponent = document.querySelector('div#video-play-video2');
        const videoElem = videoComponent === null || videoComponent === void 0 ? void 0 : videoComponent.querySelector('video.vc-vplay-video1');
        const videoUrl = videoElem === null || videoElem === void 0 ? void 0 : videoElem.getAttribute('src');
        if (videoUrl) {
            yield startDownload(videoUrl);
        }
        else {
            alert('비디오를 찾을 수 없습니다.');
        }
    });
}
// 비디오가 로드될 때까지 반복 체크 후 버튼 삽입
const intervalId = setInterval(() => {
    const isVideoLoaded = !!document.querySelector('video.vc-vplay-video1');
    if (isVideoLoaded) {
        insertDownloadButton();
        clearInterval(intervalId);
    }
}, 100);
// src/content-script.ts
// 동영상 URL 추출 및 다운로드 버튼 UI 삽입
function startDownload(videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // 기존 content.js의 다운로드 로직을 TypeScript로 이식
        const titleElem = document.querySelector('.vc-content-meta-title-text');
        const title = titleElem ? titleElem.innerHTML : 'video';
        const fname = window.prompt('저장할 파일 이름을 입력해주세요', title);
        if (fname === null) {
            console.error('cancel to download video');
            return;
        }
        const downloadBtn = document.querySelector('button.vc-pctrl-download-btn');
        const defaultOnClick = downloadBtn === null || downloadBtn === void 0 ? void 0 : downloadBtn.onclick;
        if (downloadBtn) {
            downloadBtn.className = 'vc-pctrl-loading-btn';
            downloadBtn.onclick = () => { };
        }
        // ProgressBar 생성
        let progressBar = document.getElementById('icampus-download-progress');
        if (!progressBar) {
            progressBar = document.createElement('progress');
            progressBar.id = 'icampus-download-progress';
            progressBar.max = 100;
            progressBar.value = 0;
            const videoPlayer = document.querySelector('#video-play-wrapper');
            if (videoPlayer) {
                // TODO: append last child
                videoPlayer.appendChild(progressBar);
            }
            else {
                console.log('No video player found, not adding progress bar');
            }
        }
        try {
            const response = yield fetch(videoUrl);
            const total = Number(response.headers.get('content-length')) || 0;
            const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader)
                throw new Error('No readable stream');
            let loaded = 0;
            const chunks = [];
            while (true) {
                const { done, value } = yield reader.read();
                if (done)
                    break;
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
        }
        catch (err) {
            alert('다운로드 실패: ' + String(err));
            progressBar === null || progressBar === void 0 ? void 0 : progressBar.remove();
        }
        if (downloadBtn) {
            downloadBtn.className = 'vc-pctrl-download-btn';
            downloadBtn.onclick = defaultOnClick !== null && defaultOnClick !== void 0 ? defaultOnClick : null;
        }
    });
}
// PDF 변환 함수 (추후 구현 예정)
// export async function extractAndConvertPDF(filePath: string): Promise<string> {
//   // FFmpeg.js 등으로 프레임 추출 및 PDF 변환 예정
//   return "";
// }
