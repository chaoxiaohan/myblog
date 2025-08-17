class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.7;
        this.isExpanded = false;
        this.currentLyricIndex = 0;
        this.lyrics = [];
        this.audio = null;
        this.currentSong = null;
        this.autoPlay = true; // 自动播放
        
        this.init();
    }

    init() {
        this.createPlayerHTML();
        this.bindEvents();
        this.loadDefaultSong();
    }

    createPlayerHTML() {
        const playerHTML = `
            <div class="music-player" id="musicPlayer">
                <div class="music-player-header" id="musicPlayerHeader">
                    <button class="music-toggle" id="musicToggle">
                        <i class="fa-solid fa-music"></i>
                    </button>
                    <div class="music-info">
                        <div class="music-title" id="musicTitle">Luv It Baby</div>
                        <div class="music-artist" id="musicArtist">点击播放音乐</div>
                    </div>
                </div>
                <div class="music-player-body">
                    <img class="music-cover" id="musicCover" src="/images/default-cover.svg" alt="音乐封面">
                    <div class="music-lyrics" id="musicLyrics">
                        <div class="lyric-line">暂无歌词</div>
                        <div class="lyric-line"></div>
                    </div>
                    <div class="music-progress-container">
                        <div class="music-progress" id="musicProgress">
                            <div class="music-progress-bar" id="musicProgressBar"></div>
                        </div>
                        <div class="music-time">
                            <span id="currentTime">00:00</span>
                            <span id="totalTime">00:00</span>
                        </div>
                    </div>
                    <div class="music-controls">
                        <button class="music-btn play-pause" id="playPauseBtn">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    </div>
                    <div class="music-volume-container">
                        <span class="volume-icon">🔊</span>
                        <div class="music-volume" id="musicVolume">
                            <div class="music-volume-bar" id="musicVolumeBar"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', playerHTML);
    }

    bindEvents() {
        const header = document.getElementById('musicPlayerHeader');
        const player = document.getElementById('musicPlayer');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const progress = document.getElementById('musicProgress');
        const volume = document.getElementById('musicVolume');

        // 展开/收起播放器
        header.addEventListener('click', () => {
            this.togglePlayer();
        });

        // 播放/暂停
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlay();
        });

        // 进度条控制
        progress.addEventListener('click', (e) => {
            const rect = progress.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seekTo(percent);
        });

        // 音量控制
        volume.addEventListener('click', (e) => {
            const rect = volume.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.setVolume(percent);
        });
    }

    togglePlayer() {
        const player = document.getElementById('musicPlayer');
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            player.classList.add('expanded');
        } else {
            player.classList.remove('expanded');
        }
    }

    // 解析LRC歌词格式
    parseLyrics(lyricText) {
        const lines = lyricText.split('\n');
        const lyrics = [];
        
        for (const line of lines) {
            const match = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseFloat(match[2]);
                const time = (minutes * 60 + seconds) * 1000; // 转换为毫秒
                const text = match[3].trim();
                
                if (text) { // 只添加非空歌词
                    lyrics.push({ time, text });
                }
            }
        }
        
        return lyrics.sort((a, b) => a.time - b.time);
    }

    loadDefaultSong() {
        // 真实歌词文本
        const lyricText = `[by:安潺]
[00:12.542]Baby きみが「かわいい」って
[00:15.391]言ってくれたメイクと服のまま一生いたいな
[00:25.257]Baby 耳に残るLove you
[00:27.794]不安を脱ぎ捨てられたら一緒にいられるの？
[00:36.115]会いたいな きみは何してるのかな
[00:43.213]返事もないから今夜も眠れないの
[00:49.436]わかってる？きみのせいだよ
[00:51.993]最近 私かわいくなったの
[00:55.103]勇気出したら奇跡は起きる?
[00:57.998]好きになっても いいの？だめなの？
[01:02.049]Luv it luv it luv it Baby
[01:05.076]さびしいの？Rabbit Baby
[01:08.252]どうしよう抱きしめたい
[01:11.290]傷付きたくないのに
[01:14.365]Luv it luv it luv it Baby
[01:17.246]きみとなら恋したいの
[01:26.412]もっと単純に もっと曖昧に
[01:29.313]もっと大胆に もっとPlease love me
[01:32.273]ちょっと苦しい恋は怖い
[01:35.654]だけど知りたい 「好き」って痛い?
[01:39.390]きみの匂いがする甘いワンルーム
[01:45.595]画面を飛び越えて きみにふれた
[01:51.057]わからないでしょ?
[01:52.976]きみの返事のない夜
[01:53.618]いつも泣いてますけど
[01:56.904]忘れないでよ キスした事も
[02:00.120]みんながいても名前呼んでよ
[02:03.390]Luv it luv it luv it Baby
[02:06.853]なんであの子を見てるの?
[02:09.947]なんで私じゃダメなの?
[02:12.789]なのになんで優しいの?
[02:16.267]Luv it luv it luv it Baby
[02:19.363]泣いちゃいそうだよ
[02:23.177]きみがほしいの
[02:28.378]もっと单純に もっと曖昧に
[02:30.895]もっと大胆に もっとPlease love me
[02:34.011]ちょっと苦しい恋は怖い
[02:37.358]だけど知りたい 「好き」って言いたい`;

        // 单一歌曲配置
        const song = {
            title: "Luv It Baby",
            artist: "なえなの",
            cover: "https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/music1.jpg",
            netease_id: "2158522240",
            lyrics: this.parseLyrics(lyricText)
        };

        this.currentSong = song;
        this.loadSong(song);
    }

    loadSong(song) {
        this.currentSong = song;
        this.lyrics = song.lyrics || [];
        this.currentTime = 0;
        this.currentLyricIndex = 0;
        
        document.getElementById('musicTitle').textContent = song.title;
        document.getElementById('musicArtist').textContent = song.artist;
        document.getElementById('musicCover').src = song.cover || '/images/default-cover.svg';
        
        if (this.audio) {
            this.audio.pause();
        }
        
        // 创建新的音频对象
        this.audio = new Audio();
        this.audio.volume = this.volume;
        this.audio.crossOrigin = "anonymous";
        
        // 直接使用网易云音乐的真实链接
        if (song.netease_id) {
            // 使用更可靠的音频API源
            const audioSources = [
                `https://link.hhtjim.com/163/${song.netease_id}.mp3`,
                `https://api.injahow.cn/meting/?type=song&id=${song.netease_id}&source=netease&format=mp3`,
                `https://music.163.com/song/media/outer/url?id=${song.netease_id}.mp3`
            ];
            
            this.tryLoadAudio(audioSources, 0);
        } else {
            console.log('没有有效的音乐ID');
        }

        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            document.getElementById('totalTime').textContent = this.formatTime(this.duration);
            console.log('音频元数据加载完成:', song.title, '时长:', this.formatTime(this.duration));
            
            // 如果设置了自动播放，则开始播放
            if (this.autoPlay) {
                this.startAutoPlay();
            }
        });

        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            this.updateProgress();
            this.updateLyrics();
        });

        this.audio.addEventListener('ended', () => {
            // 循环播放同一首歌
            this.currentTime = 0;
            this.currentLyricIndex = 0;
            this.audio.currentTime = 0;
            this.audio.play();
            this.displayLyrics();
        });

        this.audio.addEventListener('error', (e) => {
            console.log('音频播放出错:', e);
        });

        // 重置显示
        this.displayLyrics();
        document.getElementById('currentTime').textContent = '00:00';
    }

    startAutoPlay() {
        // 自动开始播放
        console.log('准备自动播放音频...');
        
        // 尝试立即播放
        const attemptAutoPlay = () => {
            if (this.audio && this.audio.readyState >= 2) {
                this.audio.play().then(() => {
                    console.log('✅ 自动播放成功');
                    this.isPlaying = true;
                    const playBtn = document.getElementById('playPauseBtn');
                    const player = document.getElementById('musicPlayer');
                    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    player.classList.add('playing');
                }).catch(e => {
                    console.log('⚠️ 自动播放被浏览器阻止:', e.message);
                    this.showPlayTip();
                    
                    // 添加用户交互后自动播放
                    const enableAutoPlay = () => {
                        if (!this.isPlaying) {
                            this.togglePlay();
                        }
                        document.removeEventListener('click', enableAutoPlay);
                        document.removeEventListener('keydown', enableAutoPlay);
                    };
                    
                    document.addEventListener('click', enableAutoPlay, { once: true });
                    document.addEventListener('keydown', enableAutoPlay, { once: true });
                });
            } else {
                // 如果音频还没准备好，等待一下再试
                setTimeout(attemptAutoPlay, 500);
            }
        };
        
        setTimeout(attemptAutoPlay, 1500); // 延迟1.5秒开始播放，确保页面完全加载
    }

    tryLoadAudio(sources, index) {
        if (index >= sources.length) {
            console.log('所有音频源都无法加载，请检查网络连接或音乐版权限制');
            document.getElementById('musicArtist').textContent = '音频加载失败 • 请检查网络';
            return;
        }

        const source = sources[index];
        console.log(`正在加载音频源 ${index + 1}/${sources.length}:`, source);
        
        // 重置audio对象
        this.audio.src = '';
        this.audio.load();
        
        const loadTimeout = setTimeout(() => {
            console.log('音频加载超时，尝试下一个源');
            this.tryLoadAudio(sources, index + 1);
        }, 8000); // 增加超时时间，给音频加载更多时间

        // 成功加载事件
        const onCanPlay = () => {
            clearTimeout(loadTimeout);
            this.audio.removeEventListener('canplay', onCanPlay);
            this.audio.removeEventListener('error', onError);
            this.audio.removeEventListener('loadstart', onLoadStart);
            console.log('✅ 音频加载成功:', source);
            
            // 更新UI显示已连接音频
            document.getElementById('musicArtist').textContent = this.currentSong.artist + ' • 音频已就绪';
            
            // 如果用户已经点击了播放或设置了自动播放，则开始播放
            if (this.isPlaying || this.autoPlay) {
                this.audio.play().then(() => {
                    console.log('音频开始播放');
                    this.isPlaying = true;
                    const playBtn = document.getElementById('playPauseBtn');
                    const player = document.getElementById('musicPlayer');
                    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    player.classList.add('playing');
                }).catch(e => {
                    console.log('自动播放被浏览器阻止，需要用户交互:', e.message);
                    this.showPlayTip();
                });
            }
        };

        // 加载开始事件
        const onLoadStart = () => {
            console.log('开始加载音频:', source);
            document.getElementById('musicArtist').textContent = this.currentSong.artist + ' • 正在加载...';
        };

        // 错误加载事件
        const onError = (e) => {
            clearTimeout(loadTimeout);
            this.audio.removeEventListener('canplay', onCanPlay);
            this.audio.removeEventListener('error', onError);
            this.audio.removeEventListener('loadstart', onLoadStart);
            console.log('❌ 音频源加载失败:', source, e.type);
            this.tryLoadAudio(sources, index + 1);
        };

        this.audio.addEventListener('canplay', onCanPlay, { once: true });
        this.audio.addEventListener('error', onError, { once: true });
        this.audio.addEventListener('loadstart', onLoadStart, { once: true });

        // 设置音频源并开始加载
        this.audio.src = source;
        this.audio.load();
    }

    showNoAudioTip() {
        // 显示无音频提示
        const artistEl = document.getElementById('musicArtist');
        const originalText = artistEl.textContent;
        
        artistEl.textContent = '演示模式 • 无实际音频';
        artistEl.style.color = '#ff8e8e';
        
        setTimeout(() => {
            artistEl.style.color = '';
        }, 3000);
    }

    togglePlay() {
        if (!this.audio || !this.audio.src) {
            console.log('音频尚未准备好');
            return;
        }

        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playPauseBtn');
        const player = document.getElementById('musicPlayer');
        
        if (this.isPlaying) {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            player.classList.add('playing');
            
            // 播放真实音频
            this.audio.play().then(() => {
                console.log('音频播放开始');
            }).catch(e => {
                console.log('播放失败:', e.message);
                this.isPlaying = false;
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                player.classList.remove('playing');
                this.showPlayTip();
            });
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            player.classList.remove('playing');
            this.audio.pause();
        }
    }

    showPlayTip() {
        // 显示需要用户交互才能播放音频的提示
        const playBtn = document.getElementById('playPauseBtn');
        const originalHTML = playBtn.innerHTML;
        
        playBtn.innerHTML = '<i class="fa-solid fa-hand-pointer"></i>';
        playBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
        
        setTimeout(() => {
            playBtn.innerHTML = originalHTML;
            playBtn.style.background = 'linear-gradient(135deg, #4a90e2, #87ceeb)';
        }, 2000);
        
        console.log('由于浏览器安全策略，需要用户手动点击播放');
    }

    seekTo(percent) {
        if (!this.audio || !this.duration) {
            return;
        }
        
        const newTime = this.duration * percent;
        this.audio.currentTime = newTime;
        this.updateProgress();
    }

    setVolume(percent) {
        this.volume = Math.max(0, Math.min(1, percent));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        document.getElementById('musicVolumeBar').style.width = (this.volume * 100) + '%';
    }

    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        document.getElementById('musicProgressBar').style.width = percent + '%';
        document.getElementById('currentTime').textContent = this.formatTime(this.currentTime);
    }

    updateLyrics() {
        if (!this.lyrics.length) return;
        
        let currentIndex = 0;
        for (let i = 0; i < this.lyrics.length; i++) {
            if (this.currentTime * 1000 >= this.lyrics[i].time) {
                currentIndex = i;
            } else {
                break;
            }
        }

        if (currentIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = currentIndex;
            this.displayLyrics();
        }
    }

    displayLyrics() {
        const lyricsContainer = document.getElementById('musicLyrics');
        const lines = lyricsContainer.querySelectorAll('.lyric-line');
        
        // 显示当前和下一句歌词
        const currentLyric = this.lyrics[this.currentLyricIndex]?.text || '';
        const nextLyric = this.lyrics[this.currentLyricIndex + 1]?.text || '';
        
        lines[0].textContent = currentLyric;
        lines[1].textContent = nextLyric;
        
        lines[0].classList.add('current');
        lines[1].classList.remove('current');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 页面加载完成后初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保页面完全加载
    setTimeout(() => {
        window.musicPlayer = new MusicPlayer();
        console.log('🎵 音乐播放器初始化完成');
        
        // 自动展开播放器
        setTimeout(() => {
            const player = document.getElementById('musicPlayer');
            if (player) {
                player.classList.add('expanded');
                window.musicPlayer.isExpanded = true;
            }
        }, 2000);
        
        // 尝试启用音频上下文（某些浏览器需要）
        document.addEventListener('click', function enableAudio() {
            const audioContext = window.AudioContext || window.webkitAudioContext;
            if (audioContext) {
                const context = new audioContext();
                if (context.state === 'suspended') {
                    context.resume();
                }
            }
            document.removeEventListener('click', enableAudio);
        }, { once: true });
        
    }, 1000);
});
