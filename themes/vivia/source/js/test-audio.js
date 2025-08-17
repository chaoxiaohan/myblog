// 这是一个测试用的静默音频文件生成器
// 用于在没有真实音频源时提供基础播放测试

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createSilentAudio(duration = 10) {
    const sampleRate = audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(2, numSamples, sampleRate);
    
    // 生成简单的测试音调
    const frequency = 440; // A4 音调
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < numSamples; i++) {
            channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
        }
    }
    
    return audioBuffer;
}

// 导出测试音频生成函数
window.createTestAudio = createSilentAudio;
