// 타이머 알림음은 외부 오디오 파일 대신 Web Audio로 합성한다(오프라인에서도 울리게).
let audioCtx = null;

const getCtx = () => {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
};

// 모바일은 사용자 제스처 없이 소리를 못 낸다. 타이머 시작 시점에 미리 깨워둔다.
export const primeTimerSound = () => {
    try {
        getCtx();
    } catch (error) {
        /* 오디오를 못 쓰는 환경은 무음으로 둔다 */
    }
};

export const playTimerSound = (volumePercent = 100) => {
    const volume = Math.min(1, Math.max(0, Number(volumePercent || 0) / 100));
    if (!volume) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        const startAt = ctx.currentTime;
        // 짧은 2음 알림(도-솔 느낌)
        [880, 1318.51].forEach((frequency, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const begin = startAt + index * 0.18;
            osc.type = 'sine';
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, begin);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.5), begin + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, begin + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(begin);
            osc.stop(begin + 0.18);
        });
    } catch (error) {
        /* 재생 실패는 무시 */
    }
};
