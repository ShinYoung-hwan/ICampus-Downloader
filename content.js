const default_srcs = new Set([
  null, // 모두 완료되어 없어진 경우
  "/viewer/uniplayer/preloader.mp4",
  "/settings/viewer/uniplayer/intro1.mp4",
]);

const download_video = async (url) => {
  const title = document.querySelector(".vc-content-meta-title-text").innerHTML;

  const fname = prompt("저장할 파일 이름을 입력해주세요", title);
  if (fname === null) {
    console.log("cancel to download video");
    return; // 취소를 클릭한 경우 다운로드 하지 않는다.
  }

  const download_btn = document.querySelector("button.vc-pctrl-download-btn");
  const default_onclick = download_btn.onclick;

  download_btn.className = "vc-pctrl-loading-btn";
  download_btn.onclick = () => {};
  await fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fname}.mp4`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
    });
  download_btn.className = "vc-pctrl-download-btn";
  download_btn.onclick = default_onclick;
};

const is_preview_done = async (video_component) => {
  /* preview 동영상이 완료되었는지 확인한다. */
  const src = video_component
    .querySelector(".vc-vplay-video1")
    .getAttribute("src");

  if (!default_srcs.has(src)) return true;

  return false;
};

const interval_video_load = setInterval(() => {
  // ebook이 업로드 되는 경우
  const is_ebook_loaded = !!document.querySelector(".ebook-top-gradation");
  if (is_ebook_loaded) {
    console.log("It is ebook page");
    clearInterval(interval_video_load);
    return;
  }

  const is_video_loaded = !!(
    document.querySelector("video.vc-vplay-video1") ||
    document.querySelector("video.vc-vplay-video2") ||
    document.querySelector("video.vc-vplay-video3") ||
    document.querySelector("video.vc-vplay-video4")
  );

  // video component가 로드되지 않은 경우
  if (!is_video_loaded) {
    console.log("video unloaded");
    return;
  }

  clearInterval(interval_video_load);

  // 다운로드 기능 삽입

  // 다운로드 버튼 생성
  const download_btn = document.createElement("button");
  download_btn.classList.add("vc-pctrl-download-btn");
  download_btn.title = "다운로드";

  const player_btns_bar = document.querySelector("div.vc-pctrl-buttons-bar");
  player_btns_bar.appendChild(download_btn);

  // 다운로드 버튼 클릭시
  const play_btn = document.querySelector(".vc-front-screen-play-btn");
  const confirm_dialog = document.querySelector("#confirm-dialog");
  const confirm_btn = document.querySelector("div.confirm-ok-btn");
  const video1 = document.querySelector("#video-play-video1");
  const video2 = document.querySelector("#video-play-video2");

  download_btn.onclick = async () => {
    //  1. 재생 버튼 클릭
    if (play_btn.style.display === "") {
      play_btn.click();
      play_btn.style.display = "none"; // 안보이게 감추기
    }

    //  2. preview skip && confirm 메세지창 skip
    while (!(await is_preview_done(video1))) {
      if (confirm_dialog.style.display === "table") confirm_btn.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    //  3. url parsing
    //    3.1 video 1개
    //    3.2 video 2개

    const video1_src = video1
      .getElementsByTagName("video")[0]
      .getAttribute("src");
    const video2_left_src = video2
      .getElementsByTagName("video")[0]
      .getAttribute("src");
    const video2_right_src = video2
      .getElementsByTagName("video")[1]
      .getAttribute("src");

    let type = null;

    if (video1_src && !default_srcs.has(video1_src)) type = 1;
    else type = 2;

    // 단일 video
    if (type === 1) {
      console.log("Try to download video 1");
      download_video(video1_src);
    }
    // 좌우 video
    else if (type === 2) {
      console.log("Try to download video 2");
      download_video(video2_left_src);
    }
  };
}, 50);

// show play controller
setInterval(() => {
  const play_controller = document.querySelector("#play-controller");
  if (play_controller) play_controller.style.display = "block";
}, 50);
