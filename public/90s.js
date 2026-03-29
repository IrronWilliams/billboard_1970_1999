const STREAM = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';

const audio     = new Audio();
let   hls       = null;
const record    = document.getElementById('record');
const waveform  = document.getElementById('waveform');
const playBtn   = document.getElementById('playBtn');
const statusEl  = document.getElementById('status');
const volSlider = document.getElementById('volSlider');
const volPct    = document.getElementById('volPct');
const speakerEl = document.getElementById('speakerIcon');
const thumbUp   = document.getElementById('thumbUp');
const thumbDown = document.getElementById('thumbDown');
const upCount   = document.getElementById('upCount');
const downCount = document.getElementById('downCount');

let isPlaying      = false;
let hlsReady       = false;
let isPreviewMode  = false;
let currentVideoUrl = null;
let upVotes   = 0;
let downVotes = 0;
let userVote  = null; // 'up' | 'down' | null

// ── HLS INIT ──
(function initHls() {
  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    hls = new Hls({ enableWorker: true });
    hls.loadSource(STREAM);
    hls.attachMedia(audio);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      hlsReady = true;
      setStatus('Stream ready — lossless HLS locked');
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setStatus('Stream error — retrying...');
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = STREAM;
    hlsReady  = true;
    setStatus('Stream ready — lossless HLS locked');
  } else {
    setStatus('HLS not supported in this browser');
  }
})();

// ── PLAY / PAUSE ──
playBtn.addEventListener('click', () => {
  if (!hlsReady && !isPreviewMode) { setStatus('Buffering stream...'); return; }
  if (isPlaying) {
    audio.pause();
    setPlayState(false);
  } else {
    audio.play()
      .then(() => setPlayState(true))
      .catch(() => setStatus('Playback blocked — try again'));
  }
});

function setPlayState(playing) {
  isPlaying = playing;
  if (playing) {
    playBtn.innerHTML = '&#9646;&#9646;';
    playBtn.classList.replace('state-play', 'state-pause');
    record.classList.add('spinning');
    waveform.classList.add('playing');
    setStatus(isPreviewMode ? 'Playing preview &bull; iTunes' : 'Live &bull; CD quality stream');
  } else {
    playBtn.innerHTML = '&#9654;';
    playBtn.classList.replace('state-pause', 'state-play');
    record.classList.remove('spinning');
    waveform.classList.remove('playing');
    setStatus('Paused');
  }
}

// ── VOLUME ──
function syncVolume() {
  const v   = parseFloat(volSlider.value);
  const pct = Math.round(v * 100);
  audio.volume = v;
  volPct.textContent = pct + '%';

  volSlider.style.background =
    `linear-gradient(90deg, #00b8c8 ${pct}%, #162028 ${pct}%)`;

  if (pct === 0) {
    speakerEl.textContent = '🔇';
    speakerEl.classList.add('dim');
  } else if (pct < 35) {
    speakerEl.textContent = '🔉';
    speakerEl.classList.add('dim');
  } else {
    speakerEl.textContent = '🔊';
    speakerEl.classList.remove('dim');
  }
}

volSlider.addEventListener('input', () => {
  audio.muted = false;
  syncVolume();
});
speakerEl.addEventListener('click', () => {
  audio.muted = !audio.muted;
  if (audio.muted) {
    speakerEl.textContent = '🔇';
    speakerEl.classList.add('dim');
  } else {
    syncVolume();
  }
});
syncVolume();

// ── RATING ──
thumbUp.addEventListener('click', () => {
  if (userVote === 'up') {
    upVotes--;
    userVote = null;
    thumbUp.classList.remove('voted-up');
  } else {
    if (userVote === 'down') {
      downVotes = Math.max(0, downVotes - 1);
      thumbDown.classList.remove('voted-down');
    }
    upVotes++;
    userVote = 'up';
    thumbUp.classList.add('voted-up');
  }
  renderVotes();
});

thumbDown.addEventListener('click', () => {
  if (userVote === 'down') {
    downVotes--;
    userVote = null;
    thumbDown.classList.remove('voted-down');
  } else {
    if (userVote === 'up') {
      upVotes = Math.max(0, upVotes - 1);
      thumbUp.classList.remove('voted-up');
    }
    downVotes++;
    userVote = 'down';
    thumbDown.classList.add('voted-down');
  }
  renderVotes();
});

function renderVotes() {
  upCount.textContent   = upVotes;
  downCount.textContent = downVotes;
  upCount.classList.toggle('show',   upVotes   > 0);
  downCount.classList.toggle('show', downVotes > 0);
}

function setStatus(msg) { statusEl.innerHTML = msg; }

audio.addEventListener('ended', () => {
  if (isPreviewMode) { setPlayState(false); setStatus('Preview ended'); }
});

// ── BILLBOARD YEAR-END TOP 100 DATA (1990s) ──
const BILLBOARD = {
  1990: [
    { pos:  1, artist:'Wilson Phillips', song:'Hold On', riaa:'Gold' },
    { pos:  2, artist:'Roxette', song:'It Must Have Been Love', riaa:'Gold' },
    { pos:  3, artist:'Sinead OConnor', song:'Nothing Compares 2 U', riaa:'Platinum' },
    { pos:  4, artist:'Bell Biv Devoe', song:'Poison', riaa:'Platinum' },
    { pos:  5, artist:'Madonna', song:'Vogue', riaa:'3× Platinum' },
    { pos:  6, artist:'Mariah Carey', song:'Vision Of Love', riaa:'Platinum' },
    { pos:  7, artist:'Phil Collins', song:'Another Day In Paradise', riaa:'Gold' },
    { pos:  8, artist:'En Vogue', song:'Hold On', riaa:'Platinum' },
    { pos:  9, artist:'Billy Idol', song:'Cradle Of Love', riaa:'Gold' },
    { pos: 10, artist:'Jon Bon Jovi', song:'Blaze Of Glory', riaa:'Platinum' },
    { pos: 11, artist:'Bell Biv Devoe', song:'Do Me!', riaa:'Platinum' },
    { pos: 12, artist:'Michael Bolton', song:'How Am I Supposed To Live Without You', riaa:'—' },
    { pos: 13, artist:'Technotronic', song:'Pump Up The Jam', riaa:'Platinum' },
    { pos: 14, artist:'Paula Abdul', song:'Opposites Attract', riaa:'Gold' },
    { pos: 15, artist:'Janet Jackson', song:'Escapade', riaa:'Platinum' },
    { pos: 16, artist:'Heart', song:'All I Wanna Do Is Make Love To You', riaa:'Gold' },
    { pos: 17, artist:'Maxi Priest', song:'Close To You', riaa:'Gold' },
    { pos: 18, artist:'Alannah Myles', song:'Black Velvet', riaa:'Gold' },
    { pos: 19, artist:'Wilson Phillips', song:'Release Me', riaa:'Gold' },
    { pos: 20, artist:'Linda Ronstadt and Aaron Neville', song:'Dont Know Much', riaa:'Gold' },
    { pos: 21, artist:'Lisa Stansfield', song:'All Around The World', riaa:'Platinum' },
    { pos: 22, artist:'Calloway', song:'I Wanna Be Rich', riaa:'Gold' },
    { pos: 23, artist:'Johnny Gill', song:'Rub You The Right Way', riaa:'Gold' },
    { pos: 24, artist:'Glenn Medeiros feat. Bobby Brown', song:'She Aint Worth It', riaa:'Gold' },
    { pos: 25, artist:'Sweet Sensation', song:'If Wishes Came True', riaa:'—' },
    { pos: 26, artist:'Snap', song:'The Power', riaa:'Platinum' },
    { pos: 27, artist:'Nelson', song:'(Cant Live Without Your) Love And Affection', riaa:'Gold' },
    { pos: 28, artist:'Taylor Dayne', song:'Love Will Lead You Back', riaa:'Gold' },
    { pos: 29, artist:'Jane Child', song:'Dont Wanna Fall In Love', riaa:'Gold' },
    { pos: 30, artist:'Seduction', song:'Two To Make It Right', riaa:'Gold' },
    { pos: 31, artist:'Linear', song:'Sending All My Love', riaa:'Gold' },
    { pos: 32, artist:'Poison', song:'Unskinny Bop', riaa:'Gold' },
    { pos: 33, artist:'New Kids On The Block', song:'Step By Step', riaa:'Platinum' },
    { pos: 34, artist:'Roxette', song:'Dangerous', riaa:'—' },
    { pos: 35, artist:'Billy Joel', song:'We Didnt Start The Fire', riaa:'Multi-Platinum' },
    { pos: 36, artist:'James Ingram', song:'I Dont Have The Heart', riaa:'—' },
    { pos: 37, artist:'Rod Stewart', song:'Downtown Train', riaa:'—' },
    { pos: 38, artist:'Janet Jackson', song:'Rhythm Nation', riaa:'Platinum' },
    { pos: 39, artist:'Tommy Page', song:'Ill Be Your Everything', riaa:'Gold' },
    { pos: 40, artist:'B-52s', song:'Roam', riaa:'Gold' },
    { pos: 41, artist:'Jody Watley', song:'Everything', riaa:'—' },
    { pos: 42, artist:'Soul II Soul', song:'Back To Life', riaa:'Platinum' },
    { pos: 43, artist:'Luther Vandross', song:'Here And Now', riaa:'Platinum' },
    { pos: 44, artist:'Janet Jackson', song:'Alright', riaa:'Gold' },
    { pos: 45, artist:'Vanilla Ice', song:'Ice Ice Baby', riaa:'Platinum' },
    { pos: 46, artist:'Milli Vanilli', song:'Blame It On The Rain', riaa:'Platinum' },
    { pos: 47, artist:'M.C. Hammer', song:'Have You Seen Her', riaa:'Gold' },
    { pos: 48, artist:'Taylor Dayne', song:'With Every Beat Of My Heart', riaa:'—' },
    { pos: 49, artist:'Janet Jackson', song:'Come Back To Me', riaa:'—' },
    { pos: 50, artist:'Michelle', song:'No More Lies', riaa:'Gold' },
    { pos: 51, artist:'George Michael', song:'Praying For Time', riaa:'—' },
    { pos: 52, artist:'Michael Bolton', song:'How Can We Be Lovers', riaa:'—' },
    { pos: 53, artist:'Phil Collins', song:'Do You Remember', riaa:'—' },
    { pos: 54, artist:'After 7', song:'Ready Or Not', riaa:'Gold' },
    { pos: 55, artist:'M.C. Hammer', song:'U Cant Touch This', riaa:'Gold' },
    { pos: 56, artist:'Phil Collins', song:'I Wish It Would Rain Down', riaa:'—' },
    { pos: 57, artist:'Lou Gramm', song:'Just Between You And Me', riaa:'—' },
    { pos: 58, artist:'Phil Collins', song:'Something Happened On The Way To Heaven', riaa:'—' },
    { pos: 59, artist:'Janet Jackson', song:'Black Cat', riaa:'Gold' },
    { pos: 60, artist:'After 7', song:'Cant Stop', riaa:'Gold' },
    { pos: 61, artist:'Aerosmith', song:'Janies Got A Gun', riaa:'—' },
    { pos: 62, artist:'Digital Underground', song:'The Humpty Dance', riaa:'Platinum' },
    { pos: 63, artist:'Taylor Dayne', song:'Ill Be Your Shelter', riaa:'—' },
    { pos: 64, artist:'Tom Petty', song:'Free Fallin', riaa:'—' },
    { pos: 65, artist:'Pebbles', song:'Giving You The Benefit', riaa:'—' },
    { pos: 66, artist:'Depeche Mode', song:'Enjoy The Silence', riaa:'3× Platinum' },
    { pos: 67, artist:'Tesla', song:'Love Song', riaa:'Gold' },
    { pos: 68, artist:'Bad English', song:'Price Of Love', riaa:'—' },
    { pos: 69, artist:'Tyler Collins', song:'Girls Nite Out', riaa:'—' },
    { pos: 70, artist:'Go West', song:'King Of Wishful Thinking', riaa:'—' },
    { pos: 71, artist:'Chicago', song:'What Kind Of Man Would I Be?', riaa:'—' },
    { pos: 72, artist:'Skid Row', song:'I Remember You', riaa:'—' },
    { pos: 73, artist:'Technotronic', song:'Get Up! (Before The Night Is Over)', riaa:'Gold' },
    { pos: 74, artist:'Gloria Estefan', song:'Here We Are', riaa:'—' },
    { pos: 75, artist:'Faith No More', song:'Epic', riaa:'Gold' },
    { pos: 76, artist:'Mariah Carey', song:'Love Takes Time', riaa:'Platinum' },
    { pos: 77, artist:'Cher', song:'Just Like Jesse James', riaa:'Gold' },
    { pos: 78, artist:'B-52s', song:'Love Shack', riaa:'Gold' },
    { pos: 79, artist:'Milli Vanilli', song:'All Or Nothing', riaa:'—' },
    { pos: 80, artist:'Dino', song:'Romeo', riaa:'—' },
    { pos: 81, artist:'Black Box', song:'Everybody Everybody', riaa:'—' },
    { pos: 82, artist:'Billy Joel', song:'I Go To Extremes', riaa:'—' },
    { pos: 83, artist:'Babyface', song:'Whip Appeal', riaa:'—' },
    { pos: 84, artist:'Paul Young', song:'Oh Girl', riaa:'—' },
    { pos: 85, artist:'D-Mob With Cathy Dennis', song:'Cmon And Get My Love', riaa:'—' },
    { pos: 86, artist:'Paula Abdul', song:'(Its Just) The Way That You Love Me', riaa:'—' },
    { pos: 87, artist:'The Cover Girls', song:'We Cant Go Wrong', riaa:'—' },
    { pos: 88, artist:'Michael Bolton', song:'When Im Back On My Feet Again', riaa:'—' },
    { pos: 89, artist:'Keith Sweat', song:'Make You Sweat', riaa:'Gold' },
    { pos: 90, artist:'New Kids On The Block', song:'This Ones For The Children', riaa:'Gold' },
    { pos: 91, artist:'Aerosmith', song:'What It Takes', riaa:'—' },
    { pos: 92, artist:'Kiss', song:'Forever', riaa:'—' },
    { pos: 93, artist:'The Time', song:'Jerk Out', riaa:'Gold' },
    { pos: 94, artist:'Biz Markie', song:'Just A Friend', riaa:'Platinum' },
    { pos: 95, artist:'Ame Lorain', song:'Whole Wide World', riaa:'—' },
    { pos: 96, artist:'Motley Crue', song:'Without You', riaa:'—' },
    { pos: 97, artist:'Jive Bunny and The Master Mixers', song:'Swing The Mood', riaa:'Gold' },
    { pos: 98, artist:'Prince', song:'Thieves In The Temple', riaa:'Gold' },
    { pos: 99, artist:'Mellow Man Ace', song:'Mentirosa', riaa:'Gold' },
    { pos:100, artist:'Kyper', song:'Tic-Tac-Toe', riaa:'Gold' }
  ],
  1991: [
    { pos:  1, artist:'Bryan Adams', song:'(Everything I Do) I Do It For You', riaa:'3× Platinum' },
    { pos:  2, artist:'Color Me Badd', song:'I Wanna Sex You Up', riaa:'2× Platinum' },
    { pos:  3, artist:'C+C Music Factory', song:'Gonna Make You Sweat', riaa:'Multi-Platinum' },
    { pos:  4, artist:'Paula Abdul', song:'Rush Rush', riaa:'Platinum' },
    { pos:  5, artist:'Timmy T', song:'One More Try', riaa:'Platinum' },
    { pos:  6, artist:'EMF', song:'Unbelievable', riaa:'Gold' },
    { pos:  7, artist:'Extreme', song:'More Than Words', riaa:'Gold' },
    { pos:  8, artist:'Hi-Five', song:'I Like The Way (The Kissing Game)', riaa:'Gold' },
    { pos:  9, artist:'Surface', song:'The First Time', riaa:'Gold' },
    { pos: 10, artist:'Amy Grant', song:'Baby, Baby', riaa:'—' },
    { pos: 11, artist:'Boyz II Men', song:'Motownphilly', riaa:'Platinum' },
    { pos: 12, artist:'Stevie B', song:'Because I Love You (The Postman Song)', riaa:'Gold' },
    { pos: 13, artist:'Mariah Carey', song:'Someday', riaa:'Gold' },
    { pos: 14, artist:'Damn Yankees', song:'High Enough', riaa:'Gold' },
    { pos: 15, artist:'Bette Midler', song:'From A Distance', riaa:'Platinum' },
    { pos: 16, artist:'Whitney Houston', song:'All The Man That I Need', riaa:'Platinum' },
    { pos: 17, artist:'Jesus Jones', song:'Right Here, Right Now', riaa:'—' },
    { pos: 18, artist:'Color Me Badd', song:'I Adore Mi Amor', riaa:'Gold' },
    { pos: 19, artist:'Janet Jackson', song:'Love Will Never Do (Without You)', riaa:'Gold' },
    { pos: 20, artist:'Marky Mark and The Funky Bunch feat. Loleatta Holloway', song:'Good Vibrations', riaa:'Gold' },
    { pos: 21, artist:'Madonna', song:'Justify My Love', riaa:'Platinum' },
    { pos: 22, artist:'Mariah Carey', song:'Emotions', riaa:'Platinum' },
    { pos: 23, artist:'Roxette', song:'Joyride', riaa:'—' },
    { pos: 24, artist:'Karyn White', song:'Romantic', riaa:'—' },
    { pos: 25, artist:'Tara Kemp', song:'Hold You Tight', riaa:'Gold' },
    { pos: 26, artist:'Mariah Carey', song:'I Dont Wanna Cry', riaa:'—' },
    { pos: 27, artist:'Wilson Phillips', song:'Youre In Love', riaa:'—' },
    { pos: 28, artist:'Amy Grant', song:'Every Heartbeat', riaa:'—' },
    { pos: 29, artist:'Ralph Tresvant', song:'Sensitivity', riaa:'Gold' },
    { pos: 30, artist:'Cathy Dennis', song:'Touch Me (All Night Long)', riaa:'—' },
    { pos: 31, artist:'Londonbeat', song:'Ive Been Thinking About You', riaa:'Gold' },
    { pos: 32, artist:'Natural Selection', song:'Do Anything', riaa:'—' },
    { pos: 33, artist:'R.E.M.', song:'Losing My Religion', riaa:'Platinum' },
    { pos: 34, artist:'Gloria Estefan', song:'Coming Out Of The Dark', riaa:'—' },
    { pos: 35, artist:'Lenny Kravitz', song:'It Aint Over Til Its Over', riaa:'—' },
    { pos: 36, artist:'C+C Music Factory', song:'Here We Go', riaa:'Gold' },
    { pos: 37, artist:'Celine Dion', song:'Where Does My Heart Beat Now', riaa:'—' },
    { pos: 38, artist:'D.J. Jazzy Jeff and The Fresh Prince', song:'Summertime', riaa:'Platinum' },
    { pos: 39, artist:'Scorpions', song:'Wind Of Change', riaa:'Gold' },
    { pos: 40, artist:'Rhythm Syndicate', song:'P.A.S.S.I.O.N.', riaa:'—' },
    { pos: 41, artist:'Paula Abdul', song:'The Promise Of A New Day', riaa:'—' },
    { pos: 42, artist:'Whitney Houston', song:'Im Your Baby Tonight', riaa:'Gold' },
    { pos: 43, artist:'Firehouse', song:'Love Of A Lifetime', riaa:'Gold' },
    { pos: 44, artist:'Roxette', song:'Fading Like A Flower (Every Time You Leave)', riaa:'—' },
    { pos: 45, artist:'Tracie Spencer', song:'This House', riaa:'—' },
    { pos: 46, artist:'Extreme', song:'Hole Hearted', riaa:'—' },
    { pos: 47, artist:'Luther Vandross', song:'Power Of Love-Love Power', riaa:'—' },
    { pos: 48, artist:'Wilson Phillips', song:'Impulsive', riaa:'—' },
    { pos: 49, artist:'Michael Bolton', song:'Love Is A Wonderful Thing', riaa:'—' },
    { pos: 50, artist:'Rod Stewart', song:'Rhythm Of My Heart', riaa:'—' },
    { pos: 51, artist:'C+C Music Factory', song:'Things That Make You Go Hmmmm', riaa:'Gold' },
    { pos: 52, artist:'Divinyls', song:'I Touch Myself', riaa:'—' },
    { pos: 53, artist:'DMA', song:'Toms Diner', riaa:'—' },
    { pos: 54, artist:'Another Bad Creation', song:'Iesha', riaa:'Gold' },
    { pos: 55, artist:'Bonnie Raitt', song:'Something To Talk About', riaa:'—' },
    { pos: 56, artist:'Nelson', song:'After The Rain', riaa:'—' },
    { pos: 57, artist:'Vanilla Ice', song:'Play That Funky Music', riaa:'Gold' },
    { pos: 58, artist:'Corina', song:'Temptation', riaa:'—' },
    { pos: 59, artist:'Bryan Adams', song:'Cant Stop This Thing We Started', riaa:'Gold' },
    { pos: 60, artist:'Hi-Five', song:'I Cant Wait Another Minute', riaa:'—' },
    { pos: 61, artist:'The KLF', song:'3 A.M. Eternal', riaa:'Gold' },
    { pos: 62, artist:'Michael Bolton', song:'Time. Love And Tenderness', riaa:'—' },
    { pos: 63, artist:'Enigma', song:'Sadeness Part I', riaa:'Gold' },
    { pos: 64, artist:'LL Cool J', song:'Around The Way Girl', riaa:'Gold' },
    { pos: 65, artist:'Escape Club', song:'Ill Be There', riaa:'Gold' },
    { pos: 66, artist:'Prince And The N.P.G.', song:'Cream', riaa:'Gold' },
    { pos: 67, artist:'Heavy D. and The Boyz', song:'Now That We Found Love', riaa:'Gold' },
    { pos: 68, artist:'Styx', song:'Show Me The Way', riaa:'—' },
    { pos: 69, artist:'Mariah Carey', song:'Love Takes Time', riaa:'Platinum' },
    { pos: 70, artist:'Rick Astley', song:'Cry For Help', riaa:'—' },
    { pos: 71, artist:'UB40', song:'The Way You Do The Things You Do', riaa:'Gold' },
    { pos: 72, artist:'UB40', song:'Here I Am (Come And Take Me)', riaa:'—' },
    { pos: 73, artist:'Tesla', song:'Signs', riaa:'—' },
    { pos: 74, artist:'Cathy Dennis', song:'Too Many Walls', riaa:'—' },
    { pos: 75, artist:'Seal', song:'Crazy', riaa:'—' },
    { pos: 76, artist:'Keith Sweat', song:'Ill Give All My Love To You', riaa:'—' },
    { pos: 77, artist:'Michael W. Smith', song:'Place In This World', riaa:'—' },
    { pos: 78, artist:'Poison', song:'Something To Believe In', riaa:'Gold' },
    { pos: 79, artist:'Chris Issak', song:'Wicked Game', riaa:'Gold' },
    { pos: 80, artist:'Oleta Adams', song:'Get Here', riaa:'—' },
    { pos: 81, artist:'Tevin Campbell', song:'Round And Round', riaa:'Gold' },
    { pos: 82, artist:'Queensryche', song:'Silent Lucidity', riaa:'—' },
    { pos: 83, artist:'Will To Power', song:'Im Not In Love', riaa:'—' },
    { pos: 84, artist:'Tara Kemp', song:'Piece Of My Heart', riaa:'—' },
    { pos: 85, artist:'Jesus Jones', song:'Real Real Real', riaa:'—' },
    { pos: 86, artist:'Cathy Dennis', song:'Just Another Dream', riaa:'—' },
    { pos: 87, artist:'Aaron Neville', song:'Everybody Plays The Fool', riaa:'—' },
    { pos: 88, artist:'Black Box', song:'Strike It Up', riaa:'—' },
    { pos: 89, artist:'Gerardo', song:'Rico Suave', riaa:'Gold' },
    { pos: 90, artist:'INXS', song:'Disappear', riaa:'—' },
    { pos: 91, artist:'Deee-Lite', song:'Groove Is In The Heart', riaa:'Gold' },
    { pos: 92, artist:'Sting', song:'All This Time', riaa:'—' },
    { pos: 93, artist:'Chesney Hawkes', song:'The One And Only', riaa:'—' },
    { pos: 94, artist:'Naughty By Nature', song:'O.P.P.', riaa:'2× Platinum' },
    { pos: 95, artist:'George Michael', song:'Freedom 90', riaa:'Gold' },
    { pos: 96, artist:'Warrent', song:'I Saw Red', riaa:'—' },
    { pos: 97, artist:'Winger', song:'Miles Away', riaa:'—' },
    { pos: 98, artist:'Salt-N-Pepa', song:'Do You Want Me', riaa:'Gold' },
    { pos: 99, artist:'Rod Stewart', song:'The Motown Song', riaa:'—' },
    { pos:100, artist:'R.E.M.', song:'Shiny Happy People', riaa:'—' }
  ],
  1992: [
    { pos:  1, artist:'Boyz II Men', song:'End Of The Road', riaa:'4× Platinum' },
    { pos:  2, artist:'Sir Mix A-lot', song:'Baby Got Back', riaa:'2× Platinum' },
    { pos:  3, artist:'Kris Kross', song:'Jump', riaa:'2× Platinum' },
    { pos:  4, artist:'Vanessa Williams', song:'Save The Best For Last', riaa:'Gold' },
    { pos:  5, artist:'TLC', song:'Baby-Baby-Baby', riaa:'Platinum' },
    { pos:  6, artist:'Eric Clapton', song:'Tears In Heaven', riaa:'Platinum' },
    { pos:  7, artist:'En Vogue', song:'My Lovin (Youre Never Gonna Get It)', riaa:'Gold' },
    { pos:  8, artist:'Red Hot Chili Peppers', song:'Under The Bridge', riaa:'6× Platinum' },
    { pos:  9, artist:'Color Me Badd', song:'All 4 Love', riaa:'Gold' },
    { pos: 10, artist:'Jon Secada', song:'Just Another Day', riaa:'Gold' },
    { pos: 11, artist:'Shanice', song:'I Love Your Smile', riaa:'—' },
    { pos: 12, artist:'Mr. Big', song:'To Be With You', riaa:'Gold' },
    { pos: 13, artist:'Right Said Fred', song:'Im Too Sexy', riaa:'Platinum' },
    { pos: 14, artist:'Michael Jackson', song:'Black Or White', riaa:'3× Platinum' },
    { pos: 15, artist:'Billy Ray Cyrus', song:'Achy Breaky Heart', riaa:'Platinum' },
    { pos: 16, artist:'Mariah Carey', song:'Ill Be There', riaa:'—' },
    { pos: 17, artist:'Guns N Roses', song:'November Rain', riaa:'Gold' },
    { pos: 18, artist:'Tom Cochrane', song:'Life Is A Highway', riaa:'Gold' },
    { pos: 19, artist:'Michael Jackson', song:'Remember The Time', riaa:'3× Platinum' },
    { pos: 20, artist:'CeCe Peniston', song:'Finally', riaa:'Gold' },
    { pos: 21, artist:'Madonna', song:'This Used To Be My Playground', riaa:'Gold' },
    { pos: 22, artist:'Patty Smyth', song:'Sometimes Love Just Aint Enough', riaa:'Gold' },
    { pos: 23, artist:'Mariah Carey', song:'Cant Let Go', riaa:'—' },
    { pos: 24, artist:'House Of Pain', song:'Jump Around', riaa:'Platinum' },
    { pos: 25, artist:'Prince and The N.P.G.', song:'Diamonds And Pearls', riaa:'—' },
    { pos: 26, artist:'George Michael and Elton John', song:'Dont Let The Sun Go Down On Me', riaa:'Gold' },
    { pos: 27, artist:'Atlantic Starr', song:'Masterpiece', riaa:'Gold' },
    { pos: 28, artist:'Celine Dion', song:'If You Asked Me To', riaa:'—' },
    { pos: 29, artist:'En Vogue', song:'Giving Him Something He Can Feel', riaa:'Gold' },
    { pos: 30, artist:'Joe Public', song:'Live And Learn', riaa:'—' },
    { pos: 31, artist:'Jodeci', song:'Come & Talk To Me', riaa:'Gold' },
    { pos: 32, artist:'Nirvana', song:'Smells Like Teen Spirit', riaa:'Diamond' },
    { pos: 33, artist:'Bobby Brown', song:'Humpin Around', riaa:'Gold' },
    { pos: 34, artist:'Sophie B. Hawkins', song:'Damn I Wish I Was Your Lover', riaa:'—' },
    { pos: 35, artist:'Teven Campbell', song:'Tell Me What You Want Me To Do', riaa:'Gold' },
    { pos: 36, artist:'TLC', song:'Aint 2 Proud 2 Beg', riaa:'Platinum' },
    { pos: 37, artist:'Boyz II Men', song:'Its So Hard To Say Goodbye To Yesterday', riaa:'Gold' },
    { pos: 38, artist:'Technotronic', song:'Move This', riaa:'—' },
    { pos: 39, artist:'Queen', song:'Bohemian Rhapsody', riaa:'Diamond' },
    { pos: 40, artist:'Arrested Development', song:'Tennessee', riaa:'Gold' },
    { pos: 41, artist:'Luther Vandross and Janet Jackson', song:'The Best Things In Life Are Free', riaa:'—' },
    { pos: 42, artist:'Mariah Carey', song:'Make It Happen', riaa:'—' },
    { pos: 43, artist:'Elton John', song:'The One', riaa:'—' },
    { pos: 44, artist:'P.M. Dawn', song:'Set Adrift On Memory Bliss', riaa:'Gold' },
    { pos: 45, artist:'Shakespears Sister', song:'Stay', riaa:'Gold' },
    { pos: 46, artist:'Hammer', song:'2 Legit 2 Quit', riaa:'Platinum' },
    { pos: 47, artist:'K.W.S.', song:'Please Dont Go', riaa:'Gold' },
    { pos: 48, artist:'Mint Condition', song:'Breakin My Heart (Pretty Brown Eyes)', riaa:'Gold' },
    { pos: 49, artist:'Cover Girls', song:'Wishing On A Star', riaa:'—' },
    { pos: 50, artist:'Hi-Five', song:'Shes Playing Hard To Get', riaa:'—' },
    { pos: 51, artist:'P.M. Dawn', song:'Id Die Without You', riaa:'Gold' },
    { pos: 52, artist:'Amy Grant', song:'Good For Me', riaa:'—' },
    { pos: 53, artist:'Toad The Wet Sprocket', song:'All I Want', riaa:'—' },
    { pos: 54, artist:'Michael Bolton', song:'When A Man Loves A Woman', riaa:'—' },
    { pos: 55, artist:'Genesis', song:'I Cant Dance', riaa:'—' },
    { pos: 56, artist:'Richard Marx', song:'Hazard', riaa:'—' },
    { pos: 57, artist:'U2', song:'Mysterious Ways', riaa:'—' },
    { pos: 58, artist:'George Michael', song:'Too Funky', riaa:'Gold' },
    { pos: 59, artist:'Heights', song:'How Do You Talk To An Angel', riaa:'Gold' },
    { pos: 60, artist:'U2', song:'One', riaa:'—' },
    { pos: 61, artist:'CeCe Peniston', song:'Keep On Walkin', riaa:'—' },
    { pos: 62, artist:'Genesis', song:'Hold On My Heart', riaa:'—' },
    { pos: 63, artist:'Karyn White', song:'The Way I Feel About You', riaa:'—' },
    { pos: 64, artist:'Celine Dion And Peabo Bryson', song:'Beauty And The Beast', riaa:'Gold' },
    { pos: 65, artist:'Kris Kross', song:'Warm It Up', riaa:'Gold' },
    { pos: 66, artist:'Michael Jackson', song:'In The Closet', riaa:'Gold' },
    { pos: 67, artist:'Arrested Development', song:'People Everyday', riaa:'Gold' },
    { pos: 68, artist:'Genesis', song:'No Son Of Nine', riaa:'—' },
    { pos: 69, artist:'Marky Mark And The Funky Bunch', song:'Wildside', riaa:'Gold' },
    { pos: 70, artist:'Bryan Adams', song:'Do I Have To Say The Words?', riaa:'—' },
    { pos: 71, artist:'Cure', song:'Friday Im In Love', riaa:'—' },
    { pos: 72, artist:'Ugly Kid Joe', song:'Everything About You', riaa:'—' },
    { pos: 73, artist:'Paula Abdul', song:'Blowing Kisses In The Wind', riaa:'—' },
    { pos: 74, artist:'Bryan Adams', song:'Thought Id Died And Gone To Heaven', riaa:'—' },
    { pos: 75, artist:'Snap', song:'Rhythm Is A Dancer', riaa:'Gold' },
    { pos: 76, artist:'Hammer', song:'Addams Groove', riaa:'Gold' },
    { pos: 77, artist:'Michael Bolton', song:'Missing You Now', riaa:'—' },
    { pos: 78, artist:'N2Deep', song:'Back To The Hotel', riaa:'Platinum' },
    { pos: 79, artist:'Kathy Troccoli', song:'Everything Changes', riaa:'—' },
    { pos: 80, artist:'Def Leppard', song:'Have You Ever Needed Somone So Bad', riaa:'—' },
    { pos: 81, artist:'Richard Marx', song:'Take This Heart', riaa:'—' },
    { pos: 82, artist:'Firehouse', song:'When I Look Into Your Eyes', riaa:'—' },
    { pos: 83, artist:'Jade', song:'I Wanna Love You', riaa:'—' },
    { pos: 84, artist:'Boyz II Men', song:'Uhh Ahh', riaa:'—' },
    { pos: 85, artist:'Mary J. Blige', song:'Real Love', riaa:'Gold' },
    { pos: 86, artist:'The KLF', song:'Justified And Ancient', riaa:'—' },
    { pos: 87, artist:'Color Me Badd', song:'Slow Motion', riaa:'—' },
    { pos: 88, artist:'TLC', song:'What About Your Friends', riaa:'Gold' },
    { pos: 89, artist:'Color Me Badd', song:'Thinkin Back', riaa:'—' },
    { pos: 90, artist:'Charles and Eddie', song:'Would I Lie To You?', riaa:'—' },
    { pos: 91, artist:'Amy Grant', song:'Thats What Love Is For', riaa:'—' },
    { pos: 92, artist:'Richard Marx', song:'Keep Coming Back', riaa:'—' },
    { pos: 93, artist:'En Vogue', song:'Free Your Mind', riaa:'Gold' },
    { pos: 94, artist:'Keith Sweat', song:'Keep It Comin', riaa:'—' },
    { pos: 95, artist:'Mr. Big', song:'Just Take My Heart', riaa:'—' },
    { pos: 96, artist:'Amy Grant', song:'I Will Remember You', riaa:'—' },
    { pos: 97, artist:'CeCe Peniston', song:'We Got A Love Thang', riaa:'—' },
    { pos: 98, artist:'Def Leppard', song:'Lets Get Rocked', riaa:'—' },
    { pos: 99, artist:'Das EFX', song:'They Want EFX', riaa:'Gold' },
    { pos:100, artist:'Bonnie Raitt', song:'I Cant Make You Love Me', riaa:'—' }
  ],
  1993: [
    { pos:  1, artist:'Whitney Houston', song:'I Will Always Love You', riaa:'11× Platinum' },
    { pos:  2, artist:'Tag Team', song:'Whoomp! (There It Is)', riaa:'4× Platinum' },
    { pos:  3, artist:'UB40', song:'Cant Help Falling In Love', riaa:'Platinum' },
    { pos:  4, artist:'Janet Jackson', song:'Thats The Way Love Goes', riaa:'Platinum' },
    { pos:  5, artist:'Silk', song:'Freak Me', riaa:'Platinum' },
    { pos:  6, artist:'SWV', song:'Weak', riaa:'3× Platinum' },
    { pos:  7, artist:'Shai', song:'If I Ever Fall In Love', riaa:'Platinum' },
    { pos:  8, artist:'Mariah Carey', song:'Dreamlover', riaa:'Platinum' },
    { pos:  9, artist:'Wreckx-N-Effect', song:'Rump Shaker', riaa:'Multi-Platinum' },
    { pos: 10, artist:'Snow', song:'Informer', riaa:'Platinum' },
    { pos: 11, artist:'Dr. Dre', song:'Nuthin But A G Thang', riaa:'Platinum' },
    { pos: 12, artist:'Boyz II Men', song:'In The Still Of The Nite', riaa:'Platinum' },
    { pos: 13, artist:'Jade', song:'Dont Walk Away', riaa:'Gold' },
    { pos: 14, artist:'H-Town', song:'Knockin Da Boots', riaa:'Platinum' },
    { pos: 15, artist:'Jodeci', song:'Lately', riaa:'Gold' },
    { pos: 16, artist:'Duice', song:'Dazzey Duks', riaa:'2× Platinum' },
    { pos: 17, artist:'Robin S.', song:'Show Me Love', riaa:'Gold' },
    { pos: 18, artist:'Peabo Bryson and Regina Belle', song:'A Whole New World', riaa:'Gold' },
    { pos: 19, artist:'Janet Jackson', song:'If', riaa:'Platinum' },
    { pos: 20, artist:'SWV', song:'Im So Into You', riaa:'Gold' },
    { pos: 21, artist:'Vanessa Willlams and Brian Mcknight', song:'Love Is', riaa:'—' },
    { pos: 22, artist:'Soul Asylum', song:'Runaway Train', riaa:'2× Platinum' },
    { pos: 23, artist:'Expose', song:'Ill Never Get Over You (Getting Over Me)', riaa:'Gold' },
    { pos: 24, artist:'Paperboy', song:'Ditty', riaa:'Platinum' },
    { pos: 25, artist:'Snap', song:'Rhythm Is A Dancer', riaa:'Gold' },
    { pos: 26, artist:'Billy Joel', song:'The River Of Dreams', riaa:'Platinum' },
    { pos: 27, artist:'Proclaimers', song:'Im Gonna Be (500 Miles)', riaa:'Gold' },
    { pos: 28, artist:'Spin Doctors', song:'Two Princes', riaa:'—' },
    { pos: 29, artist:'SWV', song:'Right Here (Human Nature)-Downtown', riaa:'Gold' },
    { pos: 30, artist:'Whitney Houston', song:'I Have Nothing', riaa:'4× Platinum' },
    { pos: 31, artist:'Arrested Development', song:'Mr. Wendal', riaa:'Gold' },
    { pos: 32, artist:'Rod Stewart', song:'Have I Told You Lately', riaa:'Gold' },
    { pos: 33, artist:'Shanice', song:'Saving Forever For You', riaa:'—' },
    { pos: 34, artist:'Duran Duran', song:'Ordinary World', riaa:'Gold' },
    { pos: 35, artist:'Tony! Toni! Tone!', song:'If I Had No Loot', riaa:'Gold' },
    { pos: 36, artist:'Meat Loaf', song:'Id Do Anything For Love (But I Wont Do That)', riaa:'—' },
    { pos: 37, artist:'Onyx', song:'Slam', riaa:'Platinum' },
    { pos: 38, artist:'P.M. Dawn', song:'Looking Through Patient Eyes', riaa:'—' },
    { pos: 39, artist:'Whitney Houston', song:'Im Every Woman', riaa:'Platinum' },
    { pos: 40, artist:'Shai', song:'Baby Im Yours', riaa:'—' },
    { pos: 41, artist:'Duran Duran', song:'Come Undone', riaa:'—' },
    { pos: 42, artist:'Tina Turner', song:'I Dont Wanna Fight', riaa:'—' },
    { pos: 43, artist:'P.M. Dawn', song:'Id Die Without You', riaa:'—' },
    { pos: 44, artist:'95 South', song:'Whoot, There It Is', riaa:'Platinum' },
    { pos: 45, artist:'Naughty By Nature', song:'Hip Hop Hooray', riaa:'Platinum' },
    { pos: 46, artist:'Toni Braxton', song:'Another Sad Love Song', riaa:'Gold' },
    { pos: 47, artist:'Michael Jackson', song:'Will You Be There', riaa:'Platinum' },
    { pos: 48, artist:'Shil', song:'Comforter', riaa:'—' },
    { pos: 49, artist:'Bobby Brown', song:'Good Enough', riaa:'Gold' },
    { pos: 50, artist:'4 Non Blondes', song:'Whats Up', riaa:'Gold' },
    { pos: 51, artist:'Ace Of Base', song:'All That She Wants', riaa:'Platinum' },
    { pos: 52, artist:'Prince and The New Power Generation', song:'7', riaa:'Gold' },
    { pos: 53, artist:'Dr. Dre', song:'Dre Day', riaa:'Gold' },
    { pos: 54, artist:'Brian McKnight', song:'One Last Cry', riaa:'—' },
    { pos: 55, artist:'Xscape', song:'Just Kickin It', riaa:'—' },
    { pos: 56, artist:'2Pac', song:'I Get Around', riaa:'Platinum' },
    { pos: 57, artist:'Bon Jovi', song:'Bed Of Roses', riaa:'—' },
    { pos: 58, artist:'Mary J. Blige', song:'Real Love', riaa:'Gold' },
    { pos: 59, artist:'Portrait', song:'Here We Go Again!', riaa:'—' },
    { pos: 60, artist:'Aerosmith', song:'Cryin', riaa:'Gold' },
    { pos: 61, artist:'Ugly Kid Joe', song:'Cats In The Cradle', riaa:'Gold' },
    { pos: 62, artist:'TLC', song:'What About Your Friends', riaa:'Gold' },
    { pos: 63, artist:'Positive K', song:'I Got A Man', riaa:'Gold' },
    { pos: 64, artist:'Zhane', song:'Hey Mr. D.J.', riaa:'Gold' },
    { pos: 65, artist:'Cypress Hill', song:'Insane In The Brain', riaa:'3× Platinum' },
    { pos: 66, artist:'Madonna', song:'Deeper And Deeper', riaa:'—' },
    { pos: 67, artist:'Madonna', song:'Rain', riaa:'—' },
    { pos: 68, artist:'Jeremy Jordan', song:'The Right Kind Of Love', riaa:'—' },
    { pos: 69, artist:'Inner Circle', song:'Bad Boys', riaa:'Platinum' },
    { pos: 70, artist:'Boy Krazy', song:'Thats What Love Can Do', riaa:'—' },
    { pos: 71, artist:'Jon Secada', song:'Do You Believe In Us', riaa:'—' },
    { pos: 72, artist:'Jon Secada', song:'Angel', riaa:'—' },
    { pos: 73, artist:'Kenny G', song:'Forever In Love', riaa:'Gold' },
    { pos: 74, artist:'Janet Jackson', song:'Again', riaa:'Platinum' },
    { pos: 75, artist:'Jazzy Jeff and Fresh Prince', song:'Boom! Shake The Room', riaa:'Gold' },
    { pos: 76, artist:'Restless Heart', song:'When She Cries', riaa:'—' },
    { pos: 77, artist:'Inner Circle', song:'Sweat (A La La La La Long)', riaa:'Gold' },
    { pos: 78, artist:'Ice Cube', song:'It Was A Good Day', riaa:'Gold' },
    { pos: 79, artist:'Captain Hollywood Project', song:'More And More', riaa:'—' },
    { pos: 80, artist:'Heights', song:'How Do You Talk To An Angel', riaa:'Gold' },
    { pos: 81, artist:'Digable Planets', song:'Rebirth Of Slick (Cool Like Dat)', riaa:'Gold' },
    { pos: 82, artist:'Haddaway', song:'What Is Love', riaa:'Gold' },
    { pos: 83, artist:'Michael Bolton', song:'To Love Somebody', riaa:'—' },
    { pos: 84, artist:'En Vogue', song:'Give It Up, Turn It Loose', riaa:'Gold' },
    { pos: 85, artist:'Kris Kross', song:'Alright', riaa:'Gold' },
    { pos: 86, artist:'Ice Cube', song:'Check Yo Self', riaa:'Platinum' },
    { pos: 87, artist:'Sting', song:'Fields Of Gold', riaa:'—' },
    { pos: 88, artist:'Dino', song:'Ooh Child', riaa:'—' },
    { pos: 89, artist:'Go West', song:'Faithful', riaa:'—' },
    { pos: 90, artist:'Rod Stewart', song:'Reason To Believe', riaa:'—' },
    { pos: 91, artist:'Tears For Fears', song:'Break It Down Again', riaa:'—' },
    { pos: 92, artist:'Joey Lawrence', song:'Nothin My Love Cant Fix', riaa:'—' },
    { pos: 93, artist:'Green Jelly', song:'Three Little Pigs', riaa:'Gold' },
    { pos: 94, artist:'Aerosmith', song:'Livin On The Edge', riaa:'—' },
    { pos: 95, artist:'Gin Blossoms', song:'Hey Jealousy', riaa:'—' },
    { pos: 96, artist:'Sting', song:'If I Ever Lose My Faith In You', riaa:'—' },
    { pos: 97, artist:'Tony! Toni! Tone!', song:'Anniversary', riaa:'Gold' },
    { pos: 98, artist:'Jade', song:'One Woman', riaa:'—' },
    { pos: 99, artist:'Taylor Dayne', song:'Cant Get Enough Of Your Love', riaa:'—' },
    { pos:100, artist:'Def Leppard', song:'Two Steps Behind', riaa:'—' }
  ],
  1994: [
    { pos:  1, artist:'Ace Of Base', song:'The Sign', riaa:'Platinum' },
    { pos:  2, artist:'All-4-One', song:'I Swear', riaa:'Platinum' },
    { pos:  3, artist:'Boyz II Men', song:'Ill Make Love To You', riaa:'Platinum' },
    { pos:  4, artist:'Celine Dion', song:'The Power Of Love', riaa:'Platinum' },
    { pos:  5, artist:'Mariah Carey', song:'Hero', riaa:'3× Platinum' },
    { pos:  6, artist:'Lisa Loeb and Nine Stories', song:'Stay (I Missed You)', riaa:'Gold' },
    { pos:  7, artist:'Toni Braxton', song:'Breathe Again', riaa:'Gold' },
    { pos:  8, artist:'Bryan Adams, Rod Stewart and Sting', song:'All For Love', riaa:'Platinum' },
    { pos:  9, artist:'Ace Of Base', song:'All That She Wants', riaa:'Platinum' },
    { pos: 10, artist:'Ace Of Base', song:'Dont Turn Around', riaa:'Gold' },
    { pos: 11, artist:'R. Kelly', song:'Bump N Grind', riaa:'Platinum' },
    { pos: 12, artist:'Janet Jackson', song:'Again', riaa:'Platinum' },
    { pos: 13, artist:'Madonna', song:'Ill Remember', riaa:'Gold' },
    { pos: 14, artist:'Salt-N-Pepa', song:'Whatta Man', riaa:'Platinum' },
    { pos: 15, artist:'John Mellencamp and Meshell Ndegeocello', song:'Wild Night', riaa:'—' },
    { pos: 16, artist:'Mariah Carey', song:'Without You / Never Forget You', riaa:'Gold' },
    { pos: 17, artist:'Toni Braxton', song:'You Mean The World To Me', riaa:'Gold' },
    { pos: 18, artist:'Elton John', song:'Can You Feel The Love Tonight', riaa:'Platinum' },
    { pos: 19, artist:'The Artist Formerly Known As Prince', song:'The Most Beautiful Girl In The World', riaa:'Gold' },
    { pos: 20, artist:'Coolio', song:'Fantastic Voyage', riaa:'Platinum' },
    { pos: 21, artist:'Big Mountain', song:'Baby I Love Your Way', riaa:'Gold' },
    { pos: 22, artist:'Warren G and Nate Dogg', song:'Regulate', riaa:'Multi-Platinum' },
    { pos: 23, artist:'Jon Secada', song:'If You Go', riaa:'—' },
    { pos: 24, artist:'Aaliyah', song:'Back & Forth', riaa:'Gold' },
    { pos: 25, artist:'Richard Marx', song:'Now And Forever', riaa:'—' },
    { pos: 26, artist:'Babyface', song:'When Can I See You', riaa:'Gold' },
    { pos: 27, artist:'Bryan Adams', song:'Please Forgive Me', riaa:'—' },
    { pos: 28, artist:'All-4-One', song:'So Much In Love', riaa:'Gold' },
    { pos: 29, artist:'Salt-N-Pepa', song:'Shoop', riaa:'Gold' },
    { pos: 30, artist:'Janet Jackson', song:'Any Time, Any Place / And On And On', riaa:'Gold' },
    { pos: 31, artist:'Collective Soul', song:'Shine', riaa:'Gold' },
    { pos: 32, artist:'Michael Bolton', song:'Said I Loved YouBut I Lied', riaa:'Gold' },
    { pos: 33, artist:'Enigma', song:'Return To Innocence', riaa:'Gold' },
    { pos: 34, artist:'Sheryl Crow', song:'All I Wanna Do', riaa:'Gold' },
    { pos: 35, artist:'Crash Test Dummies', song:'Mmm Mmm Mmm Mmm', riaa:'Gold' },
    { pos: 36, artist:'Tevin Campbell', song:'Can We Talk', riaa:'Gold' },
    { pos: 37, artist:'Da Brat', song:'Funkdafied', riaa:'Platinum' },
    { pos: 38, artist:'Meat Loaf', song:'Id Do Anything For Love (But I Wont Do That)', riaa:'Platinum' },
    { pos: 39, artist:'Drs', song:'Gangsta Lean', riaa:'Platinum' },
    { pos: 40, artist:'10,000 Maniacs', song:'Because The Night', riaa:'—' },
    { pos: 41, artist:'US3', song:'Cantaloop', riaa:'Gold' },
    { pos: 42, artist:'Tag Team', song:'Whoomp! (There It Is)', riaa:'4× Platinum' },
    { pos: 43, artist:'Melissa Etheridge', song:'Come To My Window', riaa:'Gold' },
    { pos: 44, artist:'Changing Faces', song:'Stroke You Up', riaa:'Platinum' },
    { pos: 45, artist:'Tevin Campbell', song:'Im Ready', riaa:'—' },
    { pos: 46, artist:'Crystal Waters', song:'100% Pure Love', riaa:'Gold' },
    { pos: 47, artist:'Mariah Carey', song:'Anytime You Need A Friend', riaa:'Gold' },
    { pos: 48, artist:'Janet Jackson', song:'Because Of Love', riaa:'—' },
    { pos: 49, artist:'Cranberries', song:'Linger', riaa:'Gold' },
    { pos: 50, artist:'Beck', song:'Loser', riaa:'Gold' },
    { pos: 51, artist:'Gin Blossoms', song:'Found Out About You', riaa:'—' },
    { pos: 52, artist:'Snoop Doggy Dogg', song:'Gin And Juice', riaa:'Gold' },
    { pos: 53, artist:'Immature', song:'Never Lie', riaa:'Gold' },
    { pos: 54, artist:'Bruce Springsteen', song:'Streets Of Philadelphia', riaa:'Platinum' },
    { pos: 55, artist:'Domino', song:'Getto Jam', riaa:'Gold' },
    { pos: 56, artist:'Luther Vandross and Mariah Carey', song:'Endless Love', riaa:'Platinum' },
    { pos: 57, artist:'Aaron Hall', song:'I Miss You', riaa:'Gold' },
    { pos: 58, artist:'Xscape', song:'Understanding', riaa:'Platinum' },
    { pos: 59, artist:'Warren G', song:'This D.J.', riaa:'Gold' },
    { pos: 60, artist:'Jodeci', song:'Cry For You', riaa:'Gold' },
    { pos: 61, artist:'2Pac', song:'Keep Ya Head Up', riaa:'Platinum' },
    { pos: 62, artist:'Snoop Doggy Dogg', song:'Who Am I (Whats My Name?)', riaa:'Gold' },
    { pos: 63, artist:'Real McCoy', song:'Another Night', riaa:'Platinum' },
    { pos: 64, artist:'R. Kelly', song:'Your Bodys Callin', riaa:'Gold' },
    { pos: 65, artist:'69 Boyz', song:'Tootsee Roll', riaa:'Platinum' },
    { pos: 66, artist:'Jimmy Cliff', song:'I Can See Clearly Now', riaa:'—' },
    { pos: 67, artist:'Babyface', song:'Never Keeping Secrets', riaa:'—' },
    { pos: 68, artist:'Aerosmith', song:'Crazy', riaa:'—' },
    { pos: 69, artist:'Xscape', song:'Just Kickin It', riaa:'Platinum' },
    { pos: 70, artist:'Aaliyah', song:'At Your Best (You Are Love)', riaa:'Gold' },
    { pos: 71, artist:'Meat Loaf', song:'Rock And Roll Dreams Come Through', riaa:'—' },
    { pos: 72, artist:'Aerosmith', song:'Amazing', riaa:'—' },
    { pos: 73, artist:'Erasure', song:'Always', riaa:'—' },
    { pos: 74, artist:'Zhane', song:'Groove Thang', riaa:'—' },
    { pos: 75, artist:'Gabrielle', song:'Dreams', riaa:'—' },
    { pos: 76, artist:'Culture Beat', song:'Mr. Vain', riaa:'Gold' },
    { pos: 77, artist:'Tom Petty and The Heartbreakers', song:'Mary Janes Last Dance', riaa:'—' },
    { pos: 78, artist:'SWV', song:'Anything', riaa:'—' },
    { pos: 79, artist:'Joshua Kadison', song:'Beautiful In My Eyes', riaa:'—' },
    { pos: 80, artist:'Eternal', song:'Stay', riaa:'—' },
    { pos: 81, artist:'Craig Mack', song:'Flava In Ya Ear', riaa:'Platinum' },
    { pos: 82, artist:'Queen Latifah', song:'U.N.I.T.Y.', riaa:'—' },
    { pos: 83, artist:'Seal', song:'Prayer For The Dying', riaa:'—' },
    { pos: 84, artist:'Madonna', song:'Secret', riaa:'Gold' },
    { pos: 85, artist:'Ini Kamoze', song:'Here Comes The Hotstepper', riaa:'2× Platinum' },
    { pos: 86, artist:'Phil Collins', song:'Everyday', riaa:'—' },
    { pos: 87, artist:'Tim McGraw', song:'Dont Take The Girl', riaa:'Multi-Platinum' },
    { pos: 88, artist:'Heavy D and The Boyz', song:'Got Me Waiting', riaa:'—' },
    { pos: 89, artist:'Four Seasons', song:'December 1963 (Oh, What A Night)', riaa:'—' },
    { pos: 90, artist:'Tim McGraw', song:'Indian Outlaw', riaa:'Platinum' },
    { pos: 91, artist:'Bon Jovi', song:'Always', riaa:'Platinum' },
    { pos: 92, artist:'Melissa Etheridge', song:'Im The Only One', riaa:'—' },
    { pos: 93, artist:'Ahmad', song:'Back In The Day', riaa:'Gold' },
    { pos: 94, artist:'Bonnie Raitt', song:'Love Sneakin Up On You', riaa:'—' },
    { pos: 95, artist:'General Public', song:'Ill Take You There', riaa:'—' },
    { pos: 96, artist:'Tevin Campbell', song:'Always In My Heart', riaa:'—' },
    { pos: 97, artist:'Haddaway', song:'What Is Love', riaa:'Gold' },
    { pos: 98, artist:'Babyface', song:'And Our Feelings', riaa:'—' },
    { pos: 99, artist:'Ice Cube', song:'Bop Gun (One Nation)', riaa:'Gold' },
    { pos:100, artist:'Brandy', song:'I Wanna Be Down', riaa:'Platinum' }
  ],
  1995: [
    { pos:  1, artist:'Coolio', song:'Gangstas Paradise', riaa:'Multi-Platinum' },
    { pos:  2, artist:'TLC', song:'Waterfalls', riaa:'Platinum' },
    { pos:  3, artist:'TLC', song:'Creep', riaa:'Platinum' },
    { pos:  4, artist:'Seal', song:'Kiss From A Rose', riaa:'Gold' },
    { pos:  5, artist:'Boyz II Men', song:'On Bended Knee', riaa:'3× Platinum' },
    { pos:  6, artist:'Real McCoy', song:'Another Night', riaa:'—' },
    { pos:  7, artist:'Mariah Carey', song:'Fantasy', riaa:'6× Platinum' },
    { pos:  8, artist:'Madonna', song:'Take A Bow', riaa:'Gold' },
    { pos:  9, artist:'Monica', song:'Dont Take It Personal (Just One Of Dem Days)', riaa:'Platinum' },
    { pos: 10, artist:'Montell Jordan', song:'This Is How We Do It', riaa:'5× Platinum' },
    { pos: 11, artist:'Dionne Farris', song:'I Know', riaa:'—' },
    { pos: 12, artist:'Boyz II Men', song:'Water Runs Dry', riaa:'Platinum' },
    { pos: 13, artist:'Adina Howard', song:'Freak Like Me', riaa:'Platinum' },
    { pos: 14, artist:'Blues Traveler', song:'Run-Around', riaa:'—' },
    { pos: 15, artist:'All-4-One', song:'I Can Love You Like That', riaa:'Gold' },
    { pos: 16, artist:'Bryan Adams', song:'Have You Ever Really Loved A Woman?', riaa:'—' },
    { pos: 17, artist:'Bon Jovi', song:'Always', riaa:'Platinum' },
    { pos: 18, artist:'Shaggy', song:'Boombastic / In The Summertime', riaa:'Platinum' },
    { pos: 19, artist:'Nicki French', song:'Total Eclipse Of The Heart', riaa:'Gold' },
    { pos: 20, artist:'Desree', song:'You Gotta Be', riaa:'—' },
    { pos: 21, artist:'Michael Jackson', song:'You Are Not Alone', riaa:'Platinum' },
    { pos: 22, artist:'Hootie and The Blowfish', song:'Hold My Hand', riaa:'—' },
    { pos: 23, artist:'Notorious B.I.G.', song:'One More Chance-Stay With Me', riaa:'Platinum' },
    { pos: 24, artist:'Ini Kamoze', song:'Here Comes The Hotstepper', riaa:'2× Platinum' },
    { pos: 25, artist:'Soul For Real', song:'Candy Rain', riaa:'Gold' },
    { pos: 26, artist:'Hootie and The Blowfish', song:'Let Her Cry', riaa:'—' },
    { pos: 27, artist:'Blessid Union Of Souls', song:'I Believe', riaa:'—' },
    { pos: 28, artist:'TLC', song:'Red Light Special', riaa:'Gold' },
    { pos: 29, artist:'Janet Jackson', song:'Runaway', riaa:'Gold' },
    { pos: 30, artist:'Sheryl Crow', song:'Strong Enough', riaa:'Gold' },
    { pos: 31, artist:'Vanessa Williams', song:'Colors Of The Wind', riaa:'Gold' },
    { pos: 32, artist:'Jon B.', song:'Someone To Love', riaa:'Gold' },
    { pos: 33, artist:'Hootie and The Blowfish', song:'Only Wanna Be With You', riaa:'—' },
    { pos: 34, artist:'Brownstone', song:'If You Love Me', riaa:'Gold' },
    { pos: 35, artist:'Martin Page', song:'In The House Of Stone And Light', riaa:'—' },
    { pos: 36, artist:'Luniz', song:'I Got 5 On It', riaa:'Platinum' },
    { pos: 37, artist:'Brandy', song:'Baby', riaa:'Platinum' },
    { pos: 38, artist:'Real McCoy', song:'Run Away', riaa:'Gold' },
    { pos: 39, artist:'Sophie B. Hawkins', song:'As I Lay Me Down', riaa:'—' },
    { pos: 40, artist:'Mokenstef', song:'Hes Mine', riaa:'Gold' },
    { pos: 41, artist:'Collective Soul', song:'December', riaa:'—' },
    { pos: 42, artist:'Method Man-Mary J. Blige', song:'Ill Be There For You-Youre All I Need To Get By', riaa:'Platinum' },
    { pos: 43, artist:'Diana King', song:'Shy Guy', riaa:'Gold' },
    { pos: 44, artist:'Melissa Etheridge', song:'Im The Only One', riaa:'—' },
    { pos: 45, artist:'Soul For Real', song:'Every Little Thing I Do', riaa:'Gold' },
    { pos: 46, artist:'BLACKstreet', song:'Before I Let You Go', riaa:'—' },
    { pos: 47, artist:'Notorious B.I.G.', song:'Big Poppa / Warning', riaa:'Platinum' },
    { pos: 48, artist:'4 P.M.', song:'Sukiyaki', riaa:'Gold' },
    { pos: 49, artist:'Brandy', song:'I Wanna Be Down', riaa:'Platinum' },
    { pos: 50, artist:'Boyz II Men', song:'Ill Make Love To You', riaa:'Platinum' },
    { pos: 51, artist:'2Pac', song:'Dear Mama / Old School', riaa:'Multi-Platinum' },
    { pos: 52, artist:'Jamie Walters', song:'Hold On', riaa:'—' },
    { pos: 53, artist:'Dr. Dre', song:'Keep Their Heads Ringin', riaa:'Gold' },
    { pos: 54, artist:'Corona', song:'The Rhythm Of The Night', riaa:'—' },
    { pos: 55, artist:'Del Amitri', song:'Roll To Me', riaa:'—' },
    { pos: 56, artist:'Michael Jackson and Janet Jackson', song:'Scream / Childhood', riaa:'Platinum' },
    { pos: 57, artist:'Jodeci', song:'Freekn You', riaa:'Gold' },
    { pos: 58, artist:'Skee-lo', song:'I Wish', riaa:'Gold' },
    { pos: 59, artist:'Elton John', song:'Believe', riaa:'—' },
    { pos: 60, artist:'Natalie Merchant', song:'Carnival', riaa:'—' },
    { pos: 61, artist:'Tom Petty', song:'You Dont Know How It Feels', riaa:'—' },
    { pos: 62, artist:'Take That', song:'Back For Good', riaa:'—' },
    { pos: 63, artist:'69 Boyz', song:'Tootsee Roll', riaa:'Platinum' },
    { pos: 64, artist:'Janet Jackson', song:'You Want This-70s Love Groove', riaa:'Gold' },
    { pos: 65, artist:'Groove Theory', song:'Tell Me', riaa:'Gold' },
    { pos: 66, artist:'Total', song:'Cant You See', riaa:'Gold' },
    { pos: 67, artist:'Sheryl Crow', song:'All I Wanna Do', riaa:'Gold' },
    { pos: 68, artist:'Subway', song:'This Lil Game We Play', riaa:'Gold' },
    { pos: 69, artist:'Real McCoy', song:'Come And Get Your Love', riaa:'—' },
    { pos: 70, artist:'Bon Jovi', song:'This Aint A Love Song', riaa:'—' },
    { pos: 71, artist:'Madonna', song:'Secret', riaa:'Gold' },
    { pos: 72, artist:'Junior M.A.F.I.A.', song:'Players Anthem', riaa:'Gold' },
    { pos: 73, artist:'Naughty By Nature', song:'Feel Me Flow', riaa:'Gold' },
    { pos: 74, artist:'Jade', song:'Every Day Of The Week', riaa:'—' },
    { pos: 75, artist:'Vanessa Williams', song:'The Sweetest Days', riaa:'—' },
    { pos: 76, artist:'20 Fingers feat. Gillette', song:'Short Dick Man', riaa:'—' },
    { pos: 77, artist:'Brandy', song:'Brokenhearted', riaa:'Gold' },
    { pos: 78, artist:'Annie Lennox', song:'No More I Love Yous', riaa:'—' },
    { pos: 79, artist:'Faith Evans', song:'You Used To Love Me', riaa:'Gold' },
    { pos: 80, artist:'Immature', song:'Constantly', riaa:'Gold' },
    { pos: 81, artist:'U2', song:'Hold Me, Thrill Me, Kiss Me, Kill Me', riaa:'—' },
    { pos: 82, artist:'Crystal Waters', song:'100% Pure Love', riaa:'Gold' },
    { pos: 83, artist:'Raphael Saadiq', song:'Ask Of You', riaa:'—' },
    { pos: 84, artist:'Az', song:'Sugar Hill', riaa:'Gold' },
    { pos: 85, artist:'Better Than Ezra', song:'Good', riaa:'—' },
    { pos: 86, artist:'Dangelo', song:'Brown Sugar', riaa:'—' },
    { pos: 87, artist:'Gloria Estefan', song:'Turn The Beat Around', riaa:'Gold' },
    { pos: 88, artist:'After 7', song:'Til You Do Me Right', riaa:'—' },
    { pos: 89, artist:'Bone Thugs-N-Harmony', song:'1st Of Tha Month', riaa:'Gold' },
    { pos: 90, artist:'Melissa Etheridge', song:'Like The Way I Do-If I Wanted To', riaa:'—' },
    { pos: 91, artist:'Firehouse', song:'I Live My Life For You', riaa:'—' },
    { pos: 92, artist:'Stevie B', song:'Dream About You-Funky Melody', riaa:'—' },
    { pos: 93, artist:'Rednex', song:'Cotton Eye Joe', riaa:'Gold' },
    { pos: 94, artist:'Boyz II Men', song:'Thank You', riaa:'—' },
    { pos: 95, artist:'Pretenders', song:'Ill Stand By You', riaa:'—' },
    { pos: 96, artist:'N II U', song:'I Miss You', riaa:'—' },
    { pos: 97, artist:'Da Brat', song:'Give It 2 You', riaa:'Gold' },
    { pos: 98, artist:'Brandy', song:'Best Friend', riaa:'—' },
    { pos: 99, artist:'Soul Asylum', song:'Misery', riaa:'—' },
    { pos:100, artist:'Van Halen', song:'Cant Stop Lovin You', riaa:'—' }
  ],
  1996: [
    { pos:  1, artist:'Los Del Rio', song:'Macarena (Bayside Boys Mix)', riaa:'Multi-Platinum' },
    { pos:  2, artist:'Mariah Carey and Boyz II Men', song:'One Sweet Day', riaa:'Multi-Platinum' },
    { pos:  3, artist:'Celine Dion', song:'Because You Loved Me', riaa:'2× Platinum' },
    { pos:  4, artist:'Tony Rich Project', song:'Nobody Knows', riaa:'Platinum' },
    { pos:  5, artist:'Mariah Carey', song:'Always Be My Baby', riaa:'5× Platinum' },
    { pos:  6, artist:'Tracy Chapman', song:'Give Me One Reason', riaa:'Platinum' },
    { pos:  7, artist:'Bone Thugs-N-Harmony', song:'Tha Crossroads', riaa:'Multi-Platinum' },
    { pos:  8, artist:'Donna Lewis', song:'I Love You Always Forever', riaa:'Gold' },
    { pos:  9, artist:'Toni Braxton', song:'Youre Makin Me High / Let It Flow', riaa:'—' },
    { pos: 10, artist:'Keith Sweat', song:'Twisted', riaa:'Platinum' },
    { pos: 11, artist:'Quad City Djs', song:'Cmon N Ride It (The Train)', riaa:'Platinum' },
    { pos: 12, artist:'Everything But The Girl', song:'Missing', riaa:'Gold' },
    { pos: 13, artist:'Alanis Morissette', song:'Ironic', riaa:'Gold' },
    { pos: 14, artist:'Whitney Houston', song:'Exhale (Shoop Shoop)', riaa:'Platinum' },
    { pos: 15, artist:'Gin Blossoms', song:'Follow You Down / Til I Hear It From You', riaa:'—' },
    { pos: 16, artist:'Brandy', song:'Sittin Up In My Room', riaa:'Platinum' },
    { pos: 17, artist:'2Pac', song:'How Do U Want It / California Love', riaa:'Multi-Platinum' },
    { pos: 18, artist:'Celine Dion', song:'Its All Coming Back To Me Now', riaa:'Multi-Platinum' },
    { pos: 19, artist:'Eric Clapton', song:'Change The World', riaa:'Gold' },
    { pos: 20, artist:'LL Cool J', song:'Hey Lover', riaa:'Platinum' },
    { pos: 21, artist:'LL Cool J', song:'Loungin', riaa:'Platinum' },
    { pos: 22, artist:'Jann Arden', song:'Insensitive', riaa:'—' },
    { pos: 23, artist:'La Bouche', song:'Be My Lover', riaa:'Gold' },
    { pos: 24, artist:'Goo Goo Dolls', song:'Name', riaa:'2× Platinum' },
    { pos: 25, artist:'Jewel', song:'Who Will Save Your Soul', riaa:'—' },
    { pos: 26, artist:'No Mercy', song:'Where Do You Go', riaa:'Gold' },
    { pos: 27, artist:'R. Kelly', song:'I Cant Sleep Baby (If I)', riaa:'Platinum' },
    { pos: 28, artist:'Dishwalla', song:'Counting Blue Cars', riaa:'Gold' },
    { pos: 29, artist:'Alanis Morissette', song:'You Learn / You Oughta Know', riaa:'—' },
    { pos: 30, artist:'Joan Osborne', song:'One Of Us', riaa:'Gold' },
    { pos: 31, artist:'Natalie Merchant', song:'Wonder', riaa:'—' },
    { pos: 32, artist:'Mary J. Blige', song:'Not Gon Cry', riaa:'Platinum' },
    { pos: 33, artist:'Coolio', song:'Gangstas Paradise', riaa:'—' },
    { pos: 34, artist:'112 feat. The Notorious B.I.G.', song:'Only You', riaa:'Gold' },
    { pos: 35, artist:'R. Kelly', song:'Down Low (Nobody Has To Know)', riaa:'Platinum' },
    { pos: 36, artist:'SWV', song:'Youre The One', riaa:'Gold' },
    { pos: 37, artist:'La Bouche', song:'Sweet Dreams', riaa:'—' },
    { pos: 38, artist:'Monica', song:'Before You Walk Out Of My Life / Like This And Like That', riaa:'Platinum' },
    { pos: 39, artist:'Deep Blue Something', song:'Breakfast At Tiffanys', riaa:'—' },
    { pos: 40, artist:'Coolio', song:'1, 2, 3, 4 (Sumpin New)', riaa:'Gold' },
    { pos: 41, artist:'Collective Soul', song:'The World I Know', riaa:'—' },
    { pos: 42, artist:'BLACKstreet (feat. Dr. Dre)', song:'No Diggity', riaa:'—' },
    { pos: 43, artist:'3t', song:'Anything', riaa:'Gold' },
    { pos: 44, artist:'The Smashing Pumpkins', song:'1979', riaa:'Gold' },
    { pos: 45, artist:'TLC', song:'Diggin On You', riaa:'Gold' },
    { pos: 46, artist:'Monica', song:'Why I Love You So Much / Aint Nobody', riaa:'Gold' },
    { pos: 47, artist:'Total', song:'Kissin You', riaa:'Gold' },
    { pos: 48, artist:'Whitney Houston and Cece Winans', song:'Count On Me', riaa:'Gold' },
    { pos: 49, artist:'Mariah Carey', song:'Fantasy', riaa:'6× Platinum' },
    { pos: 50, artist:'Hootie and The Blowfish', song:'Time', riaa:'—' },
    { pos: 51, artist:'Madonna', song:'Youll See', riaa:'Gold' },
    { pos: 52, artist:'Az Yet', song:'Last Night', riaa:'Gold' },
    { pos: 53, artist:'Merril Bainbridge', song:'Mouth', riaa:'Gold' },
    { pos: 54, artist:'Color Me Badd', song:'The Earth, The Sun, The Rain', riaa:'—' },
    { pos: 55, artist:'Joe', song:'All The Things (Your Man Wont Do)', riaa:'Gold' },
    { pos: 56, artist:'Oasis', song:'Wonderwall', riaa:'Gold' },
    { pos: 57, artist:'Busta Rhymes', song:'Woo-hah!! Got You All In Check / Everything Remains Raw', riaa:'Platinum' },
    { pos: 58, artist:'Groove Theory', song:'Tell Me', riaa:'Gold' },
    { pos: 59, artist:'Outkast', song:'Elevators (Me & You)', riaa:'Gold' },
    { pos: 60, artist:'Blues Traveler', song:'Hook', riaa:'—' },
    { pos: 61, artist:'LL Cool J', song:'Doin It', riaa:'Platinum' },
    { pos: 62, artist:'George Michael', song:'Fastlove', riaa:'Gold' },
    { pos: 63, artist:'Case feat. Foxxy Brown', song:'Touch Me Tease Me', riaa:'Gold' },
    { pos: 64, artist:'Kris Kross', song:'Tonites Tha Night', riaa:'Gold' },
    { pos: 65, artist:'Robert Miles', song:'Children', riaa:'—' },
    { pos: 66, artist:'Adam Clayton and Larry Mullen', song:'Theme From Mission: Impossible', riaa:'Gold' },
    { pos: 67, artist:'Bodeans', song:'Closer To Free', riaa:'—' },
    { pos: 68, artist:'No Doubt', song:'Just A Girl', riaa:'2× Platinum' },
    { pos: 69, artist:'Aaliyah', song:'If Your Girl Only Knew', riaa:'—' },
    { pos: 70, artist:'Dangelo', song:'Lady', riaa:'Gold' },
    { pos: 71, artist:'John Mellencamp', song:'Key West Intermezzo (I Saw You First)', riaa:'—' },
    { pos: 72, artist:'Ginuwine', song:'Pony', riaa:'Platinum' },
    { pos: 73, artist:'Keith Sweat', song:'Nobody', riaa:'Platinum' },
    { pos: 74, artist:'Hootie and The Blowfish', song:'Old Man and Me (When I Get To Heaven)', riaa:'—' },
    { pos: 75, artist:'Sheryl Crow', song:'If It Makes You Happy', riaa:'Platinum' },
    { pos: 76, artist:'Sophie B. Hawkins', song:'As I Lay Me Down', riaa:'—' },
    { pos: 77, artist:'Mc Lyte', song:'Keep On, Keepin On', riaa:'—' },
    { pos: 78, artist:'Natalie Merchant', song:'Jealousy', riaa:'—' },
    { pos: 79, artist:'Melissa Etheridge', song:'I Want To Come Over', riaa:'—' },
    { pos: 80, artist:'Deborah Cox', song:'Who Do U Love', riaa:'—' },
    { pos: 81, artist:'Toni Braxton', song:'Un-Break My Heart', riaa:'—' },
    { pos: 82, artist:'Amber', song:'This Is Your Night', riaa:'—' },
    { pos: 83, artist:'R. Kelly', song:'You Remind Me Of Something', riaa:'Platinum' },
    { pos: 84, artist:'Janet Jackson', song:'Runaway', riaa:'Gold' },
    { pos: 85, artist:'Planet Soul', song:'Set U Free', riaa:'Gold' },
    { pos: 86, artist:'New Edition', song:'Hit Me Off', riaa:'Gold' },
    { pos: 87, artist:'Total', song:'No One Else', riaa:'Gold' },
    { pos: 88, artist:'Ghost Town Djs', song:'My Boo', riaa:'—' },
    { pos: 89, artist:'Junior M.A.F.I.A.', song:'Get Money', riaa:'—' },
    { pos: 90, artist:'Maxi Priest feat. Shaggy', song:'That Girl', riaa:'—' },
    { pos: 91, artist:'Do Or Die', song:'Po Pimp', riaa:'Gold' },
    { pos: 92, artist:'Metallica', song:'Until It Sleeps', riaa:'Gold' },
    { pos: 93, artist:'Crucial Conflict', song:'Hay', riaa:'Gold' },
    { pos: 94, artist:'Ace Of Base', song:'Beautiful Life', riaa:'—' },
    { pos: 95, artist:'Take That', song:'Back For Good', riaa:'—' },
    { pos: 96, artist:'Pearl Jam', song:'I Got Id / Long Road', riaa:'—' },
    { pos: 97, artist:'Faith Evans', song:'Soon As I Get Home', riaa:'Gold' },
    { pos: 98, artist:'Los Del Rio', song:'Macarena', riaa:'4× Platinum' },
    { pos: 99, artist:'Hootie and The Blowfish', song:'Only Wanna Be With You', riaa:'—' },
    { pos:100, artist:'Seal', song:'Dont Cry', riaa:'—' }
  ],
  1997: [
    { pos:  1, artist:'Elton John', song:'Candle In The Wind 1997', riaa:'11× Platinum' },
    { pos:  2, artist:'Jewel', song:'Foolish Games / You Were Meant For Me', riaa:'Platinum' },
    { pos:  3, artist:'Puff Daddy and Faith Evans', song:'Ill Be Missing You', riaa:'Multi-Platinum' },
    { pos:  4, artist:'Toni Braxton', song:'Un-Break My Heart', riaa:'Platinum' },
    { pos:  5, artist:'Puff Daddy', song:'Cant Nobody Hold Me Down', riaa:'Multi-Platinum' },
    { pos:  6, artist:'R. Kelly', song:'I Believe I Can Fly', riaa:'Platinum' },
    { pos:  7, artist:'En Vogue', song:'Dont Let Go (Love)', riaa:'Platinum' },
    { pos:  8, artist:'Mark Morrison', song:'Return Of The Mack', riaa:'5× Platinum' },
    { pos:  9, artist:'LeAnn Rimes', song:'How Do I Live', riaa:'4× Platinum' },
    { pos: 10, artist:'Spice Girls', song:'Wannabe', riaa:'Platinum' },
    { pos: 11, artist:'Backstreet Boys', song:'Quit Playing Games (With My Heart)', riaa:'Platinum' },
    { pos: 12, artist:'Hanson', song:'MMMBop', riaa:'Platinum' },
    { pos: 13, artist:'Monica', song:'For You I Will', riaa:'Platinum' },
    { pos: 14, artist:'Usher', song:'You Make Me Wanna', riaa:'—' },
    { pos: 15, artist:'Meredith Brooks', song:'Bitch', riaa:'Gold' },
    { pos: 16, artist:'Keith Sweat', song:'Nobody', riaa:'Platinum' },
    { pos: 17, artist:'Third Eye Blind', song:'Semi-Charmed Life', riaa:'4× Platinum' },
    { pos: 18, artist:'Duncan Sheik', song:'Barely Breathing', riaa:'—' },
    { pos: 19, artist:'Az Yet feat. Peter Cetera', song:'Hard To Say Im Sorry', riaa:'Platinum' },
    { pos: 20, artist:'Notorious B.I.G.', song:'Mo Money Mo Problems', riaa:'Platinum' },
    { pos: 21, artist:'Verve Pipe', song:'The Freshmen', riaa:'Gold' },
    { pos: 22, artist:'Savage Garden', song:'I Want You', riaa:'Gold' },
    { pos: 23, artist:'BLACKstreet feat. Dr. Dre', song:'No Diggity', riaa:'Platinum' },
    { pos: 24, artist:'Rome', song:'I Belong To You (Every Time I See Your Face)', riaa:'Platinum' },
    { pos: 25, artist:'Notorious B.I.G.', song:'Hypnotize', riaa:'Platinum' },
    { pos: 26, artist:'Babyface', song:'Every Time I Close My Eyes', riaa:'Platinum' },
    { pos: 27, artist:'Dru Hill', song:'In My Bed', riaa:'Platinum' },
    { pos: 28, artist:'Spice Girls', song:'Say Youll Be There', riaa:'Gold' },
    { pos: 29, artist:'Robyn', song:'Do You Know (What It Takes)', riaa:'Gold' },
    { pos: 30, artist:'Boyz II Men', song:'4 Seasons Of Loneliness', riaa:'Platinum' },
    { pos: 31, artist:'Changing Faces', song:'G.H.E.T.T.O.U.T.', riaa:'Platinum' },
    { pos: 32, artist:'Mariah Carey', song:'Honey', riaa:'2× Platinum' },
    { pos: 33, artist:'Whitney Houston', song:'I Believe In You And Me', riaa:'Platinum' },
    { pos: 34, artist:'Freaknasty', song:'Da Dip', riaa:'Platinum' },
    { pos: 35, artist:'Spice Girls', song:'2 Become 1', riaa:'Gold' },
    { pos: 36, artist:'Sister Hazel', song:'All For You', riaa:'—' },
    { pos: 37, artist:'112', song:'Cupid', riaa:'Platinum' },
    { pos: 38, artist:'Paula Cole', song:'Where Have All The Cowboys Gone?', riaa:'—' },
    { pos: 39, artist:'Shawn Colvin', song:'Sunny Came Home', riaa:'—' },
    { pos: 40, artist:'Tim McGraw and Faith Hill', song:'Its Your Love', riaa:'Multi-Platinum' },
    { pos: 41, artist:'Gina G', song:'Ooh Aah Just A Little Bit', riaa:'—' },
    { pos: 42, artist:'Merril Bainbridge', song:'Mouth', riaa:'Gold' },
    { pos: 43, artist:'Allure feat. 112', song:'All Cried Out', riaa:'Gold' },
    { pos: 44, artist:'New Edition', song:'Im Still In Love With You', riaa:'Gold' },
    { pos: 45, artist:'98 Degrees', song:'Invisible Man', riaa:'Gold' },
    { pos: 46, artist:'Lil Kim', song:'Not Tonight', riaa:'Platinum' },
    { pos: 47, artist:'Bone Thugs-N-Harmony', song:'Look Into My Eyes', riaa:'Platinum' },
    { pos: 48, artist:'702', song:'Get It Together', riaa:'Gold' },
    { pos: 49, artist:'Celine Dion', song:'All By Myself', riaa:'Gold' },
    { pos: 50, artist:'Celine Dion', song:'Its All Coming Back To Me Now', riaa:'—' },
    { pos: 51, artist:'Somethin For The People', song:'My Love Is The Shhh!', riaa:'Platinum' },
    { pos: 52, artist:'No Mercy', song:'Where Do You Go', riaa:'Gold' },
    { pos: 53, artist:'Barbra Streisand and Bryan Adams', song:'I Finally Found Someone', riaa:'Gold' },
    { pos: 54, artist:'Foxy Brown feat. Jay-Z', song:'Ill Be', riaa:'Gold' },
    { pos: 55, artist:'Sheryl Crow', song:'If It Makes You Happy', riaa:'Platinum' },
    { pos: 56, artist:'Dru Hill', song:'Never Make A Promise', riaa:'Gold' },
    { pos: 57, artist:'Journey', song:'When You Love A Woman', riaa:'Platinum' },
    { pos: 58, artist:'Magoo And Timbaland', song:'Up Jumps Da Boogie', riaa:'Gold' },
    { pos: 59, artist:'Toni Braxton', song:'I Dont Want To / I Love Me Some Him', riaa:'Gold' },
    { pos: 60, artist:'Sheryl Crow', song:'Everyday Is A Winding Road', riaa:'—' },
    { pos: 61, artist:'Mc Lyte', song:'Cold Rock A Party', riaa:'Gold' },
    { pos: 62, artist:'Ginuwine', song:'Pony', riaa:'Platinum' },
    { pos: 63, artist:'Sarah McLachlan', song:'Building A Mystery', riaa:'—' },
    { pos: 64, artist:'Donna Lewis', song:'I Love You Always Forever', riaa:'Gold' },
    { pos: 65, artist:'White Town', song:'Your Woman', riaa:'—' },
    { pos: 66, artist:'Coolio', song:'C U When U Get There', riaa:'Gold' },
    { pos: 67, artist:'Eric Clapton', song:'Change The World', riaa:'Gold' },
    { pos: 68, artist:'B-Rock and The Bizz', song:'My Baby Daddy', riaa:'Gold' },
    { pos: 69, artist:'Chumbawamba', song:'Tubthumping', riaa:'—' },
    { pos: 70, artist:'R. Kelly', song:'Gotham City', riaa:'Gold' },
    { pos: 71, artist:'Az Yet', song:'Last Night', riaa:'Gold' },
    { pos: 72, artist:'Various Artists', song:'ESPN Presents The Jock Jam', riaa:'—' },
    { pos: 73, artist:'Heavy D', song:'Big Daddy', riaa:'Gold' },
    { pos: 74, artist:'Total', song:'What About Us', riaa:'Gold' },
    { pos: 75, artist:'Scarface', song:'Smile', riaa:'Gold' },
    { pos: 76, artist:'Montell Jordan', song:'Whats On Tonight', riaa:'Gold' },
    { pos: 77, artist:'Bruce Springsteen', song:'Secret Garden', riaa:'Gold' },
    { pos: 78, artist:'Aaliyah', song:'The One I Gave My Heart To', riaa:'Gold' },
    { pos: 79, artist:'Seal', song:'Fly Like An Eagle', riaa:'—' },
    { pos: 80, artist:'Lil Kim', song:'No Time', riaa:'Gold' },
    { pos: 81, artist:'Luscious Jackson', song:'Naked Eye', riaa:'—' },
    { pos: 82, artist:'Los Del Rio', song:'Macarena (Bayside Boys Mix)', riaa:'—' },
    { pos: 83, artist:'Erykah Badu', song:'On & On', riaa:'Gold' },
    { pos: 84, artist:'Joe', song:'Dont Wanna Be A Player', riaa:'Gold' },
    { pos: 85, artist:'Warren G', song:'I Shot The Sheriff', riaa:'Gold' },
    { pos: 86, artist:'Brian McKnight feat. Mase', song:'You Should Be Mine (Dont Waste Your Time)', riaa:'—' },
    { pos: 87, artist:'Madonna', song:'Dont Cry For Me Argentina', riaa:'—' },
    { pos: 88, artist:'SWV', song:'Someone', riaa:'Gold' },
    { pos: 89, artist:'Michael Bolton', song:'Go The Distance', riaa:'Gold' },
    { pos: 90, artist:'Real McCoy', song:'One More Time', riaa:'—' },
    { pos: 91, artist:'Next', song:'Butta Love', riaa:'Gold' },
    { pos: 92, artist:'Mr. President', song:'Coco Jamboo', riaa:'—' },
    { pos: 93, artist:'Keith Sweat', song:'Twisted', riaa:'Platinum' },
    { pos: 94, artist:'Aqua', song:'Barbie Girl', riaa:'3× Platinum' },
    { pos: 95, artist:'Cranberries', song:'When Youre Gone / Free To Decide', riaa:'—' },
    { pos: 96, artist:'DJ Kool', song:'Let Me Clear My Throat', riaa:'Platinum' },
    { pos: 97, artist:'Blackout Allstars', song:'I Like It', riaa:'—' },
    { pos: 98, artist:'Toni Braxton', song:'Youre Makin Me High / Let It Flow', riaa:'Platinum' },
    { pos: 99, artist:'Madonna', song:'You Must Love Me', riaa:'Gold' },
    { pos:100, artist:'Ray J', song:'Let It Go', riaa:'—' }
  ],
  1998: [
    { pos:  1, artist:'Next', song:'Too Close', riaa:'Platinum' },
    { pos:  2, artist:'Brandy and Monica', song:'The Boy Is Mine', riaa:'2× Platinum' },
    { pos:  3, artist:'Shania Twain', song:'Youre Still The One', riaa:'Multi-Platinum' },
    { pos:  4, artist:'Savage Garden', song:'Truly Madly Deeply', riaa:'Gold' },
    { pos:  5, artist:'LeAnn Rimes', song:'How Do I Live', riaa:'4× Platinum' },
    { pos:  6, artist:'Janet', song:'Together Again', riaa:'Platinum' },
    { pos:  7, artist:'K-Ci and JoJo', song:'All My Life', riaa:'—' },
    { pos:  8, artist:'Elton John', song:'Candle In The Wind 1997', riaa:'11× Platinum' },
    { pos:  9, artist:'Usher', song:'Nice & Slow', riaa:'3× Platinum' },
    { pos: 10, artist:'Paula Cole', song:'I Dont Want To Wait', riaa:'—' },
    { pos: 11, artist:'Third Eye Blind', song:'Hows It Going To Be', riaa:'—' },
    { pos: 12, artist:'Destinys Child', song:'No, No, No', riaa:'Platinum' },
    { pos: 13, artist:'Celine Dion', song:'My Heart Will Go On', riaa:'4× Platinum' },
    { pos: 14, artist:'Will Smith', song:'Gettin Jiggy Wit It', riaa:'Gold' },
    { pos: 15, artist:'Usher', song:'You Make Me Wanna', riaa:'Platinum' },
    { pos: 16, artist:'Usher', song:'My Way', riaa:'Platinum' },
    { pos: 17, artist:'Mariah Carey', song:'My All', riaa:'2× Platinum' },
    { pos: 18, artist:'Monica', song:'The First Night', riaa:'Platinum' },
    { pos: 19, artist:'Puff Daddy and The Family', song:'Been Around The World', riaa:'Platinum' },
    { pos: 20, artist:'Sarah McLachlan', song:'Adia', riaa:'Gold' },
    { pos: 21, artist:'Jennifer Paige', song:'Crush', riaa:'Gold' },
    { pos: 22, artist:'Backstreet Boys', song:'Everybody (Backstreets Back)', riaa:'Platinum' },
    { pos: 23, artist:'Aerosmith', song:'I Dont Want To Miss A Thing', riaa:'Multi-Platinum' },
    { pos: 24, artist:'Public Announcement', song:'Body Bumpin Yippie-Yi-Yo', riaa:'Platinum' },
    { pos: 25, artist:'Faith Hill', song:'This Kiss', riaa:'Platinum' },
    { pos: 26, artist:'Uncle Sam', song:'I Dont Ever Want To See You Again', riaa:'Platinum' },
    { pos: 27, artist:'Montell Jordan', song:'Lets Ride', riaa:'Platinum' },
    { pos: 28, artist:'Marcy Playground', song:'Sex And Candy', riaa:'—' },
    { pos: 29, artist:'Robyn', song:'Show Me Love', riaa:'Gold' },
    { pos: 30, artist:'Boyz II Men', song:'A Song For Mama', riaa:'2× Platinum' },
    { pos: 31, artist:'Mase', song:'What You Want', riaa:'Gold' },
    { pos: 32, artist:'Madonna', song:'Frozen', riaa:'Gold' },
    { pos: 33, artist:'Wyclef Jean', song:'Gone Till November', riaa:'Platinum' },
    { pos: 34, artist:'Lsg', song:'My Body', riaa:'Platinum' },
    { pos: 35, artist:'Chumbawamba', song:'Tubthumping', riaa:'—' },
    { pos: 36, artist:'Lord Tariq and Peter Gunz', song:'Deja Vu (Uptown Baby)', riaa:'Platinum' },
    { pos: 37, artist:'N Sync', song:'I Want You Back', riaa:'Gold' },
    { pos: 38, artist:'Five', song:'When The Lights Go Out', riaa:'Gold' },
    { pos: 39, artist:'Jon B.', song:'They Dont Know', riaa:'—' },
    { pos: 40, artist:'Master P', song:'Make Em Say Uhh!', riaa:'Platinum' },
    { pos: 41, artist:'Nicole feat. Missy Misdemeanor Elliott and Mocha', song:'Make It Hot', riaa:'Gold' },
    { pos: 42, artist:'All Saints', song:'Never Ever', riaa:'—' },
    { pos: 43, artist:'Janet', song:'I Get Lonely', riaa:'Platinum' },
    { pos: 44, artist:'Mase', song:'Feel So Good', riaa:'Platinum' },
    { pos: 45, artist:'Voices Of Theory', song:'Say It', riaa:'Gold' },
    { pos: 46, artist:'Billie Myers', song:'Kiss The Rain', riaa:'—' },
    { pos: 47, artist:'Puff Daddy', song:'Come With Me', riaa:'Platinum' },
    { pos: 48, artist:'Sylk-E Fyne', song:'Romeo And Juliet', riaa:'Gold' },
    { pos: 49, artist:'Mya and Sisqo', song:'Its All About Me', riaa:'Gold' },
    { pos: 50, artist:'Hanson', song:'I Will Come To You', riaa:'Gold' },
    { pos: 51, artist:'Barenaked Ladies', song:'One Week', riaa:'—' },
    { pos: 52, artist:'K.P. and Envyi', song:'Swing My Way', riaa:'Gold' },
    { pos: 53, artist:'Xscape', song:'The Arms Of The One Who Loves You', riaa:'Gold' },
    { pos: 54, artist:'Somethin For The People', song:'My Love Is The Shhh!', riaa:'—' },
    { pos: 55, artist:'Tatyana Ali', song:'Daydreamin', riaa:'Gold' },
    { pos: 56, artist:'Dru Hill', song:'Were Not Making Love No More', riaa:'Gold' },
    { pos: 57, artist:'Third Eye Blind', song:'Semi-Charmed Life', riaa:'4× Platinum' },
    { pos: 58, artist:'Lisa Loeb', song:'I Do', riaa:'—' },
    { pos: 59, artist:'Mase', song:'Lookin At Me', riaa:'Gold' },
    { pos: 60, artist:'LeAnn Rimes', song:'Looking Through Your Eyes', riaa:'Gold' },
    { pos: 61, artist:'Divine', song:'Lately', riaa:'Platinum' },
    { pos: 62, artist:'Backstreet Boys', song:'Quit Playing Games (With My Heart)', riaa:'Platinum' },
    { pos: 63, artist:'Next', song:'I Still Love You', riaa:'Gold' },
    { pos: 64, artist:'Inoj', song:'Time After Time', riaa:'Gold' },
    { pos: 65, artist:'Jimmy Ray', song:'Are You Jimmy Ray?', riaa:'Gold' },
    { pos: 66, artist:'Ace Of Base', song:'Cruel Summer', riaa:'Gold' },
    { pos: 67, artist:'Master P', song:'I Got The Hook Up!', riaa:'Gold' },
    { pos: 68, artist:'Puff Daddy and The Family', song:'Victory', riaa:'Gold' },
    { pos: 69, artist:'Spice Girls', song:'Too Much', riaa:'—' },
    { pos: 70, artist:'Pras Feat. Ol Dirty Bastard and Mya', song:'Ghetto Supastar (That Is What You Are)', riaa:'—' },
    { pos: 71, artist:'Dru Hill feat. Redman', song:'How Deep Is Your Love', riaa:'Gold' },
    { pos: 72, artist:'Kelly Price', song:'Friend Of Mine', riaa:'Gold' },
    { pos: 73, artist:'Busta Rhymes', song:'Turn It Up [Remix] / Fire It Up', riaa:'Gold' },
    { pos: 74, artist:'Edwin McCain', song:'Ill Be', riaa:'—' },
    { pos: 75, artist:'Madonna', song:'Ray Of Light', riaa:'Gold' },
    { pos: 76, artist:'Sister Hazel', song:'All For You', riaa:'—' },
    { pos: 77, artist:'Monifah', song:'Touch It', riaa:'—' },
    { pos: 78, artist:'Lox', song:'Money, Power & Respect', riaa:'Platinum' },
    { pos: 79, artist:'The Verve', song:'Bitter Sweet Symphony', riaa:'Gold' },
    { pos: 80, artist:'Busta Rhymes', song:'Dangerous', riaa:'Gold' },
    { pos: 81, artist:'Spice Girls', song:'Spice Up Your Life', riaa:'Gold' },
    { pos: 82, artist:'98 Degrees', song:'Because Of You', riaa:'Platinum' },
    { pos: 83, artist:'Loreena McKennitt', song:'The Mummers Dance', riaa:'—' },
    { pos: 84, artist:'Allure feat. 112', song:'All Cried Out', riaa:'—' },
    { pos: 85, artist:'Big Punisher feat. Joe', song:'Still Not A Player', riaa:'—' },
    { pos: 86, artist:'Aaliyah', song:'The One I Gave My Heart To', riaa:'Gold' },
    { pos: 87, artist:'Jewel', song:'Foolish Games / You Were Meant For Me', riaa:'—' },
    { pos: 88, artist:'Inoj', song:'Love You Down', riaa:'—' },
    { pos: 89, artist:'2Pac', song:'Do For Love', riaa:'Gold' },
    { pos: 90, artist:'Luke', song:'Raise The Roof', riaa:'Gold' },
    { pos: 91, artist:'Nu Flavor', song:'Heaven', riaa:'—' },
    { pos: 92, artist:'Jd', song:'The Party Continues', riaa:'Gold' },
    { pos: 93, artist:'Missy Misdemeanor Elliott feat. Da Brat', song:'Sock It 2 Me', riaa:'Gold' },
    { pos: 94, artist:'Next', song:'Butta Love', riaa:'Gold' },
    { pos: 95, artist:'Aretha Franklin', song:'A Rose Is Still A Rose', riaa:'Gold' },
    { pos: 96, artist:'Boyz II Men', song:'4 Seasons Of Loneliness', riaa:'—' },
    { pos: 97, artist:'LL Cool J', song:'Father', riaa:'—' },
    { pos: 98, artist:'Gerald Levert', song:'Thinkin Bout It', riaa:'Gold' },
    { pos: 99, artist:'Deborah Cox', song:'Nobodys Supposed To Be Here', riaa:'—' },
    { pos:100, artist:'TQ', song:'Westside', riaa:'Gold' }
  ],
  1999: [
    { pos:  1, artist:'Cher', song:'Believe', riaa:'Platinum' },
    { pos:  2, artist:'TLC', song:'No Scrubs', riaa:'5× Platinum' },
    { pos:  3, artist:'Monica', song:'Angel Of Mine', riaa:'Platinum' },
    { pos:  4, artist:'Whitney Houston', song:'Heartbreak Hotel', riaa:'2× Platinum' },
    { pos:  5, artist:'Britney Spears', song:'Baby One More Time', riaa:'Platinum' },
    { pos:  6, artist:'Sixpence None The Richer', song:'Kiss Me', riaa:'3× Platinum' },
    { pos:  7, artist:'Christina Aguilera', song:'Genie In A Bottle', riaa:'3× Platinum' },
    { pos:  8, artist:'Sugar Ray', song:'Every Morning', riaa:'Gold' },
    { pos:  9, artist:'Deborah Cox', song:'Nobodys Supposed To Be Here', riaa:'Platinum' },
    { pos: 10, artist:'Ricky Martin', song:'Livin La Vida Loca', riaa:'Platinum' },
    { pos: 11, artist:'702', song:'Where My Girls At?', riaa:'Gold' },
    { pos: 12, artist:'Jennifer Lopez', song:'If You Had My Love', riaa:'Platinum' },
    { pos: 13, artist:'Goo Goo Dolls', song:'Slide', riaa:'3× Platinum' },
    { pos: 14, artist:'Brandy', song:'Have You Ever?', riaa:'—' },
    { pos: 15, artist:'Backstreet Boys', song:'I Want It That Way', riaa:'3× Platinum' },
    { pos: 16, artist:'R. Kelly and Celine Dion', song:'Im Your Angel', riaa:'Platinum' },
    { pos: 17, artist:'Smash Mouth', song:'All Star', riaa:'3× Platinum' },
    { pos: 18, artist:'Sarah McLachlan', song:'Angel', riaa:'—' },
    { pos: 19, artist:'Santana feat. Rob Thomas', song:'Smooth', riaa:'Gold' },
    { pos: 20, artist:'TLC', song:'Unpretty', riaa:'Gold' },
    { pos: 21, artist:'Destinys Child', song:'Bills, Bills, Bills', riaa:'Platinum' },
    { pos: 22, artist:'Eagle-Eye Cherry', song:'Save Tonight', riaa:'—' },
    { pos: 23, artist:'Pearl Jam', song:'Last Kiss', riaa:'Gold' },
    { pos: 24, artist:'Maxwell', song:'Fortunate', riaa:'Gold' },
    { pos: 25, artist:'Backstreet Boys', song:'All I Have To Give', riaa:'Platinum' },
    { pos: 26, artist:'Enrique Iglesias', song:'Bailamos', riaa:'—' },
    { pos: 27, artist:'Busta Rhymes feat. Janet', song:'Whats It Gonna Be?!', riaa:'Gold' },
    { pos: 28, artist:'Everlast', song:'What Its Like', riaa:'—' },
    { pos: 29, artist:'Lenny Kravitz', song:'Fly Away', riaa:'—' },
    { pos: 30, artist:'Sugar Ray', song:'Someday', riaa:'—' },
    { pos: 31, artist:'Divine', song:'Lately', riaa:'Platinum' },
    { pos: 32, artist:'Shania Twain', song:'That Dont Impress Me Much', riaa:'Platinum' },
    { pos: 33, artist:'Will Smith feat. Dru Hill and Kool Moe Dee', song:'Wild Wild West', riaa:'Gold' },
    { pos: 34, artist:'Red Hot Chili Peppers', song:'Scar Tissue', riaa:'6× Platinum' },
    { pos: 35, artist:'Mariah Carey feat. Jay-Z', song:'Heartbreaker', riaa:'Platinum' },
    { pos: 36, artist:'Mariah Carey', song:'I Still Believe', riaa:'Platinum' },
    { pos: 37, artist:'98 Degrees', song:'The Hardest Thing', riaa:'Gold' },
    { pos: 38, artist:'LFO', song:'Summer Girls', riaa:'Platinum' },
    { pos: 39, artist:'Jay-Z feat. Amil (Of Major Coinz) and Ja', song:'Can I Get A', riaa:'Platinum' },
    { pos: 40, artist:'Third Eye Blind', song:'Jumper', riaa:'3× Platinum' },
    { pos: 41, artist:'Lauryn Hill', song:'Doo Wop (That Thing)', riaa:'Gold' },
    { pos: 42, artist:'Lou Bega', song:'Mambo No. 5 (A Little Bit Of)', riaa:'—' },
    { pos: 43, artist:'Tyrese', song:'Sweet Lady', riaa:'—' },
    { pos: 44, artist:'Whitney Houston', song:'Its Not Right But Its Okay', riaa:'Platinum' },
    { pos: 45, artist:'N Sync', song:'(God Must Have Spent) A Little More Time On You', riaa:'—' },
    { pos: 46, artist:'Shawn Mullins', song:'Lullaby', riaa:'—' },
    { pos: 47, artist:'112 feat. LilZ', song:'Anywhere', riaa:'—' },
    { pos: 48, artist:'K-Ci and JoJo', song:'Tell Me Its Real', riaa:'—' },
    { pos: 49, artist:'Matchbox 20', song:'Back 2 Good', riaa:'—' },
    { pos: 50, artist:'Blaque', song:'808', riaa:'Gold' },
    { pos: 51, artist:'Tal Bachman', song:'Shes So High', riaa:'—' },
    { pos: 52, artist:'Ricky Martin', song:'Shes All I Ever Had', riaa:'Gold' },
    { pos: 53, artist:'Will Smith', song:'Miami', riaa:'—' },
    { pos: 54, artist:'Jewel', song:'Hands', riaa:'—' },
    { pos: 55, artist:'JT Money feat. Sole', song:'Who Dat', riaa:'Gold' },
    { pos: 56, artist:'Tim McGraw', song:'Please Remember Me', riaa:'Platinum' },
    { pos: 57, artist:'Shania Twain', song:'From This Moment On', riaa:'Platinum' },
    { pos: 58, artist:'Faith Evans', song:'Love Like This', riaa:'Gold' },
    { pos: 59, artist:'Jesse Powell', song:'You', riaa:'—' },
    { pos: 60, artist:'Total feat. Missy Elliott', song:'Trippin', riaa:'Gold' },
    { pos: 61, artist:'Silk', song:'If You (Lovin Me)', riaa:'Gold' },
    { pos: 62, artist:'Lauryn Hill', song:'Ex-Factor', riaa:'—' },
    { pos: 63, artist:'Jordan Knight', song:'Give It To You', riaa:'Gold' },
    { pos: 64, artist:'Goo Goo Dolls', song:'Black Balloon', riaa:'Platinum' },
    { pos: 65, artist:'Eric Benet feat. Tamia', song:'Spend My Life With You', riaa:'Gold' },
    { pos: 66, artist:'Dru Hill', song:'These Are The Times', riaa:'—' },
    { pos: 67, artist:'Mark Chesnutt', song:'I Dont Want To Miss A Thing', riaa:'—' },
    { pos: 68, artist:'98 Degrees', song:'I Do (Cherish You)', riaa:'—' },
    { pos: 69, artist:'98 Degrees', song:'Because Of You', riaa:'Platinum' },
    { pos: 70, artist:'Sarah McLachlan', song:'I Will Remember You (Live)', riaa:'—' },
    { pos: 71, artist:'Chante Moore', song:'Chantes Got A Man', riaa:'Gold' },
    { pos: 72, artist:'Case', song:'Happily Ever After', riaa:'—' },
    { pos: 73, artist:'Whitney Houston', song:'My Love Is Your Love', riaa:'2× Platinum' },
    { pos: 74, artist:'Faith Evans feat. Puff Daddy', song:'All Night Long', riaa:'—' },
    { pos: 75, artist:'Juvenile feat. Mannie Fresh and Lil Wayne', song:'Back That Thang Up', riaa:'Gold' },
    { pos: 76, artist:'Brandy', song:'Almost Doesnt Count', riaa:'—' },
    { pos: 77, artist:'Shania Twain', song:'Man! I Feel Like A Woman!', riaa:'3× Platinum' },
    { pos: 78, artist:'Len', song:'Steal My Sunshine', riaa:'Platinum' },
    { pos: 79, artist:'Marc Anthony', song:'I Need To Know', riaa:'Gold' },
    { pos: 80, artist:'Ginuwine', song:'So Anxious', riaa:'—' },
    { pos: 81, artist:'Case and Joe', song:'Faded Pictures', riaa:'—' },
    { pos: 82, artist:'Brian McKnight', song:'Back At One', riaa:'—' },
    { pos: 83, artist:'R. Kelly', song:'When A Womans Fed Up', riaa:'—' },
    { pos: 84, artist:'Kenny Chesney', song:'How Forever Feels', riaa:'Platinum' },
    { pos: 85, artist:'Lonestar', song:'Amazed', riaa:'Gold' },
    { pos: 86, artist:'Britney Spears', song:'Sometimes', riaa:'Gold' },
    { pos: 87, artist:'Mo Thugs Family feat. Bone Thugs-N-Harmony', song:'Ghetto Cowboy', riaa:'Gold' },
    { pos: 88, artist:'Fastball', song:'Out Of My Head', riaa:'—' },
    { pos: 89, artist:'Jay-Z', song:'Hard Knock Life (Ghetto Anthem)', riaa:'2× Platinum' },
    { pos: 90, artist:'Naughty By Nature feat. Zhane', song:'Jamboree', riaa:'Gold' },
    { pos: 91, artist:'BLACKstreet and Mya feat. Mase and Blinky Blink', song:'Take Me There', riaa:'—' },
    { pos: 92, artist:'Joey McIntyre', song:'Stay The Same', riaa:'Gold' },
    { pos: 93, artist:'Jo Dee Messina', song:'Lesson In Leavin', riaa:'—' },
    { pos: 94, artist:'Goo Goo Dolls', song:'Iris', riaa:'Diamond' },
    { pos: 95, artist:'Puff Daddy feat. R. Kelly', song:'Satisfy You', riaa:'Gold' },
    { pos: 96, artist:'Citizen King', song:'Better Days (And The Bottom Drops Out)', riaa:'—' },
    { pos: 97, artist:'N Sync and Gloria Estefan', song:'Music Of My Heart', riaa:'Gold' },
    { pos: 98, artist:'George Strait', song:'Write This Down', riaa:'2× Platinum' },
    { pos: 99, artist:'Whitney Houston and Mariah Carey', song:'When You Believe', riaa:'Gold' },
    { pos:100, artist:'Alabama feat. N Sync', song:'God Must Have Spent A Little More Time On You', riaa:'—' }
  ],
};
// ── COUNTDOWN HANDLERS ──
const tableWrap     = document.getElementById('tableWrap');
const tableYearNum  = document.getElementById('tableYearNum');
const countdownBody = document.getElementById('countdownBody');

// ── PLAYER UPDATE ──
const songTitleEl      = document.getElementById('songTitle');
const artistNameEl     = document.getElementById('artistName');
const songYearEl       = document.getElementById('songYear');
const artistInitialsEl = document.getElementById('artistInitials');
const artistImgEl      = document.getElementById('artistImg');
const artistPlaceholderEl = document.getElementById('artistPlaceholder');
const videoBtnEl          = document.getElementById('videoBtn');
const videoModal          = document.getElementById('videoModal');
const videoModalClose     = document.getElementById('videoModalClose');
const videoPlayerEl       = document.getElementById('videoPlayer');

videoBtnEl.addEventListener('click', () => {
  if (!currentVideoUrl) return;
  videoPlayerEl.src = currentVideoUrl;
  videoModal.classList.add('open');
  if (isPlaying) { audio.pause(); setPlayState(false); }
  videoPlayerEl.play().catch(() => {});
});
videoModalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });
function closeVideoModal() {
  videoPlayerEl.pause();
  videoPlayerEl.src = '';
  videoModal.classList.remove('open');
  if (isPreviewMode && audio.src) {
    audio.play().then(() => setPlayState(true)).catch(() => {});
  }
}

async function fetchItunesPreview(artist, song) {
  try {
    const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + song)}&media=music&entity=song&limit=5`);
    const data = await res.json();
    const hit  = data.results.find(r => r.previewUrl);
    return hit ? hit.previewUrl : null;
  } catch { return null; }
}

async function fetchItunesVideo(artist, song) {
  function norm(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[''`]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function songMatch(trackName) {
    const t = norm(trackName || ''), n = norm(song);
    return t === n || t.includes(n) || n.includes(t);
  }
  function artistMatch(artistName) {
    const a = norm(artistName || ''), n = norm(artist);
    return a.includes(n) || n.includes(a);
  }
  async function searchVideos(term, limit) {
    const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=musicVideo&limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  }
  try {
    const byArtist = await searchVideos(artist, 25);
    const hit1 = byArtist.find(r => r.previewUrl && songMatch(r.trackName));
    if (hit1) return hit1.previewUrl;
    const byCombined = await searchVideos(artist + ' ' + song, 10);
    const hit2 = byCombined.find(r => r.previewUrl && songMatch(r.trackName) && artistMatch(r.artistName));
    if (hit2) return hit2.previewUrl;
    const bySong = await searchVideos(song, 15);
    const hit3 = bySong.find(r => r.previewUrl && artistMatch(r.artistName));
    if (hit3) return hit3.previewUrl;
    return null;
  } catch { return null; }
}

function switchToPreview(previewUrl) {
  if (hls) hls.detachMedia();
  isPreviewMode = true;
  audio.src = previewUrl;
  audio.play()
    .then(() => setPlayState(true))
    .catch(() => setStatus('Preview unavailable'));
}

const WIKI_MUSIC_RE = /musician|singer|songwriter|rapper|band|group|producer|vocalist|rock|pop|r&b|soul|jazz|country|composer|guitarist|drummer/i;

function fetchWikiThumb(name) {
  const tries = [name, name + ' (musician)', name + ' (singer)', name + ' (band)', name + ' (rapper)'];
  function attempt(i) {
    if (i >= tries.length) return Promise.resolve(null);
    return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(tries[i])}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || data.type === 'disambiguation') return attempt(i + 1);
        const text = (data.description || '') + ' ' + (data.extract || '').slice(0, 300);
        if (i === 0 && !WIKI_MUSIC_RE.test(text)) return attempt(i + 1);
        return (data.thumbnail && data.thumbnail.source) ? data.thumbnail.source : null;
      })
      .catch(() => attempt(i + 1));
  }
  return attempt(0);
}

function getInitials(name) {
  return name.split(/[\s&,]+/)
    .filter(w => /^[A-Za-z0-9]/.test(w))
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('');
}

async function updatePlayer(artist, song, year) {
  songTitleEl.textContent      = song;
  artistNameEl.textContent     = artist;
  songYearEl.innerHTML         = `&bull;&nbsp;${year}&nbsp;&bull;`;
  artistInitialsEl.textContent = getInitials(artist);

  videoBtnEl.style.display = 'none';
  currentVideoUrl = null;

  const url = `/api/albumart?artist=${encodeURIComponent(artist)}&year=${encodeURIComponent(year)}`;
  const testImg = new Image();
  testImg.onload = () => {
    artistImgEl.src = url;
    artistImgEl.alt = artist;
    artistImgEl.style.display = 'block';
    artistPlaceholderEl.style.display = 'none';
  };
  testImg.onerror = () => {
    fetchWikiThumb(artist).then(thumbUrl => {
      if (thumbUrl) {
        artistImgEl.src = thumbUrl;
        artistImgEl.alt = artist;
        artistImgEl.style.display = 'block';
        artistPlaceholderEl.style.display = 'none';
      } else {
        artistImgEl.style.display = 'none';
        artistPlaceholderEl.style.display = '';
      }
    });
  };
  testImg.src = url;

  document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });

  setStatus('Finding preview\u2026');
  const [previewUrl, videoUrl] = await Promise.all([
    fetchItunesPreview(artist, song),
    fetchItunesVideo(artist, song)
  ]);

  if (previewUrl) {
    switchToPreview(previewUrl);
  } else {
    setStatus('Preview not available');
  }

  if (videoUrl) {
    currentVideoUrl = videoUrl;
    videoBtnEl.style.display = '';
  }
}

function renderCountdown(year) {
  const songs = BILLBOARD[year];
  if (!songs) return;

  tableYearNum.textContent = year;

  countdownBody.innerHTML = [...songs].reverse().map(({ pos, artist, song, riaa }) => {
    const rankClass = pos === 1 ? 'rank-1' : pos === 2 ? 'rank-2' : pos === 3 ? 'rank-3' : 'rank-other';
    const riaaCell  = riaa && riaa !== '—'
      ? `<span class="riaa-badge">${riaa}</span>`
      : `<span class="riaa-none">—</span>`;
    const safeArtist = artist.replace(/'/g, '&#39;');
    const safeSong   = song.replace(/'/g, '&#39;');
    const artistUrl = `artist.html?artist=${encodeURIComponent(artist)}`;
    const songUrl   = `artist.html?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}&year=${year}`;
    return `<tr data-artist="${safeArtist}" data-song="${safeSong}" data-year="${year}">
      <td class="col-rank"><span class="rank-badge ${rankClass}">${pos}</span></td>
      <td class="td-artist">${artist} <a href="${artistUrl}" class="profile-link" title="Click for artist bio">&#8599;</a></td>
      <td class="td-song">${song} <a href="${songUrl}" class="profile-link" title="Click for song details">&#8599;</a></td>
      <td class="td-riaa">${riaaCell}</td>
    </tr>`;
  }).join('');

  tableWrap.classList.add('visible');
  tableWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

countdownBody.addEventListener('click', e => {
  if (e.target.closest('a.profile-link')) return;
  const row = e.target.closest('tr[data-artist]');
  if (!row) return;
  countdownBody.querySelectorAll('tr.row-selected').forEach(r => r.classList.remove('row-selected'));
  row.classList.add('row-selected');
  updatePlayer(row.dataset.artist, row.dataset.song, parseInt(row.dataset.year, 10));
});

function resetPlayer() {
  audio.pause();
  setPlayState(false);
  isPreviewMode   = false;
  currentVideoUrl = null;
  audio.src = '';
  if (hls) hls.detachMedia();

  songTitleEl.textContent      = 'Select a song';
  artistNameEl.textContent     = 'Artist';
  songYearEl.innerHTML         = '';
  artistInitialsEl.textContent = '';
  artistImgEl.style.display    = 'none';
  artistPlaceholderEl.style.display = '';
  videoBtnEl.style.display     = 'none';
  setStatus('Click a song to preview');
}

document.querySelectorAll('.year-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    resetPlayer();
    renderCountdown(parseInt(btn.dataset.year, 10));
  });
});
