// ===== Shared BGM System for all pages =====
const bgmPlaylist = [
    { src: 'bgm/初音未来 - ワールドイズマイン (World is Mine) (Game Version).ogg', title: 'World is Mine' }
];

let bgmIndex = parseInt(localStorage.getItem('bgmIndex') || '0');
// Default to OFF — user must click to play
let isBgmPlaying = false;
let bgmAudio = null;

function initBGM() {
    bgmAudio = document.getElementById('bgmAudio');
    if (!bgmAudio) return;

    bgmAudio.src = bgmPlaylist[bgmIndex].src;
    updateSongTitle();

    // Auto-play next track
    bgmAudio.addEventListener('ended', () => {
        nextTrack();
    });
}

function toggleBGM() {
    if (!bgmAudio) return;
    isBgmPlaying = !isBgmPlaying;

    if (isBgmPlaying) {
        bgmAudio.play().catch(() => {});
    } else {
        bgmAudio.pause();
    }
    updatePlayButton();
}

function nextTrack() {
    bgmIndex = (bgmIndex + 1) % bgmPlaylist.length;
    localStorage.setItem('bgmIndex', bgmIndex.toString());
    bgmAudio.src = bgmPlaylist[bgmIndex].src;
    updateSongTitle();
    if (isBgmPlaying) bgmAudio.play().catch(() => {});
}

function prevTrack() {
    bgmIndex = (bgmIndex - 1 + bgmPlaylist.length) % bgmPlaylist.length;
    localStorage.setItem('bgmIndex', bgmIndex.toString());
    bgmAudio.src = bgmPlaylist[bgmIndex].src;
    updateSongTitle();
    if (isBgmPlaying) bgmAudio.play().catch(() => {});
}

function updateSongTitle() {
    const titleEl = document.getElementById('bgmSongTitle');
    if (titleEl) {
        titleEl.textContent = bgmPlaylist[bgmIndex].title;
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('bgmPlayBtn');
    if (playBtn) {
        playBtn.textContent = isBgmPlaying ? '⏸' : '▶';
        playBtn.title = isBgmPlaying ? '暂停' : '播放';
    }
    // Toggle rotation animation on music icon
    const musicControl = document.querySelector('.music-control');
    if (musicControl) {
        musicControl.classList.toggle('playing', isBgmPlaying);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initBGM);
