const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'SWKETCHY_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumbnail = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const progress = $('#progress');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: {},
    //config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, //Đang lỗi
    
    songs: [
        {
            name: 'The Baddest',
            singer: 'K/DA',
            path: './assets/music/the-baddest.mp3',
            img:'./assets/img/the-baddest.jpg'
        },
        {
            name: 'Drum go Dum',
            singer: 'K/DA',
            path: './assets/music/drum-go-dum.mp3',
            img:'./assets/img/drum-go-dum.jpg'
        },
        {
            name: 'The Call',
            singer: 'Louis Leibfried & Edda Hayes',
            path: './assets/music/the-call.mp3',
            img:'./assets/img/the-call.jpg'
        },
        {
            name: 'Battle Theme',
            singer: 'LoL team',
            path: './assets/music/battle-theme-song.mp3',
            img:'./assets/img/jungle.jpg'
        },
        {
            name: 'Rise',
            singer: 'The Glitch Mob, Mako, and The Word Alive',
            path: './assets/music/rise.mp3',
            img:'./assets/img/rise.jfif'
        },
        {
            name: 'Warriors',
            singer: '2WEI, Edda Hayes',
            path: './assets/music/warriors.mp3',
            img:'./assets/img/warriors.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        //localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    }, 

    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.img}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = html.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimation = cdThumbnail.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iteration: Infinity
        })
        cdThumbAnimation.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
            
        }

        // Xử lý khi click play nhạc
        playBtn.onclick = function () {
            if(_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        }

        // Khi song dc play 
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play();
        }

        // Khi song bị pause 
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause();
        }

        // Khi tiến độ song thay đổi
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render(); 
            _this.scrollToActiveSong(); 
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
        }

        // Khi chọn ngẫu nhiên song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý phát lại 1 song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi song kết thúc
        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(
                songNode ||
                e.target.closest('.option')
            ) {
                // Xừ lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xứ lý khi click vào option
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumbnail.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'center',
            });
        }, 300);
    },

    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho obj
        this.defineProperties();

        // Lắng nghe và xử lí sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy
        this.loadCurrentSong();

        // render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của btn Repeat, Random
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat);
    },
}

app.start();
