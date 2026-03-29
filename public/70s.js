const STREAM = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';

const audio     = new Audio();
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

let isPlaying = false;
let hlsReady  = false;
let upVotes   = 0;
let downVotes = 0;
let userVote  = null; // 'up' | 'down' | null

// ── HLS INIT ──
(function initHls() {
  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true });
    hls.loadSource(STREAM);
    hls.attachMedia(audio);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      hlsReady = true;
      setStatus('Ready to groove');
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setStatus('Stream error — retrying…');
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS
    audio.src = STREAM;
    hlsReady  = true;
    setStatus('Ready to groove');
  } else {
    setStatus('HLS not supported in this browser');
  }
})();

// ── PLAY / PAUSE ──
playBtn.addEventListener('click', () => {
  if (!hlsReady) { setStatus('Loading stream…'); return; }
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
    setStatus('Live &bull; Playing now');
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

  // Gradient fill on track
  const filled   = '#d95c0a';
  const unfilled = '#3d2000';
  volSlider.style.background =
    `linear-gradient(90deg, ${filled} ${pct}%, ${unfilled} ${pct}%)`;

  // Speaker icon
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
syncVolume(); // set initial state

// ── RATING ──
thumbUp.addEventListener('click', () => {
  if (userVote === 'up') {
    // Toggle off
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

// ── STATUS ──
function setStatus(msg) { statusEl.innerHTML = msg; }

// ── BILLBOARD YEAR-END TOP 100 DATA ──
const BILLBOARD = {
  1970: [
    { pos:  1, artist:'Simon and Garfunkel', song:'Bridge Over Troubled Water', riaa:'—' },
    { pos:  2, artist:'Carpenters', song:'(They Long To Be) Close To You', riaa:'—' },
    { pos:  3, artist:'Guess Who', song:'American Woman / No Sugar Tonight', riaa:'—' },
    { pos:  4, artist:'B.J. Thomas', song:'Raindrops Keep Fallin\' On My Head', riaa:'—' },
    { pos:  5, artist:'Edwin Starr', song:'War', riaa:'—' },
    { pos:  6, artist:'Diana Ross', song:'Ain\'t No Mountain High Enough', riaa:'—' },
    { pos:  7, artist:'Jackson 5', song:'I\'ll Be There', riaa:'—' },
    { pos:  8, artist:'Rare Earth', song:'Get Ready', riaa:'—' },
    { pos:  9, artist:'Beatles', song:'Let It Be', riaa:'Multi-Platinum' },
    { pos: 10, artist:'Freda Payne', song:'Band Of Gold', riaa:'—' },
    { pos: 11, artist:'Three Dog Night', song:'Mama Told Me (Not To Come)', riaa:'—' },
    { pos: 12, artist:'Ray Stevens', song:'Everything Is Beautiful', riaa:'—' },
    { pos: 13, artist:'Bread', song:'Make It With You', riaa:'—' },
    { pos: 14, artist:'Vanity Fare', song:'Hitchin\' A Ride', riaa:'—' },
    { pos: 15, artist:'Jackson 5', song:'ABC', riaa:'—' },
    { pos: 16, artist:'Jackson 5', song:'The Love You Save', riaa:'—' },
    { pos: 17, artist:'Neil Diamond', song:'Cracklin\' Rose', riaa:'Platinum' },
    { pos: 18, artist:'Dawn', song:'Candida', riaa:'—' },
    { pos: 19, artist:'Sly and The Family Stone', song:'Thank You (Fallettin Me Be Mice Elf Again)', riaa:'—' },
    { pos: 20, artist:'Eric Burdon and War', song:'Spill The Wine', riaa:'—' },
    { pos: 21, artist:'Five Stairsteps', song:'O-o-h Child', riaa:'—' },
    { pos: 22, artist:'Norman Greenbaum', song:'Spirit In The Sky', riaa:'—' },
    { pos: 23, artist:'Melanie and The Edwin Hawkins Singers', song:'Lay Down (Candles In The Rain)', riaa:'—' },
    { pos: 24, artist:'Temptations', song:'Ball Of Confusion (That\'s What The World Is Today)', riaa:'Platinum' },
    { pos: 25, artist:'Moments', song:'Love On A Two Way Street', riaa:'—' },
    { pos: 26, artist:'Jackson 5', song:'I Want You Back', riaa:'—' },
    { pos: 27, artist:'Poppy Family', song:'Which Way You Goin\' Billy?', riaa:'—' },
    { pos: 28, artist:'Free', song:'All Right Now', riaa:'—' },
    { pos: 29, artist:'Bobby Sherman', song:'Julie, Do Ya Love Me', riaa:'—' },
    { pos: 30, artist:'Sugarloaf', song:'Green-Eyed Lady', riaa:'—' },
    { pos: 31, artist:'Stevie Wonder', song:'Signed Sealed, Delivered (I\'m Yours)', riaa:'—' },
    { pos: 32, artist:'Blues Image', song:'Ride Captain Ride', riaa:'—' },
    { pos: 33, artist:'Shocking Blue', song:'Venus', riaa:'—' },
    { pos: 34, artist:'John Lennon', song:'Instant Karma (We All Shine On)', riaa:'—' },
    { pos: 35, artist:'Clarence Carter', song:'Patches', riaa:'—' },
    { pos: 36, artist:'Creedence Clearwater Revival', song:'Lookin\' Out My Back Door / Long As I Can See The Light', riaa:'Platinum' },
    { pos: 37, artist:'Brook Benton', song:'Rainy Night In Georgia', riaa:'—' },
    { pos: 38, artist:'Kenny Rogers and The First Edition', song:'Something\'s Burning', riaa:'—' },
    { pos: 39, artist:'Chairmen Of The Board', song:'Give Me Just A Little More Time', riaa:'—' },
    { pos: 40, artist:'Edison Lighthouse', song:'Love Grows (Where My Rosemary Goes)', riaa:'—' },
    { pos: 41, artist:'Beatles', song:'The Long And Winding Road / For You Blue', riaa:'Platinum' },
    { pos: 42, artist:'Anne Murray', song:'Snowbird', riaa:'—' },
    { pos: 43, artist:'Marmalade', song:'Reflections Of My Life', riaa:'—' },
    { pos: 44, artist:'Eddie Holman', song:'Hey There Lonely Girl', riaa:'—' },
    { pos: 45, artist:'Jaggerz', song:'The Rapper', riaa:'—' },
    { pos: 46, artist:'Hollies', song:'He Ain\'t Heavy, He\'s My Brother', riaa:'—' },
    { pos: 47, artist:'Alive and Kicking', song:'Tighter, Tighter', riaa:'—' },
    { pos: 48, artist:'Badfinger', song:'Come And Get It', riaa:'—' },
    { pos: 49, artist:'Simon and Garfunkel', song:'Cecelia', riaa:'—' },
    { pos: 50, artist:'Charles Wright and The Watts 103rd Street Rhythm Band', song:'Love Land', riaa:'—' },
    { pos: 51, artist:'Tyrone Davis', song:'Turn Back The Hands Of Time', riaa:'—' },
    { pos: 52, artist:'Kinks', song:'Lola', riaa:'—' },
    { pos: 53, artist:'Mungo Jerry', song:'In The Summertime', riaa:'—' },
    { pos: 54, artist:'R. Dean Taylor', song:'Indiana Wants Me', riaa:'—' },
    { pos: 55, artist:'Rare Earth', song:'(I Know) I\'m Losing You', riaa:'—' },
    { pos: 56, artist:'Bobby Sherman', song:'Easy Come, Easy Go', riaa:'—' },
    { pos: 57, artist:'Charles Wright and The Watts 103rd Street Rhythm Band', song:'Express Yourself', riaa:'—' },
    { pos: 58, artist:'Four Tops', song:'Still Water', riaa:'—' },
    { pos: 59, artist:'Chicago', song:'Make Me Smile', riaa:'—' },
    { pos: 60, artist:'Frijid Pink', song:'House Of The Rising Sun', riaa:'—' },
    { pos: 61, artist:'Chicago', song:'25 Or 6 To 4', riaa:'—' },
    { pos: 62, artist:'White Plains', song:'My Baby Loves Lovin\'', riaa:'—' },
    { pos: 63, artist:'Friends Of Distinction', song:'Love Or Let Me Be Lonely', riaa:'—' },
    { pos: 64, artist:'Brotherhood Of Man', song:'United We Stand', riaa:'—' },
    { pos: 65, artist:'Carpenters', song:'We\'ve Only Just Begun', riaa:'—' },
    { pos: 66, artist:'Mark Lindsay', song:'Arizona', riaa:'—' },
    { pos: 67, artist:'James Taylor', song:'Fire And Rain', riaa:'—' },
    { pos: 68, artist:'Gene Chandler', song:'Groovy Situation', riaa:'—' },
    { pos: 69, artist:'Santana', song:'Evil Ways', riaa:'—' },
    { pos: 70, artist:'Guess Who', song:'No Time', riaa:'—' },
    { pos: 71, artist:'Delfonics', song:'Didn\'t I (Blow Your Mind This Time)', riaa:'—' },
    { pos: 72, artist:'Elvis Presley', song:'The Wonder Of You / Mama Liked The Roses', riaa:'Gold' },
    { pos: 73, artist:'Creedence Clearwater Revival', song:'Up Around The Bend / Run Through The Jungle', riaa:'Gold' },
    { pos: 74, artist:'Ronnie Dyson', song:'(If You Let Me Make Love To You Then) Why Can\'t I Touch You', riaa:'—' },
    { pos: 75, artist:'B.J. Thomas', song:'I Just Can\'t Help Believing', riaa:'—' },
    { pos: 76, artist:'Spinners', song:'It\'s A Shame', riaa:'—' },
    { pos: 77, artist:'Bobbi Martin', song:'For The Love Of Him', riaa:'—' },
    { pos: 78, artist:'Mountain', song:'Mississippi Queen', riaa:'—' },
    { pos: 79, artist:'Ike and Tina Turner', song:'I Want To Take You Higher', riaa:'—' },
    { pos: 80, artist:'Joe Cocker', song:'The Letter', riaa:'—' },
    { pos: 81, artist:'Tee Set', song:'Ma Belle Amie', riaa:'—' },
    { pos: 82, artist:'Originals', song:'The Bells', riaa:'—' },
    { pos: 83, artist:'Christie', song:'Yellow River', riaa:'—' },
    { pos: 84, artist:'100 Proof Aged In Soul', song:'Somebody\'s Been Sleeping', riaa:'—' },
    { pos: 85, artist:'Ides Of March', song:'Vehicle', riaa:'—' },
    { pos: 86, artist:'Pipkins', song:'Gimme Dat Ding', riaa:'—' },
    { pos: 87, artist:'Robin McNamara', song:'Lay A Little Lovin\' On Me', riaa:'—' },
    { pos: 88, artist:'Supremes', song:'Up The Ladder To The Roof', riaa:'—' },
    { pos: 89, artist:'Creedence Clearwater Revival', song:'Travelin\' Band / Who\'ll Stop The Rain', riaa:'Platinum' },
    { pos: 90, artist:'Sandpipers', song:'Come Saturday Morning', riaa:'—' },
    { pos: 91, artist:'Temptations', song:'Psychedelic Shack', riaa:'—' },
    { pos: 92, artist:'Tom Jones', song:'Without Love (There Is Nothing)', riaa:'—' },
    { pos: 93, artist:'Pacific Gas and Electric', song:'Are You Ready?', riaa:'—' },
    { pos: 94, artist:'Crosby, Stills, Nash and Young', song:'Woodstock', riaa:'—' },
    { pos: 95, artist:'Dionne Warwick', song:'I\'ll Never Fall In Love Again', riaa:'—' },
    { pos: 96, artist:'New Seekers', song:'Look What They\'ve Done To My Song Ma', riaa:'—' },
    { pos: 97, artist:'Joe South', song:'Walk A Mile In My Shoes', riaa:'—' },
    { pos: 98, artist:'B.B. King', song:'The Thrill Is Gone', riaa:'—' },
    { pos: 99, artist:'Glen Campbell', song:'It\'s Only Make Believe', riaa:'—' },
    { pos:100, artist:'Aretha Franklin', song:'Call Me', riaa:'—' }
  ],
  1971: [
    { pos:  1, artist:'Three Dog Night', song:'Joy to the World', riaa:'2× Platinum' },
    { pos:  2, artist:'Rod Stewart', song:'Maggie May / (Find A) Reason To Believe', riaa:'Multi-Platinum' },
    { pos:  3, artist:'Carole King', song:'It\'s Too Late / I Feel The Earth Move', riaa:'—' },
    { pos:  4, artist:'Osmonds', song:'One Bad Apple', riaa:'—' },
    { pos:  5, artist:'Bee Gees', song:'How Can You Mend A Broken Heart', riaa:'—' },
    { pos:  6, artist:'Raiders', song:'Indian Reservation', riaa:'—' },
    { pos:  7, artist:'Donny Osmond', song:'Go Away Little Girl', riaa:'—' },
    { pos:  8, artist:'John Denver', song:'Take Me Home, Country Roads', riaa:'Platinum' },
    { pos:  9, artist:'Temptations', song:'Just My Imagination (Running Away With Me)', riaa:'Platinum' },
    { pos: 10, artist:'Dawn', song:'Knock Three Times', riaa:'—' },
    { pos: 11, artist:'Janis Joplin', song:'Me And Bobby McGee', riaa:'—' },
    { pos: 12, artist:'Al Green', song:'Tired Of Being Alone', riaa:'—' },
    { pos: 13, artist:'Honey Cone', song:'Want Ads', riaa:'—' },
    { pos: 14, artist:'Undisputed Truth', song:'Smiling Faces Sometimes', riaa:'—' },
    { pos: 15, artist:'Cornelius Brothers and Sister Rose', song:'Treat Her Like A Lady', riaa:'—' },
    { pos: 16, artist:'Rolling Stones', song:'Brown Sugar', riaa:'—' },
    { pos: 17, artist:'James Taylor', song:'You\'ve Got A Friend', riaa:'—' },
    { pos: 18, artist:'Jean Knight', song:'Mr. Big Stuff', riaa:'Multi-Platinum' },
    { pos: 19, artist:'Lee Michaels', song:'Do You Know What I Mean', riaa:'—' },
    { pos: 20, artist:'Joan Baez', song:'The Night They Drove Old Dixie Down', riaa:'—' },
    { pos: 21, artist:'Marvin Gaye', song:'What\'s Going On', riaa:'—' },
    { pos: 22, artist:'Paul and Linda McCartney', song:'Uncle Albert-Admiral Halsey', riaa:'—' },
    { pos: 23, artist:'Bill Withers', song:'Ain\'t No Sunshine', riaa:'—' },
    { pos: 24, artist:'Five Man Electrical Band', song:'Signs', riaa:'—' },
    { pos: 25, artist:'Tom Jones', song:'She\'s A Lady', riaa:'—' },
    { pos: 26, artist:'Free Movement', song:'I Found Someone Of My Own', riaa:'—' },
    { pos: 27, artist:'Murray Head and The Trinidad Singers', song:'Superstar', riaa:'—' },
    { pos: 28, artist:'Jerry Reed', song:'Amos Moses', riaa:'—' },
    { pos: 29, artist:'Grass Roots', song:'Temptation Eyes', riaa:'—' },
    { pos: 30, artist:'Carpenters', song:'Superstar', riaa:'—' },
    { pos: 31, artist:'George Harrison', song:'My Sweet Lord / Isn\'t It A Pity', riaa:'Platinum' },
    { pos: 32, artist:'Donny Osmond', song:'Sweet And Innocent', riaa:'—' },
    { pos: 33, artist:'Ocean', song:'Put Your Hand In The Hand', riaa:'—' },
    { pos: 34, artist:'Daddy Dewdrop', song:'Chick-A-Boom (Don\'t Ya Jes\' Love It)', riaa:'—' },
    { pos: 35, artist:'Carpenters', song:'For All We Know', riaa:'—' },
    { pos: 36, artist:'Gordon Lightfoot', song:'If You Could Read My Mind', riaa:'—' },
    { pos: 37, artist:'Sammi Smith', song:'Help Me Make It Through The Night', riaa:'—' },
    { pos: 38, artist:'Carpenters', song:'Rainy Days And Mondays', riaa:'—' },
    { pos: 39, artist:'Cher', song:'Gypsy, Tramps And Thieves', riaa:'—' },
    { pos: 40, artist:'Jackson 5', song:'Never Can Say Goodbye', riaa:'—' },
    { pos: 41, artist:'Lynn Anderson', song:'Rose Garden', riaa:'—' },
    { pos: 42, artist:'Hamilton, Joe Frank and Reynolds', song:'Don\'t Pull Your Love', riaa:'—' },
    { pos: 43, artist:'Ringo Starr', song:'It Don\'t Come Easy', riaa:'—' },
    { pos: 44, artist:'Nitty Gritty Dirt Band', song:'Mr. Bojangles', riaa:'—' },
    { pos: 45, artist:'Fuzz', song:'I Love You For All Seasons', riaa:'—' },
    { pos: 46, artist:'Dramatics', song:'Whatcha See Is Whatcha Get', riaa:'—' },
    { pos: 47, artist:'Carly Simon', song:'That\'s The Way I\'ve Always Heard It Should Be', riaa:'—' },
    { pos: 48, artist:'Stevie Wonder', song:'If You Really Love Me', riaa:'—' },
    { pos: 49, artist:'Aretha Franklin', song:'Spanish Harlem', riaa:'—' },
    { pos: 50, artist:'Helen Reddy', song:'I Don\'t Know How To Love Him', riaa:'—' },
    { pos: 51, artist:'Osmonds', song:'Yo-yo', riaa:'—' },
    { pos: 52, artist:'Aretha Franklin', song:'Bridge Over Troubled Water', riaa:'—' },
    { pos: 53, artist:'Partridge Family', song:'Doesn\'t Somebody Want To Be Wanted', riaa:'—' },
    { pos: 54, artist:'Tommy James', song:'Draggin\' The Line', riaa:'—' },
    { pos: 55, artist:'Ike and Tina Turner', song:'Proud Mary', riaa:'—' },
    { pos: 56, artist:'Chicago', song:'Beginnings / Color My World', riaa:'—' },
    { pos: 57, artist:'Bells', song:'Stay Awhile', riaa:'—' },
    { pos: 58, artist:'Stampeders', song:'Sweet City Woman', riaa:'—' },
    { pos: 59, artist:'Lobo', song:'Me And You And A Dog Named Boo', riaa:'—' },
    { pos: 60, artist:'Paul McCartney', song:'Another Day / Oh Woman, Oh Why', riaa:'—' },
    { pos: 61, artist:'Bread', song:'If', riaa:'—' },
    { pos: 62, artist:'Marvin Gaye', song:'Mercy Mercy Me (The Ecology)', riaa:'—' },
    { pos: 63, artist:'Brewer and Shipley', song:'One Toke Over The Line', riaa:'—' },
    { pos: 64, artist:'8th Day', song:'She\'s Not Just Another Woman', riaa:'—' },
    { pos: 65, artist:'Freda Payne', song:'Bring The Boys Home', riaa:'—' },
    { pos: 66, artist:'Rare Earth', song:'I Just Want To Celebrate', riaa:'—' },
    { pos: 67, artist:'Delaney and Bonnie and Friends', song:'Never Ending Song Of Love', riaa:'—' },
    { pos: 68, artist:'Freddy Hart', song:'Easy Loving', riaa:'—' },
    { pos: 69, artist:'Three Dog Night', song:'Liar', riaa:'—' },
    { pos: 70, artist:'Honey Cone', song:'Stick-up', riaa:'—' },
    { pos: 71, artist:'Mac and Katie Kissoon', song:'Chirpy Chirpy Cheep Cheep', riaa:'—' },
    { pos: 72, artist:'Andy Williams', song:'Love Story (Where Do I Begin)', riaa:'—' },
    { pos: 73, artist:'Cat Stevens', song:'Wild World', riaa:'—' },
    { pos: 74, artist:'Jerry Reed', song:'When You\'re Hot, You\'re Hot', riaa:'—' },
    { pos: 75, artist:'Beginning Of The End', song:'Funky Nassau', riaa:'—' },
    { pos: 76, artist:'Olivia Newton-John', song:'If Not For You', riaa:'—' },
    { pos: 77, artist:'King Floyd', song:'Groove Me', riaa:'—' },
    { pos: 78, artist:'Bobby Goldsboro', song:'Watching Scotty Grow', riaa:'—' },
    { pos: 79, artist:'Matthews\' Southern Comfort', song:'Woodstock', riaa:'—' },
    { pos: 80, artist:'Judy Collins', song:'Amazing Grace', riaa:'—' },
    { pos: 81, artist:'Dave Edmunds', song:'I Hear You Knocking', riaa:'—' },
    { pos: 82, artist:'Bee Gees', song:'Lonely Days', riaa:'—' },
    { pos: 83, artist:'Fortunes', song:'Here Comes That Rainy Day Feeling Again', riaa:'—' },
    { pos: 84, artist:'Who', song:'Won\'t Get Fooled Again', riaa:'—' },
    { pos: 85, artist:'Denise Lasalle', song:'Trapped By A Thing Called Love', riaa:'—' },
    { pos: 86, artist:'Jackson 5', song:'Mama\'s Pearl', riaa:'—' },
    { pos: 87, artist:'Buoys', song:'Timothy', riaa:'—' },
    { pos: 88, artist:'Partridge Family', song:'I Woke Up In Love This Morning', riaa:'—' },
    { pos: 89, artist:'Isaac Hayes', song:'Theme From "Shaft"', riaa:'Gold' },
    { pos: 90, artist:'Gladys Knight and The Pips', song:'If I Were Your Woman', riaa:'—' },
    { pos: 91, artist:'Neil Diamond', song:'I Am..I Said', riaa:'—' },
    { pos: 92, artist:'Paul Stookey', song:'Wedding Song (There Is Love)', riaa:'—' },
    { pos: 93, artist:'Wilson Pickett', song:'Don\'t Knock My Love, Pt. 1', riaa:'—' },
    { pos: 94, artist:'Doors', song:'Love Her Madly', riaa:'—' },
    { pos: 95, artist:'Richie Havens', song:'Here Comes The Sun', riaa:'—' },
    { pos: 96, artist:'Wadsworth Mansion', song:'Sweet Mary', riaa:'—' },
    { pos: 97, artist:'Brenda and The Tabulations', song:'Right On The Tip Of My Tongue', riaa:'—' },
    { pos: 98, artist:'Fifth Dimension', song:'One Less Bell To Answer', riaa:'Platinum' },
    { pos: 99, artist:'Doors', song:'Riders On The Storm', riaa:'—' },
    { pos:100, artist:'Perry Como', song:'It\'s Impossible', riaa:'—' }
  ],
  1972: [
    { pos:  1, artist:'Roberta Flack', song:'The First Time Ever I Saw Your Face', riaa:'—' },
    { pos:  2, artist:'Gilbert O\'Sullivan', song:'Alone Again (Naturally)', riaa:'—' },
    { pos:  3, artist:'Don McLean', song:'American Pie', riaa:'Multi-Platinum' },
    { pos:  4, artist:'Nilsson', song:'Without You', riaa:'—' },
    { pos:  5, artist:'Sammy Davis Jr.', song:'Candy Man', riaa:'—' },
    { pos:  6, artist:'Joe Tex', song:'I Gotcha', riaa:'—' },
    { pos:  7, artist:'Bill Withers', song:'Lean On Me', riaa:'—' },
    { pos:  8, artist:'Mac Davis', song:'Baby Don\'t Get Hooked On Me', riaa:'—' },
    { pos:  9, artist:'Melanie', song:'Brand New Key', riaa:'—' },
    { pos: 10, artist:'Wayne Newton', song:'Daddy Don\'t You Walk So Fast', riaa:'—' },
    { pos: 11, artist:'Al Green', song:'Let\'s Stay Together', riaa:'Platinum' },
    { pos: 12, artist:'Looking Glass', song:'Brandy (You\'re A Fine Girl)', riaa:'—' },
    { pos: 13, artist:'Chi-Lites', song:'Oh Girl', riaa:'—' },
    { pos: 14, artist:'Gallery', song:'Nice To Be With You', riaa:'—' },
    { pos: 15, artist:'Chuck Berry', song:'My Ding-A-Ling', riaa:'—' },
    { pos: 16, artist:'Luther Ingram', song:'If Loving You Is Wrong I Don\'t Want To Be Right', riaa:'—' },
    { pos: 17, artist:'Neil Young', song:'Heart Of Gold', riaa:'—' },
    { pos: 18, artist:'Stylistics', song:'Betcha By Golly, Wow', riaa:'—' },
    { pos: 19, artist:'Staple Singers', song:'I\'ll Take You There', riaa:'Gold' },
    { pos: 20, artist:'Michael Jackson', song:'Ben', riaa:'—' },
    { pos: 21, artist:'Robert John', song:'The Lion Sleeps Tonight', riaa:'—' },
    { pos: 22, artist:'Billy Preston', song:'Outa-Space', riaa:'—' },
    { pos: 23, artist:'War', song:'Slippin\' Into Darkness', riaa:'—' },
    { pos: 24, artist:'Hollies', song:'Long Cool Woman (In A Black Dress)', riaa:'Platinum' },
    { pos: 25, artist:'Mouth and MacNeal', song:'How Do You Do', riaa:'—' },
    { pos: 26, artist:'Neil Diamond', song:'Song Sung Blue', riaa:'—' },
    { pos: 27, artist:'America', song:'A Horse With No Name', riaa:'—' },
    { pos: 28, artist:'Hot Butter', song:'Popcorn', riaa:'—' },
    { pos: 29, artist:'Main Ingredient', song:'Everybody Plays The Fool', riaa:'—' },
    { pos: 30, artist:'Climax', song:'Precious And Few', riaa:'—' },
    { pos: 31, artist:'5th Dimension', song:'Last Night I Didn\'t Get To Sleep At All', riaa:'Platinum' },
    { pos: 32, artist:'Moody Blues', song:'Nights In White Satin', riaa:'—' },
    { pos: 33, artist:'Raspberries', song:'Go All The Way', riaa:'—' },
    { pos: 34, artist:'Cornelius Brothers and Sister Rose', song:'Too Late To Turn Back Now', riaa:'—' },
    { pos: 35, artist:'O\'Jays', song:'Back Stabbers', riaa:'—' },
    { pos: 36, artist:'Osmonds', song:'Down By The Lazy River', riaa:'—' },
    { pos: 37, artist:'Jonathan Edwards', song:'Sunshine', riaa:'—' },
    { pos: 38, artist:'Mel and Tim', song:'Starting All Over Again', riaa:'—' },
    { pos: 39, artist:'Badfinger', song:'Day Atter Day', riaa:'—' },
    { pos: 40, artist:'Elton John', song:'Rocket Man', riaa:'Multi-Platinum' },
    { pos: 41, artist:'Michael Jackson', song:'Rockin\' Robin', riaa:'—' },
    { pos: 42, artist:'Daniel Boone', song:'Beautiful Sunday', riaa:'—' },
    { pos: 43, artist:'Dennis Coffey and The Detroit Guitar Band', song:'Scorpio', riaa:'—' },
    { pos: 44, artist:'Cat Stevens', song:'Morning Has Broken', riaa:'—' },
    { pos: 45, artist:'Arlo Guthrie', song:'The City Of New Orleans', riaa:'—' },
    { pos: 46, artist:'Rick Nelson', song:'Garden Party', riaa:'—' },
    { pos: 47, artist:'Johnny Nash', song:'I Can See Clearly Now', riaa:'—' },
    { pos: 48, artist:'Elvis Presley', song:'Burning Love', riaa:'—' },
    { pos: 49, artist:'Betty Wright', song:'Clean Up Woman', riaa:'—' },
    { pos: 50, artist:'Argent', song:'Hold Your Head Up', riaa:'—' },
    { pos: 51, artist:'Chakachas', song:'Jungle Fever', riaa:'—' },
    { pos: 52, artist:'Bread', song:'Everything I Own', riaa:'—' },
    { pos: 53, artist:'Dramatics', song:'In The Rain', riaa:'—' },
    { pos: 54, artist:'Al Green', song:'Look What You Done For Me', riaa:'—' },
    { pos: 55, artist:'Donna Fargo', song:'The Happiest Girl In The Whole U.S.A.', riaa:'Gold' },
    { pos: 56, artist:'T. Rex', song:'Bang A Gong (Get It On)', riaa:'—' },
    { pos: 57, artist:'Paul Simon', song:'Mother And Child Reunion', riaa:'—' },
    { pos: 58, artist:'Roberta Flack and Donny Hathaway', song:'Where Is The Love', riaa:'—' },
    { pos: 59, artist:'Al Green', song:'I\'m Still In Love With You', riaa:'—' },
    { pos: 60, artist:'Derek and The Dominos', song:'Layla', riaa:'—' },
    { pos: 61, artist:'Aretha Franklin', song:'Day Dreaming', riaa:'—' },
    { pos: 62, artist:'Cher', song:'The Way Of Love', riaa:'—' },
    { pos: 63, artist:'Three Dog Night', song:'Black And White', riaa:'—' },
    { pos: 64, artist:'Dr. Hook and The Medicine Show', song:'Sylvia\'s Mother', riaa:'—' },
    { pos: 65, artist:'Carpenters', song:'Hurting Each Other', riaa:'—' },
    { pos: 66, artist:'Nilsson', song:'Coconut', riaa:'—' },
    { pos: 67, artist:'Donny Osmond', song:'Puppy Love', riaa:'—' },
    { pos: 68, artist:'Jim Croce', song:'You Don\'t Mess Around With Jim', riaa:'—' },
    { pos: 69, artist:'Commander Cody and His Lost Planet Airmen', song:'Hot Rod Lincoln', riaa:'—' },
    { pos: 70, artist:'Sonny and Cher', song:'A Cowboy\'s Work Is Never Done', riaa:'—' },
    { pos: 71, artist:'Apollo 100', song:'Joy', riaa:'—' },
    { pos: 72, artist:'Carly Simon', song:'Anticipation', riaa:'—' },
    { pos: 73, artist:'Three Dog Night', song:'Never Been To Spain', riaa:'—' },
    { pos: 74, artist:'Charlie Pride', song:'Kiss An Angel Good Morning', riaa:'—' },
    { pos: 75, artist:'Alice Cooper', song:'School\'s Out', riaa:'—' },
    { pos: 76, artist:'Chicago', song:'Saturday In The Park', riaa:'—' },
    { pos: 77, artist:'Joe Simon', song:'Drowning In The Sea Of Love', riaa:'—' },
    { pos: 78, artist:'Bill Withers', song:'Use Me', riaa:'—' },
    { pos: 79, artist:'Sly and The Family Stone', song:'Family Affair', riaa:'—' },
    { pos: 80, artist:'Jimmy Castor Bunch', song:'Troglodyte', riaa:'—' },
    { pos: 81, artist:'Redbone', song:'The Witch Queen Of New Orleans', riaa:'—' },
    { pos: 82, artist:'Curtis Mayfield', song:'Freddie\'s Dead', riaa:'—' },
    { pos: 83, artist:'Joe Simon', song:'Power Of Love', riaa:'—' },
    { pos: 84, artist:'Jerry Butler and Brenda Lee Eager', song:'Ain\'t Understanding Mellow', riaa:'—' },
    { pos: 85, artist:'Harry Chapin', song:'Taxi', riaa:'—' },
    { pos: 86, artist:'Beverly Bremers', song:'Don\'t Say You Don\'t Rememeer', riaa:'—' },
    { pos: 87, artist:'Bobby Vinton', song:'Sealed With A Kiss', riaa:'—' },
    { pos: 88, artist:'Todd Rundgren', song:'I Saw The Light', riaa:'—' },
    { pos: 89, artist:'Sailcat', song:'Motorcycle Mama', riaa:'—' },
    { pos: 90, artist:'Godspell', song:'Day By Day', riaa:'—' },
    { pos: 91, artist:'Yes', song:'Roundabout', riaa:'—' },
    { pos: 92, artist:'Jackson Browne', song:'Doctor My Eyes', riaa:'—' },
    { pos: 93, artist:'New Seekers', song:'I\'d Like To Teach The World To Sing', riaa:'—' },
    { pos: 94, artist:'Don Mclean', song:'Vincent / Castles In The Air', riaa:'—' },
    { pos: 95, artist:'Detroit Emeralds', song:'Baby Let Me Take You (In My Arms)', riaa:'—' },
    { pos: 96, artist:'Rick Springfield', song:'Speak To The Sky', riaa:'—' },
    { pos: 97, artist:'Hillside Singers', song:'I\'d Like To Teach The World To Sing', riaa:'—' },
    { pos: 98, artist:'Love Unlimited', song:'Walking In The Rain With The One I Love', riaa:'—' },
    { pos: 99, artist:'James Brown', song:'Good Foot, Pt. 1', riaa:'—' },
    { pos:100, artist:'Isley Bros.', song:'Pop That Thang', riaa:'—' }
  ],
  1973: [
    { pos:  1, artist:'Tony Orlando and Dawn', song:'Tie A Yellow Ribbon Round The Ole Oak Tree', riaa:'—' },
    { pos:  2, artist:'Jim Croce', song:'Bad Bad Leroy Brown', riaa:'—' },
    { pos:  3, artist:'Roberta Flack', song:'Killing Me Softly With His Song', riaa:'—' },
    { pos:  4, artist:'Marvin Gaye', song:'Let\'s Get It On', riaa:'—' },
    { pos:  5, artist:'Paul McCartney and Wings', song:'My Love', riaa:'—' },
    { pos:  6, artist:'Kris Kristofferson', song:'Why Me', riaa:'—' },
    { pos:  7, artist:'Elton John', song:'Crocodile Rock', riaa:'Platinum' },
    { pos:  8, artist:'Billy Preston', song:'Will It Go Round In Circles', riaa:'—' },
    { pos:  9, artist:'Carly Simon', song:'You\'re So Vain', riaa:'—' },
    { pos: 10, artist:'Diana Ross', song:'Touch Me In The Morning', riaa:'—' },
    { pos: 11, artist:'Vicki Lawrence', song:'The Night The Lights Went Out In Georgia', riaa:'—' },
    { pos: 12, artist:'Clint Holmes', song:'Playground In My Mind', riaa:'—' },
    { pos: 13, artist:'Stories', song:'Brother Louie', riaa:'—' },
    { pos: 14, artist:'Helen Reddy', song:'Delta Dawn', riaa:'—' },
    { pos: 15, artist:'Billy Paul', song:'Me And Mrs. Jones', riaa:'—' },
    { pos: 16, artist:'Edgar Winter Group', song:'Frankenstein', riaa:'—' },
    { pos: 17, artist:'Dobie Gray', song:'Drift Away', riaa:'—' },
    { pos: 18, artist:'Sweet', song:'Little Willy', riaa:'—' },
    { pos: 19, artist:'Stevie Wonder', song:'You Are The Sunshine Of My Life', riaa:'—' },
    { pos: 20, artist:'Cher', song:'Half Breed', riaa:'—' },
    { pos: 21, artist:'Isley Bros.', song:'That Lady', riaa:'—' },
    { pos: 22, artist:'Sylvia', song:'Pillow Talk', riaa:'—' },
    { pos: 23, artist:'Grand Funk Railroad', song:'We\'re An American Band', riaa:'—' },
    { pos: 24, artist:'Dr. John', song:'Right Place, Wrong Time', riaa:'—' },
    { pos: 25, artist:'Skylark', song:'Wildflower', riaa:'—' },
    { pos: 26, artist:'Stevie Wonder', song:'Superstition', riaa:'—' },
    { pos: 27, artist:'Paul Simon', song:'Loves Me Like A Rock', riaa:'—' },
    { pos: 28, artist:'Maureen McGovern', song:'The Morning After', riaa:'—' },
    { pos: 29, artist:'John Denver', song:'Rocky Mountain High', riaa:'Gold' },
    { pos: 30, artist:'Stealers Wheel', song:'Stuck In The Middle With You', riaa:'—' },
    { pos: 31, artist:'Three Dog Night', song:'Shambala', riaa:'—' },
    { pos: 32, artist:'O\'Jays', song:'Love Train', riaa:'—' },
    { pos: 33, artist:'Barry White', song:'I\'m Gonna Love You Just A Little More', riaa:'—' },
    { pos: 34, artist:'Tony Orlando and Dawn', song:'Say, Has Anybody Seen My Sweet Gypsy Rose', riaa:'—' },
    { pos: 35, artist:'Eddie Kendricks', song:'Keep On Truckin\' (Pt. 1)', riaa:'—' },
    { pos: 36, artist:'King Harvest', song:'Dancing In The Moonlight', riaa:'—' },
    { pos: 37, artist:'Anne Murray', song:'Danny\'s Song', riaa:'—' },
    { pos: 38, artist:'Bobby "Boris" Pickett and The Crypt Kickers', song:'Monster Mash', riaa:'—' },
    { pos: 39, artist:'Bloodstone', song:'Natural High', riaa:'Platinum' },
    { pos: 40, artist:'Seals and Crofts', song:'Diamond Girl', riaa:'—' },
    { pos: 41, artist:'Doobie Brothers', song:'Long Train Running', riaa:'—' },
    { pos: 42, artist:'George Harrison', song:'Give Me Love (Give Me Peace On Earth)', riaa:'—' },
    { pos: 43, artist:'Sly and The Family Stone', song:'If You Want Me To Stay', riaa:'—' },
    { pos: 44, artist:'Jermaine Jackson', song:'Daddy\'s Home', riaa:'—' },
    { pos: 45, artist:'Gladys Knight and The Pips', song:'Neither One Of Us (Wants To Be The First To Say Goodbye)', riaa:'—' },
    { pos: 46, artist:'New York City', song:'I\'m Doing Fine Now', riaa:'—' },
    { pos: 47, artist:'Spinners', song:'Could It Be I\'m Falling In Love', riaa:'—' },
    { pos: 48, artist:'Elton John', song:'Daniel', riaa:'Platinum' },
    { pos: 49, artist:'Gladys Knight and The Pips', song:'Midnight Train To Georgia', riaa:'—' },
    { pos: 50, artist:'Deep Purple', song:'Smoke On The Water', riaa:'—' },
    { pos: 51, artist:'Dr. Hook and The Medicine Show', song:'The Cover Of Rolling Stone', riaa:'—' },
    { pos: 52, artist:'Charlie Rich', song:'Behind Closed Doors', riaa:'Platinum' },
    { pos: 53, artist:'Loggins and Messina', song:'Your Mama Don\'t Dance', riaa:'—' },
    { pos: 54, artist:'Chicago', song:'Feelin\' Stronger Every Day', riaa:'—' },
    { pos: 55, artist:'War', song:'The Cisco Kid', riaa:'—' },
    { pos: 56, artist:'Wings', song:'Live And Let Die', riaa:'—' },
    { pos: 57, artist:'Hurricane Smith', song:'Oh, Babe, What Would You Say?', riaa:'—' },
    { pos: 58, artist:'Johnnie Taylor', song:'I Believe In You', riaa:'—' },
    { pos: 59, artist:'Carpenters', song:'Sing', riaa:'—' },
    { pos: 60, artist:'Four Tops', song:'Ain\'t No Woman (Like The One I Got)', riaa:'—' },
    { pos: 61, artist:'Eric Weissberg and Steve Mandel', song:'Dueling Banjos', riaa:'—' },
    { pos: 62, artist:'Stevie Wonder', song:'Higher Ground', riaa:'—' },
    { pos: 63, artist:'Al Green', song:'Here I Am (Come And Take Me)', riaa:'—' },
    { pos: 64, artist:'B.W. Stevenson', song:'My Maria', riaa:'—' },
    { pos: 65, artist:'Curtis Mayfield', song:'Superfly', riaa:'—' },
    { pos: 66, artist:'Gilbert O\'Sullivan', song:'Get Down', riaa:'—' },
    { pos: 67, artist:'Edward Bear', song:'Last Song', riaa:'—' },
    { pos: 68, artist:'Steely Dan', song:'Reelin\' In The Years', riaa:'—' },
    { pos: 69, artist:'Focus', song:'Hocus Pocus', riaa:'—' },
    { pos: 70, artist:'Carpenters', song:'Yesterday Once More', riaa:'—' },
    { pos: 71, artist:'Bette Midler', song:'Boogie Woogie Bugle Boy', riaa:'—' },
    { pos: 72, artist:'Gilbert O\'Sullivan', song:'Clair', riaa:'—' },
    { pos: 73, artist:'Steely Dan', song:'Do It Again', riaa:'—' },
    { pos: 74, artist:'Paul Simon', song:'Kodachrome', riaa:'—' },
    { pos: 75, artist:'Timmy Thomas', song:'Why Can\'t We Live Together', riaa:'—' },
    { pos: 76, artist:'Tower Of Power', song:'So Very Hard To Go', riaa:'—' },
    { pos: 77, artist:'Bette Midler', song:'Do You Want To Dance?', riaa:'—' },
    { pos: 78, artist:'Johnny Rivers', song:'Rockin\' Pneumonia And The Boogie Woogie Flu', riaa:'—' },
    { pos: 79, artist:'Allman Brothers', song:'Ramblin\' Man', riaa:'—' },
    { pos: 80, artist:'Temptations', song:'Masterpiece', riaa:'Gold' },
    { pos: 81, artist:'Helen Reddy', song:'Peaceful', riaa:'—' },
    { pos: 82, artist:'Spinners', song:'One Of A Kind (Love Affair)', riaa:'—' },
    { pos: 83, artist:'Donna Fargo', song:'Funny Face', riaa:'—' },
    { pos: 84, artist:'Ohio Players', song:'Funky Worm', riaa:'—' },
    { pos: 85, artist:'Rolling Stones', song:'Angie', riaa:'—' },
    { pos: 86, artist:'Blue Ridge Rangers', song:'Jambalaya (On The Bayou)', riaa:'—' },
    { pos: 87, artist:'Lobo', song:'Don\'t Expect Me To Be Your Friend', riaa:'—' },
    { pos: 88, artist:'Stylistics', song:'Break Up To Make Up', riaa:'—' },
    { pos: 89, artist:'Jud Strunk', song:'Daisy A Day', riaa:'—' },
    { pos: 90, artist:'Deodato', song:'Also Sprach Zarathustra (2001)', riaa:'—' },
    { pos: 91, artist:'Johnny Nash', song:'Stir It Up', riaa:'—' },
    { pos: 92, artist:'Pink Floyd', song:'Money', riaa:'—' },
    { pos: 93, artist:'War', song:'Gypsy Man', riaa:'—' },
    { pos: 94, artist:'War', song:'The World Is A Ghetto', riaa:'—' },
    { pos: 95, artist:'Pointer Sisters', song:'Yes We Can Can', riaa:'—' },
    { pos: 96, artist:'Edgar Winter Group', song:'Free Ride', riaa:'—' },
    { pos: 97, artist:'David Bowie', song:'Space Oddity', riaa:'—' },
    { pos: 98, artist:'Albert Hammond', song:'It Never Rains In Southern California', riaa:'—' },
    { pos: 99, artist:'Donny Osmond', song:'The Twelfth Of Never', riaa:'—' },
    { pos:100, artist:'Temptations', song:'Papa Was A Rolling Stone', riaa:'Platinum' }
  ],
  1974: [
    { pos:  1, artist:'Barbra Streisand', song:'The Way We Were', riaa:'Platinum' },
    { pos:  2, artist:'Terry Jacks', song:'Seasons In The Sun', riaa:'—' },
    { pos:  3, artist:'Love Unlimited Orchestra', song:'Love\'s Theme', riaa:'—' },
    { pos:  4, artist:'Redbone', song:'Come And Get Your Love', riaa:'—' },
    { pos:  5, artist:'Jackson 5', song:'Dancing Machine', riaa:'—' },
    { pos:  6, artist:'Grand Funk Railroad', song:'The Loco-Motion', riaa:'—' },
    { pos:  7, artist:'MFSB', song:'TSOP', riaa:'—' },
    { pos:  8, artist:'Ray Stevens', song:'The Streak', riaa:'—' },
    { pos:  9, artist:'Elton John', song:'Bennie And The Jets', riaa:'—' },
    { pos: 10, artist:'Mac Davis', song:'One Hell Of A Woman', riaa:'—' },
    { pos: 11, artist:'Aretha Franklin', song:'Until You Come Back To Me (That\'s What I\'m Gonna Do)', riaa:'—' },
    { pos: 12, artist:'Kool and The Gang', song:'Jungle Boogie', riaa:'—' },
    { pos: 13, artist:'Maria Muldaur', song:'Midnight At The Oasis', riaa:'—' },
    { pos: 14, artist:'Stylistics', song:'You Make Me Feel Brand New', riaa:'—' },
    { pos: 15, artist:'Al Wilson', song:'Show And Tell', riaa:'—' },
    { pos: 16, artist:'Jim Stafford', song:'Spiders And Snakes', riaa:'—' },
    { pos: 17, artist:'David Essex', song:'Rock On', riaa:'—' },
    { pos: 18, artist:'John Denver', song:'Sunshine On My Shoulders', riaa:'—' },
    { pos: 19, artist:'Blue Magic', song:'Sideshow', riaa:'—' },
    { pos: 20, artist:'Blue Swede', song:'Hooked On A Feeling', riaa:'—' },
    { pos: 21, artist:'Bo Donaldson and The Heywoods', song:'Billy Don\'t Be A Hero', riaa:'—' },
    { pos: 22, artist:'Paul McCartney and Wings', song:'Band On The Run', riaa:'—' },
    { pos: 23, artist:'Charlie Rich', song:'The Most Beautiful Girl', riaa:'—' },
    { pos: 24, artist:'Jim Croce', song:'Time In A Bottle', riaa:'—' },
    { pos: 25, artist:'John Denver', song:'Annie\'s Song', riaa:'—' },
    { pos: 26, artist:'Paul Anka', song:'(You\'re) Having My Baby', riaa:'—' },
    { pos: 27, artist:'Olivia Newton-John', song:'Let Me Be There', riaa:'—' },
    { pos: 28, artist:'Gordon Lightfoot', song:'Sundown', riaa:'—' },
    { pos: 29, artist:'Andy Kim', song:'Rock Me Gently', riaa:'—' },
    { pos: 30, artist:'Eddie Kendricks', song:'Boogie Down', riaa:'—' },
    { pos: 31, artist:'Ringo Starr', song:'You\'re Sixteen', riaa:'—' },
    { pos: 32, artist:'Olivia Newton-John', song:'If You Love Me (Let Me Know)', riaa:'—' },
    { pos: 33, artist:'Cher', song:'Dark Lady', riaa:'—' },
    { pos: 34, artist:'Gladys Knight and The Pips', song:'Best Thing That Ever Happened To Me', riaa:'—' },
    { pos: 35, artist:'Roberta Flack', song:'Feel Like Makin\' Love', riaa:'—' },
    { pos: 36, artist:'Main Ingredient', song:'Just Don\'t Want To Be Lonely', riaa:'—' },
    { pos: 37, artist:'Billy Preston', song:'Nothing From Nothing', riaa:'—' },
    { pos: 38, artist:'George McCrae', song:'Rock Your Baby', riaa:'—' },
    { pos: 39, artist:'Carpenters', song:'Top Of The World', riaa:'—' },
    { pos: 40, artist:'Steve Miller Band', song:'The Joker', riaa:'—' },
    { pos: 41, artist:'Gladys Knight and The Pips', song:'I\'ve Got To Use My Imagination', riaa:'—' },
    { pos: 42, artist:'Three Dog Night', song:'The Show Must Go On', riaa:'—' },
    { pos: 43, artist:'Hues Corporation', song:'Rock The Boat', riaa:'—' },
    { pos: 44, artist:'Brownsville Station', song:'Smokin\' In The Boy\'s Room', riaa:'—' },
    { pos: 45, artist:'Stevie Wonder', song:'Living For The City', riaa:'—' },
    { pos: 46, artist:'Dionne Warwick and The Spinners', song:'Then Came You', riaa:'—' },
    { pos: 47, artist:'Paper Lace', song:'The Night Chicago Died', riaa:'—' },
    { pos: 48, artist:'Marvin Hamlisch', song:'The Entertainer', riaa:'—' },
    { pos: 49, artist:'ABBA', song:'Waterloo', riaa:'—' },
    { pos: 50, artist:'Hollies', song:'The Air That I Breathe', riaa:'—' },
    { pos: 51, artist:'Steely Dan', song:'Rikki Don\'t Lose That Number', riaa:'—' },
    { pos: 52, artist:'Carly Simon', song:'Mockingbird', riaa:'—' },
    { pos: 53, artist:'Joni Mitchell', song:'Help Me', riaa:'—' },
    { pos: 54, artist:'Anne Murray', song:'You Won\'t See Me', riaa:'—' },
    { pos: 55, artist:'Barry White', song:'Never, Never Gonna Give You Up', riaa:'—' },
    { pos: 56, artist:'Rufus', song:'Tell Me Something Good', riaa:'—' },
    { pos: 57, artist:'Helen Reddy', song:'You And Me Against The World', riaa:'—' },
    { pos: 58, artist:'Righteous Brothers', song:'Rock And Roll Heaven', riaa:'—' },
    { pos: 59, artist:'Kool and The Gang', song:'Hollywood Swinging', riaa:'—' },
    { pos: 60, artist:'William Devaughn', song:'Be Thankful For What You Got', riaa:'—' },
    { pos: 61, artist:'Johnny Bristol', song:'Hang On In There Baby', riaa:'—' },
    { pos: 62, artist:'Mocedades', song:'Eres Tu (Touch The Wind)', riaa:'—' },
    { pos: 63, artist:'Bachman-Turner Overdrive', song:'Takin\' Care Of Business', riaa:'—' },
    { pos: 64, artist:'Golden Earring', song:'Radar Love', riaa:'—' },
    { pos: 65, artist:'Dave Loggins', song:'Please Come To Boston', riaa:'—' },
    { pos: 66, artist:'Wet Willie', song:'Keep On Smilin\'', riaa:'—' },
    { pos: 67, artist:'Bobby Womack', song:'Lookin\' For A Love', riaa:'—' },
    { pos: 68, artist:'O\'Jays', song:'Put Your Hands Together', riaa:'—' },
    { pos: 69, artist:'Gladys Knight and The Pips', song:'On And On', riaa:'—' },
    { pos: 70, artist:'Cat Stevens', song:'Oh Very Young', riaa:'—' },
    { pos: 71, artist:'Helen Reddy', song:'Leave Me Alone (Ruby Red Dress)', riaa:'—' },
    { pos: 72, artist:'Chicago', song:'(I\'ve Been) Searchin\' So Long', riaa:'—' },
    { pos: 73, artist:'Elton John', song:'Goodbye Yellow Brick Road', riaa:'Multi-Platinum' },
    { pos: 74, artist:'Ringo Starr', song:'Oh My My', riaa:'—' },
    { pos: 75, artist:'O\'Jays', song:'For The Love Of Money', riaa:'—' },
    { pos: 76, artist:'Eric Clapton', song:'I Shot The Sheriff', riaa:'—' },
    { pos: 77, artist:'Paul McCartney and Wings', song:'Jet', riaa:'—' },
    { pos: 78, artist:'Elton John', song:'Don\'t Let The Sun Go Down On Me', riaa:'—' },
    { pos: 79, artist:'Mike Oldfield', song:'Tubular Bells', riaa:'—' },
    { pos: 80, artist:'Anne Murray', song:'A Love Song', riaa:'—' },
    { pos: 81, artist:'Donny and Marie Osmond', song:'I\'m Leaving It All Up To You', riaa:'—' },
    { pos: 82, artist:'Todd Rundgren', song:'Hello, It\'s Me', riaa:'—' },
    { pos: 83, artist:'Tom T. Hall', song:'I Love', riaa:'—' },
    { pos: 84, artist:'Guess Who', song:'Clap For The Wolfman', riaa:'—' },
    { pos: 85, artist:'Jim Croce', song:'I\'ll Have To Say I Love You In A Song', riaa:'—' },
    { pos: 86, artist:'Sister Janet Mead', song:'The Lord\'s Prayer', riaa:'—' },
    { pos: 87, artist:'Lamont Dozier', song:'Trying To Hold On To My Woman', riaa:'—' },
    { pos: 88, artist:'Stevie Wonder', song:'Don\'t You Worry \'Bout A Thing', riaa:'—' },
    { pos: 89, artist:'Charlie Rich', song:'A Very Special Love Song', riaa:'—' },
    { pos: 90, artist:'Jim Stafford', song:'My Girl Bill', riaa:'—' },
    { pos: 91, artist:'Diana Ross and Marvin Gaye', song:'My Mistake Was To Love You', riaa:'—' },
    { pos: 92, artist:'Paul McCartney and Wings', song:'Helen Wheels', riaa:'—' },
    { pos: 93, artist:'Jim Stafford', song:'Wildwood Weed', riaa:'—' },
    { pos: 94, artist:'First Class', song:'Beach Baby', riaa:'—' },
    { pos: 95, artist:'War', song:'Me And Baby Brother', riaa:'—' },
    { pos: 96, artist:'Stylistics', song:'Rockin\' Roll Baby', riaa:'—' },
    { pos: 97, artist:'Olivia Newton-John', song:'I Honestly Love You', riaa:'—' },
    { pos: 98, artist:'Chicago', song:'Call On Me', riaa:'—' },
    { pos: 99, artist:'Fancy', song:'Wild Thing', riaa:'—' },
    { pos:100, artist:'Spinners', song:'Mighty Love, Pt. 1', riaa:'—' }
  ],
  1975: [
    { pos:  1, artist:'Captain and Tennille', song:'Love Will Keep Us Together', riaa:'—' },
    { pos:  2, artist:'Glen Campbell', song:'Rhinestone Cowboy', riaa:'—' },
    { pos:  3, artist:'Elton John', song:'Philadelphia Freedom', riaa:'Platinum' },
    { pos:  4, artist:'Freddy Fender', song:'Before The Next Teardrop Falls', riaa:'—' },
    { pos:  5, artist:'Frankie Valli', song:'My Eyes Adored You', riaa:'—' },
    { pos:  6, artist:'Earth, Wind and Fire', song:'Shining Star', riaa:'—' },
    { pos:  7, artist:'David Bowie', song:'Fame', riaa:'—' },
    { pos:  8, artist:'Neil Sedaka', song:'Laughter In The Rain', riaa:'—' },
    { pos:  9, artist:'Eagles', song:'One Of These Nights', riaa:'—' },
    { pos: 10, artist:'John Denver', song:'Thank God I\'m A Country Boy', riaa:'—' },
    { pos: 11, artist:'Bee Gees', song:'Jive Talkin\'', riaa:'—' },
    { pos: 12, artist:'Eagles', song:'Best Of My Love', riaa:'—' },
    { pos: 13, artist:'Minnie Riperton', song:'Lovin\' You', riaa:'—' },
    { pos: 14, artist:'Carl Douglas', song:'Kung Fu Fighting', riaa:'—' },
    { pos: 15, artist:'Doobie Brothers', song:'Black Water', riaa:'—' },
    { pos: 16, artist:'Sweet', song:'Ballroom Blitz', riaa:'—' },
    { pos: 17, artist:'B.J. Thomas', song:'(Hey Wont You Play) Another Somebody Done Somebody Wrong Song', riaa:'—' },
    { pos: 18, artist:'Tony Orlando and Dawn', song:'He Don\'t Love You (Like I Love You)', riaa:'—' },
    { pos: 19, artist:'Janis Ian', song:'At Seventeen', riaa:'—' },
    { pos: 20, artist:'Average White Band', song:'Pick Up The Pieces', riaa:'—' },
    { pos: 21, artist:'Van McCoy and The Soul City Symphony', song:'The Hustle', riaa:'—' },
    { pos: 22, artist:'Labelle', song:'Lady Marmalade', riaa:'—' },
    { pos: 23, artist:'War', song:'Why Can\'t We Be Friends?', riaa:'—' },
    { pos: 24, artist:'Major Harris', song:'Love Won\'t Let Me Wait', riaa:'—' },
    { pos: 25, artist:'Stevie Wonder', song:'Boogie On Reggae Woman', riaa:'—' },
    { pos: 26, artist:'Freddy Fender', song:'Wasted Days And Wasted Nights', riaa:'—' },
    { pos: 27, artist:'Isley Brothers', song:'Fight The Power, Pt. 1', riaa:'—' },
    { pos: 28, artist:'Helen Reddy', song:'Angie Baby', riaa:'—' },
    { pos: 29, artist:'Ozark Mountain Daredevil', song:'Jackie Blue', riaa:'—' },
    { pos: 30, artist:'Ohio Players', song:'Fire', riaa:'—' },
    { pos: 31, artist:'Pilot', song:'Magic', riaa:'—' },
    { pos: 32, artist:'Carpenters', song:'Please Mr. Postman', riaa:'—' },
    { pos: 33, artist:'America', song:'Sister Golden Hair', riaa:'—' },
    { pos: 34, artist:'Elton John', song:'Lucy In The Sky With Diamonds', riaa:'—' },
    { pos: 35, artist:'Barry Manilow', song:'Mandy', riaa:'—' },
    { pos: 36, artist:'Olivia Newton-John', song:'Have You Never Been Mellow', riaa:'—' },
    { pos: 37, artist:'Barry Manilow', song:'Could It Be Magic', riaa:'—' },
    { pos: 38, artist:'Harry Chapin', song:'Cat\'s In The Cradle', riaa:'—' },
    { pos: 39, artist:'Michael Murphy', song:'Wildfire', riaa:'—' },
    { pos: 40, artist:'Jessi Colter', song:'I\'m Not Lisa', riaa:'—' },
    { pos: 41, artist:'Wings', song:'Listen To What The Man Said', riaa:'—' },
    { pos: 42, artist:'10cc', song:'I\'m Not In Love', riaa:'—' },
    { pos: 43, artist:'Billy Swan', song:'I Can Help', riaa:'—' },
    { pos: 44, artist:'Hamilton, Joe Frank and Reynolds', song:'Fallin\' In Love', riaa:'—' },
    { pos: 45, artist:'Morris Albert', song:'Feelings', riaa:'—' },
    { pos: 46, artist:'Sammy Johns', song:'Chevy Van', riaa:'—' },
    { pos: 47, artist:'Linda Ronstadt', song:'When Will I Be Loved', riaa:'—' },
    { pos: 48, artist:'Barry White', song:'You\'re The First, The Last, My Everything', riaa:'—' },
    { pos: 49, artist:'Olivia Newton-John', song:'Please Mr Please', riaa:'—' },
    { pos: 50, artist:'Linda Ronstadt', song:'You\'re No Good', riaa:'—' },
    { pos: 51, artist:'Bazuka', song:'Dynomite', riaa:'—' },
    { pos: 52, artist:'Blackbyrds', song:'Walking In Rhythm', riaa:'—' },
    { pos: 53, artist:'Gladys Knight and The Pips', song:'The Way We Were / Try To Remember', riaa:'—' },
    { pos: 54, artist:'Melissa Manchester', song:'Midnight Blue', riaa:'—' },
    { pos: 55, artist:'Sugarloaf', song:'Don\'t Call Us, We\'ll Call You', riaa:'—' },
    { pos: 56, artist:'Phoebe Snow', song:'Poetry Man', riaa:'—' },
    { pos: 57, artist:'Ace', song:'How Long', riaa:'—' },
    { pos: 58, artist:'B.T. Express', song:'Express', riaa:'—' },
    { pos: 59, artist:'Earth, Wind and Fire', song:'That\'s The Way Of The World', riaa:'—' },
    { pos: 60, artist:'Styx', song:'Lady', riaa:'—' },
    { pos: 61, artist:'Grand Funk', song:'Bad Time', riaa:'—' },
    { pos: 62, artist:'Alice Cooper', song:'Only Women Bleed', riaa:'—' },
    { pos: 63, artist:'Carol Douglas', song:'Doctor\'s Orders', riaa:'—' },
    { pos: 64, artist:'K.C. and The Sunshine Band', song:'Get Down Tonight', riaa:'—' },
    { pos: 65, artist:'Joe Cocker', song:'You Are So Beautiful / It\'s A Sin When You Love Somebody', riaa:'—' },
    { pos: 66, artist:'Paul Anka and Odia Coates', song:'One Man Woman-One Woman Man', riaa:'—' },
    { pos: 67, artist:'Bad Company', song:'Feel Like Makin\' Love', riaa:'—' },
    { pos: 68, artist:'James Taylor', song:'How Sweet It Is (To Be Loved by You)', riaa:'—' },
    { pos: 69, artist:'Orleans', song:'Dance With Me', riaa:'Gold' },
    { pos: 70, artist:'Average White Band', song:'Cut The Cake', riaa:'—' },
    { pos: 71, artist:'Gloria Gaynor', song:'Never Can Say Goodbye', riaa:'—' },
    { pos: 72, artist:'Paul Anka', song:'I Don\'t Like To Sleep Alone', riaa:'—' },
    { pos: 73, artist:'Donny and Marie Osmond', song:'Morning Side Of The Mountain', riaa:'—' },
    { pos: 74, artist:'Grand Funk', song:'Some Kind Of Wonderful', riaa:'—' },
    { pos: 75, artist:'Three Degrees', song:'When Will I See You Again', riaa:'Platinum' },
    { pos: 76, artist:'Joe Simon', song:'Get Down, Get Down (Get On The Floor)', riaa:'—' },
    { pos: 77, artist:'John Denver', song:'I\'m Sorry / Calypso', riaa:'—' },
    { pos: 78, artist:'Queen', song:'Killer Queen', riaa:'—' },
    { pos: 79, artist:'Eddie Kendricks', song:'Shoeshine Boy', riaa:'—' },
    { pos: 80, artist:'B.T. Express', song:'Do It (Til You\'re Satisfied)', riaa:'—' },
    { pos: 81, artist:'Electric Light Orchestra', song:'Can\'t Get It Out Of My Head', riaa:'—' },
    { pos: 82, artist:'Al Green', song:'Sha-La-La (Make Me Happy)', riaa:'—' },
    { pos: 83, artist:'America', song:'Lonely People', riaa:'—' },
    { pos: 84, artist:'Rufus', song:'You Got The Love', riaa:'—' },
    { pos: 85, artist:'Mike Post', song:'The Rockford Files', riaa:'—' },
    { pos: 86, artist:'Tavares', song:'It Only Takes A Minute', riaa:'—' },
    { pos: 87, artist:'Ringo Starr', song:'No No Song / Snookeroo', riaa:'—' },
    { pos: 88, artist:'Paul McCartney and Wings', song:'Junior\'s Farm / Sally G', riaa:'—' },
    { pos: 89, artist:'Jethro Tull', song:'Bungle In The Jungle', riaa:'—' },
    { pos: 90, artist:'Leo Sayer', song:'Long Tall Glasses (I Can Dance)', riaa:'—' },
    { pos: 91, artist:'Elton John', song:'Someone Saved My Life Tonight', riaa:'—' },
    { pos: 92, artist:'Ray Stevens', song:'Misty', riaa:'—' },
    { pos: 93, artist:'Neil Sedaka', song:'Bad Blood', riaa:'—' },
    { pos: 94, artist:'Carpenters', song:'Only Yesterday', riaa:'—' },
    { pos: 95, artist:'Dwight Twilley Band', song:'I\'m On Fire', riaa:'—' },
    { pos: 96, artist:'Ringo Starr', song:'Only You', riaa:'—' },
    { pos: 97, artist:'Amazing Rhythm Aces', song:'Third Rate Romance', riaa:'—' },
    { pos: 98, artist:'Bachman-Turner Overdrive', song:'You Aint Seen Nothin\' Yet / Free Wheelin\'', riaa:'—' },
    { pos: 99, artist:'Frankie Valli', song:'Swearin\' To God', riaa:'—' },
    { pos:100, artist:'Disco Tex and The Sex-O-lettes', song:'Get Dancin\'', riaa:'—' }
  ],
  1976: [
    { pos:  1, artist:'Wings', song:'Silly Love Songs', riaa:'—' },
    { pos:  2, artist:'Elton John and Kiki Dee', song:'Don\'t Go Breaking My Heart', riaa:'—' },
    { pos:  3, artist:'Johnnie Taylor', song:'Disco Lady', riaa:'—' },
    { pos:  4, artist:'Four Seasons', song:'December, 1963 (Oh, What A Night)', riaa:'—' },
    { pos:  5, artist:'Wild Cherry', song:'Play That Funky Music', riaa:'—' },
    { pos:  6, artist:'Manhattans', song:'Kiss And Say Goodbye', riaa:'—' },
    { pos:  7, artist:'Miracles', song:'Love Machine (Part 1)', riaa:'—' },
    { pos:  8, artist:'Paul Simon', song:'50 Ways To Leave Your Lover', riaa:'—' },
    { pos:  9, artist:'Gary Wright', song:'Love Is Alive', riaa:'—' },
    { pos: 10, artist:'Walter Murphy and The Big Apple Band', song:'A Fifth Of Beethoven', riaa:'—' },
    { pos: 11, artist:'Daryl Hall and John Oates', song:'Sara Smile', riaa:'—' },
    { pos: 12, artist:'Starland Vocal Band', song:'Afternoon Delight', riaa:'—' },
    { pos: 13, artist:'Barry Manilow', song:'I Write The Songs', riaa:'—' },
    { pos: 14, artist:'Silver Convention', song:'Fly, Robin, Fly', riaa:'—' },
    { pos: 15, artist:'Diana Ross', song:'Love Hangover', riaa:'—' },
    { pos: 16, artist:'Seals and Crofts', song:'Get Closer', riaa:'—' },
    { pos: 17, artist:'Andrea True Connection', song:'More, More, More', riaa:'—' },
    { pos: 18, artist:'Queen', song:'Bohemian Rhapsody', riaa:'Diamond' },
    { pos: 19, artist:'Dorothy Moore', song:'Misty Blue', riaa:'—' },
    { pos: 20, artist:'Sylvers', song:'Boogie Fever', riaa:'—' },
    { pos: 21, artist:'England Dan and John Ford Coley', song:'I\'d Really Love To See You Tonight', riaa:'—' },
    { pos: 22, artist:'Hot Chocolate', song:'You Sexy Thing', riaa:'—' },
    { pos: 23, artist:'Nazareth', song:'Love Hurts', riaa:'—' },
    { pos: 24, artist:'Silver Convention', song:'Get Up And Boogie', riaa:'—' },
    { pos: 25, artist:'Eagles', song:'Take It To The Limit', riaa:'—' },
    { pos: 26, artist:'K.C. and The Sunshine Band', song:'(Shake, Shake, Shake) Shake Your Booty', riaa:'—' },
    { pos: 27, artist:'Commodores', song:'Sweet Love', riaa:'—' },
    { pos: 28, artist:'Maxine Nightingale', song:'Right Back Where We Started From', riaa:'—' },
    { pos: 29, artist:'Rhythm Heritage', song:'Theme From "S.W.A.T"', riaa:'—' },
    { pos: 30, artist:'Ohio Players', song:'Love Rollercoaster', riaa:'—' },
    { pos: 31, artist:'Bee Gees', song:'You Should Be Dancing', riaa:'—' },
    { pos: 32, artist:'Lou Rawls', song:'You\'ll Never Find Another Love Like Mine', riaa:'—' },
    { pos: 33, artist:'David Bowie', song:'Golden Years', riaa:'—' },
    { pos: 34, artist:'Starbuck', song:'Moonlight Feels Right', riaa:'—' },
    { pos: 35, artist:'Dr. Hook', song:'Only Sixteen', riaa:'—' },
    { pos: 36, artist:'Bellamy Brothers', song:'Let Your Love Flow', riaa:'—' },
    { pos: 37, artist:'Gary Wright', song:'Dream Weaver', riaa:'—' },
    { pos: 38, artist:'Vicki Sue Robinson', song:'Turn The Beat Around', riaa:'Gold' },
    { pos: 39, artist:'Captain and Tennille', song:'Lonely Night (Angel Face)', riaa:'—' },
    { pos: 40, artist:'Eric Carmen', song:'All By Myself', riaa:'—' },
    { pos: 41, artist:'Donna Summer', song:'Love To Love You Baby', riaa:'—' },
    { pos: 42, artist:'Donny and Marie Osmond', song:'Deep Purple', riaa:'—' },
    { pos: 43, artist:'Diana Ross', song:'Theme From "Mahogany"', riaa:'—' },
    { pos: 44, artist:'Rufus', song:'Sweet Thing', riaa:'—' },
    { pos: 45, artist:'K.C. and The Sunshine Band', song:'That\'s The Way I Like It', riaa:'—' },
    { pos: 46, artist:'Dr. Hook', song:'A Little Bit More', riaa:'—' },
    { pos: 47, artist:'Henry Gross', song:'Shannon', riaa:'—' },
    { pos: 48, artist:'Chicago', song:'If You Leave Me Now', riaa:'Platinum' },
    { pos: 49, artist:'Boz Scaggs', song:'Lowdown', riaa:'—' },
    { pos: 50, artist:'Peter Frampton', song:'Show Me The Way', riaa:'—' },
    { pos: 51, artist:'Aerosmith', song:'Dream On', riaa:'—' },
    { pos: 52, artist:'O\'Jays', song:'I Love Music (Pt. 1)', riaa:'—' },
    { pos: 53, artist:'Fleetwood Mac', song:'Say You Love Me', riaa:'—' },
    { pos: 54, artist:'Paul Anka', song:'Times Of Your Life', riaa:'—' },
    { pos: 55, artist:'Cliff Richard', song:'Devil Woman', riaa:'—' },
    { pos: 56, artist:'Elvin Bishop', song:'Fooled Around And Fell In Love', riaa:'—' },
    { pos: 57, artist:'C.W. McCall', song:'Convoy', riaa:'—' },
    { pos: 58, artist:'John Sebastian', song:'Welcome Back', riaa:'—' },
    { pos: 59, artist:'Earth, Wind and Fire', song:'Sing A Song', riaa:'—' },
    { pos: 60, artist:'Tavares', song:'Heaven Must Be Missing An Angel', riaa:'—' },
    { pos: 61, artist:'Brothers Johnson', song:'I\'ll Be Good To You', riaa:'—' },
    { pos: 62, artist:'Captain and Tennille', song:'Shop Around', riaa:'—' },
    { pos: 63, artist:'Bay City Rollers', song:'Saturday Night', riaa:'—' },
    { pos: 64, artist:'Elton John', song:'Island Girl', riaa:'Platinum' },
    { pos: 65, artist:'Staple Singers', song:'Let\'s Do It Again', riaa:'—' },
    { pos: 66, artist:'Wings', song:'Let \'Em In', riaa:'—' },
    { pos: 67, artist:'Wing and A Prayer Fife and Drum Corps', song:'Baby Face', riaa:'—' },
    { pos: 68, artist:'George Benson', song:'This Masquerade', riaa:'—' },
    { pos: 69, artist:'Electric Light Orchestra', song:'Evil Woman', riaa:'Gold' },
    { pos: 70, artist:'Silver', song:'Wham Bam', riaa:'—' },
    { pos: 71, artist:'Keith Carradine', song:'I\'m Easy', riaa:'—' },
    { pos: 72, artist:'Harold Melvin and The Bluenotes', song:'Wake Up Everybody (Pt. 1)', riaa:'—' },
    { pos: 73, artist:'War', song:'Summer', riaa:'—' },
    { pos: 74, artist:'John Travolta', song:'Let Her In', riaa:'—' },
    { pos: 75, artist:'Sweet', song:'Fox On The Run', riaa:'—' },
    { pos: 76, artist:'Fleetwood Mac', song:'Rhiannon (Will You Ever Win)', riaa:'—' },
    { pos: 77, artist:'Beatles', song:'Got To Get You Into My Life', riaa:'Gold' },
    { pos: 78, artist:'Bee Gees', song:'Fanny (Be Tender With My Love)', riaa:'—' },
    { pos: 79, artist:'Earth, Wind and Fire', song:'Getaway', riaa:'—' },
    { pos: 80, artist:'Daryl Hall and John Oates', song:'She\'s Gone', riaa:'—' },
    { pos: 81, artist:'Beach Boys', song:'Rock And Roll Music', riaa:'—' },
    { pos: 82, artist:'Orleans', song:'Still The One', riaa:'Gold' },
    { pos: 83, artist:'Queen', song:'You\'re My Best Friend', riaa:'Platinum' },
    { pos: 84, artist:'Jefferson Starship', song:'With Your Love', riaa:'—' },
    { pos: 85, artist:'Foghat', song:'Slow Ride', riaa:'—' },
    { pos: 86, artist:'Ohio Players', song:'Who\'d She Coo', riaa:'—' },
    { pos: 87, artist:'David Ruffin', song:'Walk Away From Love', riaa:'—' },
    { pos: 88, artist:'Peter Frampton', song:'Baby, I Love Your Way', riaa:'—' },
    { pos: 89, artist:'Candi Staton', song:'Young Hearts Run Free', riaa:'—' },
    { pos: 90, artist:'Neil Sedaka', song:'Breaking Up\'s Hard To Do', riaa:'—' },
    { pos: 91, artist:'Bay City Rollers', song:'Money Honey', riaa:'—' },
    { pos: 92, artist:'Parliament', song:'Tear The Roof Off The Sucker', riaa:'—' },
    { pos: 93, artist:'Larry Groce', song:'Junk Food Junkie', riaa:'—' },
    { pos: 94, artist:'Barry Manilow', song:'Tryin\' To Get The Feeling Again', riaa:'—' },
    { pos: 95, artist:'Kiss', song:'Rock And Roll All Nite', riaa:'—' },
    { pos: 96, artist:'Rick Dees', song:'Disco Duck', riaa:'—' },
    { pos: 97, artist:'Thin Lizzy', song:'The Boys Are Back In Town', riaa:'—' },
    { pos: 98, artist:'Steve Miller Band', song:'Take The Money And Run', riaa:'—' },
    { pos: 99, artist:'Who', song:'Squeeze Box', riaa:'—' },
    { pos:100, artist:'Glen Campbell', song:'Country Boy (You Got Your Feet In L.A.)', riaa:'—' }
  ],
  1977: [
    { pos:  1, artist:'Rod Stewart', song:'Tonight\'s The Night (Gonna Be Alright)', riaa:'—' },
    { pos:  2, artist:'Andy Gibb', song:'I Just Want To Be Your Everything', riaa:'—' },
    { pos:  3, artist:'Emotions', song:'Best Of My Love', riaa:'Platinum' },
    { pos:  4, artist:'Barbra Streisand', song:'Love Theme From "A Star Is Born"', riaa:'Platinum' },
    { pos:  5, artist:'Hot', song:'Angel In Your Arms', riaa:'—' },
    { pos:  6, artist:'Kenny Nolan', song:'I Like Dreamin\'', riaa:'—' },
    { pos:  7, artist:'Thelma Houston', song:'Don\'t Leave Me This Way', riaa:'—' },
    { pos:  8, artist:'Rita Coolidge', song:'(Your Love Has Lifted Me) Higher And Higher', riaa:'—' },
    { pos:  9, artist:'Alan O\'Day', song:'Undercover Angel', riaa:'—' },
    { pos: 10, artist:'Mary MacGregor', song:'Torn Between Two Lovers', riaa:'—' },
    { pos: 11, artist:'K.C. and The Sunshine Band', song:'I\'m Your Boogie Man', riaa:'—' },
    { pos: 12, artist:'ABBA', song:'Dancing Queen', riaa:'—' },
    { pos: 13, artist:'Leo Sayer', song:'You Make Me Feel Like Dancing', riaa:'—' },
    { pos: 14, artist:'Jimmy Buffett', song:'Margaritaville', riaa:'—' },
    { pos: 15, artist:'Electric Light Orchestra', song:'Telephone Line', riaa:'Platinum' },
    { pos: 16, artist:'Pablo Cruise', song:'Whatcha Gonna Do?', riaa:'—' },
    { pos: 17, artist:'Peter McCann', song:'Do You Wanna Make Love?', riaa:'—' },
    { pos: 18, artist:'Stevie Wonder', song:'Sir Duke', riaa:'—' },
    { pos: 19, artist:'Eagles', song:'Hotel California', riaa:'Gold' },
    { pos: 20, artist:'Marvin Gaye', song:'Got To Give It Up, Pt. 1', riaa:'—' },
    { pos: 21, artist:'Bill Conti', song:'Theme From "Rocky" (Gonna Fly Now)', riaa:'—' },
    { pos: 22, artist:'Glen Campbell', song:'Southern Nights', riaa:'—' },
    { pos: 23, artist:'Daryl Hall and John Oates', song:'Rich Girl', riaa:'—' },
    { pos: 24, artist:'Leo Sayer', song:'When I Need You', riaa:'—' },
    { pos: 25, artist:'Sylvers', song:'Hot Line', riaa:'—' },
    { pos: 26, artist:'Rose Royce', song:'Car Wash', riaa:'—' },
    { pos: 27, artist:'Marilyn McCoo and Billy Davis Jr.', song:'You Don\'t Have To Be A Star', riaa:'—' },
    { pos: 28, artist:'Steve Miller Band', song:'Fly Like An Eagle', riaa:'—' },
    { pos: 29, artist:'David Soul', song:'Don\'t Give Up On Us', riaa:'—' },
    { pos: 30, artist:'Stephen Bishop', song:'On And On', riaa:'—' },
    { pos: 31, artist:'Foreigner', song:'Feels Like The First Time', riaa:'—' },
    { pos: 32, artist:'Climax Blues Band', song:'Couldn\'t Get It Right', riaa:'—' },
    { pos: 33, artist:'Commodores', song:'Easy', riaa:'—' },
    { pos: 34, artist:'Jennifer Warnes', song:'Right Time Of The Night', riaa:'—' },
    { pos: 35, artist:'Natalie Cole', song:'I\'ve Got Love On My Mind', riaa:'—' },
    { pos: 36, artist:'Manfred Mann\'s. Earth Band', song:'Blinded By The Light', riaa:'—' },
    { pos: 37, artist:'Barry Manilow', song:'Looks Like We Made It', riaa:'—' },
    { pos: 38, artist:'Atlanta Rhythm Section', song:'So In To You', riaa:'—' },
    { pos: 39, artist:'Fleetwood Mac', song:'Dreams', riaa:'—' },
    { pos: 40, artist:'Jacksons', song:'Enjoy Yourself', riaa:'Platinum' },
    { pos: 41, artist:'Brick', song:'Dazz', riaa:'—' },
    { pos: 42, artist:'Peter Frampton', song:'I\'m In You', riaa:'—' },
    { pos: 43, artist:'Kenny Rogers', song:'Lucille', riaa:'—' },
    { pos: 44, artist:'10cc', song:'The Things We Do For Love', riaa:'—' },
    { pos: 45, artist:'Shaun Cassidy', song:'Da Doo Ron Ron', riaa:'—' },
    { pos: 46, artist:'James Taylor', song:'Handy Man', riaa:'—' },
    { pos: 47, artist:'Crosby, Stills and Nash', song:'Just A Song Before I Go', riaa:'—' },
    { pos: 48, artist:'Alice Cooper', song:'You And Me', riaa:'—' },
    { pos: 49, artist:'Johnny Rivers', song:'Swayin\' To The Music (Slow Dancin\')', riaa:'—' },
    { pos: 50, artist:'Andrew Gold', song:'Lonely Boy', riaa:'—' },
    { pos: 51, artist:'Stevie Wonder', song:'I Wish', riaa:'—' },
    { pos: 52, artist:'Fleetwood Mac', song:'Don\'t Stop', riaa:'—' },
    { pos: 53, artist:'Heart', song:'Barracuda', riaa:'—' },
    { pos: 54, artist:'Brothers Johnson', song:'Strawberry Letter 23', riaa:'—' },
    { pos: 55, artist:'Bob Seger and The Silver Bullet Band', song:'Night Moves', riaa:'—' },
    { pos: 56, artist:'Helen Reddy', song:'You\'re My World', riaa:'—' },
    { pos: 57, artist:'Marshall Tucker Band', song:'Heard It In A Love Song', riaa:'—' },
    { pos: 58, artist:'Kansas', song:'Carry On Wayward Son', riaa:'Multi-Platinum' },
    { pos: 59, artist:'Eagles', song:'New Kid In Town', riaa:'Gold' },
    { pos: 60, artist:'Barbra Streisand', song:'My Heart Belongs To Me', riaa:'—' },
    { pos: 61, artist:'Engelbert Humperdinck', song:'After The Lovin\'', riaa:'—' },
    { pos: 62, artist:'Steve Miller Band', song:'Jet Airliner', riaa:'—' },
    { pos: 63, artist:'Burton Cummings', song:'Stand Tall', riaa:'—' },
    { pos: 64, artist:'Elvis Presley', song:'Way Down', riaa:'Platinum' },
    { pos: 65, artist:'Barry Manilow', song:'Weekend In New England', riaa:'—' },
    { pos: 66, artist:'Ronnie Milsap', song:'It Was Almost Like A Song', riaa:'—' },
    { pos: 67, artist:'Sanford Townsend Band', song:'Smoke From A Distant Fire', riaa:'—' },
    { pos: 68, artist:'Foreigner', song:'Cold As Ice', riaa:'—' },
    { pos: 69, artist:'Dean Friedman', song:'Ariel', riaa:'—' },
    { pos: 70, artist:'Bread', song:'Lost Without Your Love', riaa:'—' },
    { pos: 71, artist:'Meco', song:'Star Wars Theme-Cantina Band', riaa:'—' },
    { pos: 72, artist:'Floaters', song:'Float On', riaa:'—' },
    { pos: 73, artist:'David Dundas', song:'Jeans On', riaa:'—' },
    { pos: 74, artist:'Boz Scaggs', song:'Lido Shuffle', riaa:'—' },
    { pos: 75, artist:'K.C. and The Sunshine Band', song:'Keep It Comin\' Love', riaa:'—' },
    { pos: 76, artist:'Bay City Rollers', song:'You Made Me Believe In Magic', riaa:'—' },
    { pos: 77, artist:'Electric Light Orchestra', song:'Livin\' Thing', riaa:'Gold' },
    { pos: 78, artist:'Supertramp', song:'Give A Little Bit', riaa:'—' },
    { pos: 79, artist:'Shaun Cassidy', song:'That\'s Rock \'N\' Roll', riaa:'—' },
    { pos: 80, artist:'Bee Gees', song:'Love So Right', riaa:'—' },
    { pos: 81, artist:'Spinners', song:'The Rubberband Man', riaa:'—' },
    { pos: 82, artist:'Alice Cooper', song:'I Never Cry', riaa:'—' },
    { pos: 83, artist:'Carly Simon', song:'Nobody Does It Better', riaa:'—' },
    { pos: 84, artist:'Sylvers', song:'High School Dance', riaa:'—' },
    { pos: 85, artist:'Kenny Nolan', song:'Love\'s Grown Deep', riaa:'—' },
    { pos: 86, artist:'Joe Tex', song:'Ain\'t Gonna Bump No More (With No Big Fat Woman)', riaa:'—' },
    { pos: 87, artist:'Rose Royce', song:'I Wanna Get Next To You', riaa:'—' },
    { pos: 88, artist:'Queen', song:'Somebody To Love', riaa:'Multi-Platinum' },
    { pos: 89, artist:'Captain and Tennille', song:'Muskrat Love', riaa:'—' },
    { pos: 90, artist:'Aerosmith', song:'Walk This Way', riaa:'—' },
    { pos: 91, artist:'Dr. Buzzard\'s Original Savannah Band', song:'Whispering-Cherchez La Femme-C\'est Si Bon', riaa:'—' },
    { pos: 92, artist:'Al Stewart', song:'Year Of The Cat', riaa:'—' },
    { pos: 93, artist:'Heatwave', song:'Boogie Nights', riaa:'—' },
    { pos: 94, artist:'Fleetwood Mac', song:'Go Your Own Way', riaa:'—' },
    { pos: 95, artist:'Elton John', song:'Sorry Seems To Be The Hardest Word', riaa:'—' },
    { pos: 96, artist:'B.J. Thomas', song:'Don\'t Worry Baby', riaa:'—' },
    { pos: 97, artist:'ABBA', song:'Knowing Me, Knowing You', riaa:'—' },
    { pos: 98, artist:'Leo Sayer', song:'How Much Love', riaa:'—' },
    { pos: 99, artist:'London Symphony Orchestra', song:'Star Wars (Main Title)', riaa:'—' },
    { pos:100, artist:'C.J. and Co.', song:'Devil\'s Gun', riaa:'—' }
  ],
  1978: [
    { pos:  1, artist:'Andy Gibb', song:'Shadow Dancing', riaa:'—' },
    { pos:  2, artist:'Bee Gees', song:'Night Fever', riaa:'—' },
    { pos:  3, artist:'Debby Boone', song:'You Light Up My Life', riaa:'—' },
    { pos:  4, artist:'Bee Gees', song:'Stayin\' Alive', riaa:'—' },
    { pos:  5, artist:'Exile', song:'Kiss You All Over', riaa:'—' },
    { pos:  6, artist:'Bee Gees', song:'How Deep Is Your Love', riaa:'—' },
    { pos:  7, artist:'Player', song:'Baby Come Back', riaa:'—' },
    { pos:  8, artist:'Andy Gibb', song:'(Love Is) Thicker Than Water', riaa:'—' },
    { pos:  9, artist:'A Taste Of Honey', song:'Boogie Oogie Oogie', riaa:'—' },
    { pos: 10, artist:'Commodores', song:'Three Times A Lady', riaa:'—' },
    { pos: 11, artist:'Frankie Valli', song:'Grease', riaa:'—' },
    { pos: 12, artist:'Paul Davis', song:'I Go Crazy', riaa:'—' },
    { pos: 13, artist:'John Travolta and Olivia Newton-John', song:'You\'re The One That I Want', riaa:'—' },
    { pos: 14, artist:'Samantha Sang', song:'Emotion', riaa:'—' },
    { pos: 15, artist:'Eric Clapton', song:'Lay Down Sally', riaa:'—' },
    { pos: 16, artist:'Rolling Stones', song:'Miss You', riaa:'—' },
    { pos: 17, artist:'Billy Joel', song:'Just The Way You Are', riaa:'Multi-Platinum' },
    { pos: 18, artist:'Wings', song:'With A Little Luck', riaa:'—' },
    { pos: 19, artist:'Yvonne Elliman', song:'If I Can\'t Have You', riaa:'—' },
    { pos: 20, artist:'Chic', song:'Dance, Dance, Dance (Yowsah, Yowsah, Yowsah)', riaa:'—' },
    { pos: 21, artist:'Chuck Mangione', song:'Feels So Good', riaa:'—' },
    { pos: 22, artist:'Nick Gilder', song:'Hot Child In The City', riaa:'—' },
    { pos: 23, artist:'Sweet', song:'Love Is Like Oxygen', riaa:'—' },
    { pos: 24, artist:'Bonnie Tyler', song:'It\'s A Heartache', riaa:'—' },
    { pos: 25, artist:'Queen', song:'We Will Rock You / We Are The Champions', riaa:'—' },
    { pos: 26, artist:'Gerry Rafferty', song:'Baker Street', riaa:'—' },
    { pos: 27, artist:'Barry Manilow', song:'Can\'t Smile Without You', riaa:'—' },
    { pos: 28, artist:'Johnny Mathis and Deniece Williams', song:'Too Much, Too Little, Too Late', riaa:'—' },
    { pos: 29, artist:'Peter Brown', song:'Dance With Me', riaa:'—' },
    { pos: 30, artist:'Meat Loaf', song:'Two Out Of Three Ain\'t Bad', riaa:'—' },
    { pos: 31, artist:'Raydio', song:'Jack And Jill', riaa:'—' },
    { pos: 32, artist:'ABBA', song:'Take A Chance On Me', riaa:'—' },
    { pos: 33, artist:'Dan Hill', song:'Sometimes When We Touch', riaa:'—' },
    { pos: 34, artist:'Donna Summer', song:'Last Dance', riaa:'—' },
    { pos: 35, artist:'Olivia Newton-John', song:'Hopelessly Devoted To You', riaa:'—' },
    { pos: 36, artist:'Foreigner', song:'Hot Blooded', riaa:'—' },
    { pos: 37, artist:'Rod Stewart', song:'You\'re In My Heart', riaa:'—' },
    { pos: 38, artist:'Roberta Flack and Donny Hathaway', song:'The Closer I Get To You', riaa:'—' },
    { pos: 39, artist:'Kansas', song:'Dust In The Wind', riaa:'Multi-Platinum' },
    { pos: 40, artist:'Walter Egan', song:'Magnet And Steel', riaa:'—' },
    { pos: 41, artist:'Randy Newman', song:'Short People', riaa:'—' },
    { pos: 42, artist:'O\'Jays', song:'Use Ta Be My Girl', riaa:'—' },
    { pos: 43, artist:'Natalie Cole', song:'Our Love', riaa:'—' },
    { pos: 44, artist:'Pablo Cruise', song:'Love Will Find A Way', riaa:'—' },
    { pos: 45, artist:'Andy Gibb', song:'An Everlasting Love', riaa:'—' },
    { pos: 46, artist:'John Paul Young', song:'Love Is In The Air', riaa:'—' },
    { pos: 47, artist:'David Gates', song:'Goodbye Girl', riaa:'—' },
    { pos: 48, artist:'Paul Simon', song:'Slip Slidin\' Away', riaa:'—' },
    { pos: 49, artist:'Heatwave', song:'The Groove Line', riaa:'Platinum' },
    { pos: 50, artist:'Jay Ferguson', song:'Thunder Island', riaa:'—' },
    { pos: 51, artist:'Atlanta Rhythm Section', song:'Imaginary Lover', riaa:'—' },
    { pos: 52, artist:'Bob Seger and The Silver Bullet Band', song:'Still The Same', riaa:'—' },
    { pos: 53, artist:'Toby Beau', song:'My Angel Baby', riaa:'—' },
    { pos: 54, artist:'Trammps', song:'Disco Inferno', riaa:'—' },
    { pos: 55, artist:'George Benson', song:'On Broadway', riaa:'—' },
    { pos: 56, artist:'Styx', song:'Come Sail Away', riaa:'—' },
    { pos: 57, artist:'L.T.D.', song:'Back In Love Again', riaa:'—' },
    { pos: 58, artist:'Player', song:'This Time I\'m In It For Love', riaa:'—' },
    { pos: 59, artist:'Carly Simon', song:'You Belong To Me', riaa:'—' },
    { pos: 60, artist:'Dolly Parton', song:'Here You Come Again', riaa:'—' },
    { pos: 61, artist:'Linda Ronstadt', song:'Blue Bayou', riaa:'Platinum' },
    { pos: 62, artist:'Steely Dan', song:'Peg', riaa:'—' },
    { pos: 63, artist:'Anne Murray', song:'You Needed Me', riaa:'—' },
    { pos: 64, artist:'Evelyn "Champagne" King', song:'Shame', riaa:'—' },
    { pos: 65, artist:'Little River Band', song:'Reminiscing', riaa:'—' },
    { pos: 66, artist:'Jefferson Starship', song:'Count On Me', riaa:'—' },
    { pos: 67, artist:'Eddie Money', song:'Baby Hold On', riaa:'—' },
    { pos: 68, artist:'Shaun Cassidy', song:'Hey Deanie', riaa:'—' },
    { pos: 69, artist:'John Travolta and Olivia Newton-john', song:'Summer Nights', riaa:'—' },
    { pos: 70, artist:'Lynyrd Skynyrd', song:'What\'s Your Name', riaa:'—' },
    { pos: 71, artist:'Crystal Gayle', song:'Don\'t It Make My Brown Eyes Blue', riaa:'—' },
    { pos: 72, artist:'Patti Smith', song:'Because The Night', riaa:'—' },
    { pos: 73, artist:'Robert Palmer', song:'Every Kinda People', riaa:'—' },
    { pos: 74, artist:'Barry Manilow', song:'Copacabana', riaa:'—' },
    { pos: 75, artist:'Heatwave', song:'Always And Forever', riaa:'Platinum' },
    { pos: 76, artist:'Rick James', song:'You And I', riaa:'—' },
    { pos: 77, artist:'Earth, Wind and Fire', song:'Serpentine Fire', riaa:'—' },
    { pos: 78, artist:'Bob Welch', song:'Sentimental Lady', riaa:'—' },
    { pos: 79, artist:'LeBlanc and Carr', song:'Falling', riaa:'—' },
    { pos: 80, artist:'Santa Esmeralda', song:'Dont Let Me Be Misunderstood', riaa:'—' },
    { pos: 81, artist:'Michael Johnson', song:'Bluer Than Blue', riaa:'—' },
    { pos: 82, artist:'Jackson Browne', song:'Running On Empty', riaa:'—' },
    { pos: 83, artist:'Kenny Loggins', song:'Whenever I Call You "Friend"', riaa:'—' },
    { pos: 84, artist:'Chris Rea', song:'Fool (If You Think It\'s Over)', riaa:'—' },
    { pos: 85, artist:'Foxy', song:'Get Off', riaa:'—' },
    { pos: 86, artist:'Electric Light Orchestra', song:'Sweet Talking Woman', riaa:'—' },
    { pos: 87, artist:'Joe Walsh', song:'Life\'s Been Good', riaa:'—' },
    { pos: 88, artist:'Alicia Bridges', song:'I Love The Night Life', riaa:'—' },
    { pos: 89, artist:'High Inergy', song:'You Can\'t Turn Me Off (In The Middle Of Turning Me On)', riaa:'—' },
    { pos: 90, artist:'Linda Ronstadt', song:'It\'s So Easy', riaa:'—' },
    { pos: 91, artist:'Odyssey', song:'Native New Yorker', riaa:'—' },
    { pos: 92, artist:'Parliament', song:'Flashlight', riaa:'—' },
    { pos: 93, artist:'Boston', song:'Don\'t Look Back', riaa:'—' },
    { pos: 94, artist:'Electric Light Orchestra', song:'Turn To Stone', riaa:'—' },
    { pos: 95, artist:'Eruption', song:'I Can\'t Stand The Rain', riaa:'—' },
    { pos: 96, artist:'Bob Welch', song:'Ebony Eyes', riaa:'—' },
    { pos: 97, artist:'ABBA', song:'The Name Of The Game', riaa:'—' },
    { pos: 98, artist:'Rita Coolidge', song:'We\'re All Alone', riaa:'—' },
    { pos: 99, artist:'Bob Seger and The Silver Bullet Band', song:'Hollywood Nights', riaa:'—' },
    { pos:100, artist:'Steely Dan', song:'Deacon Blues', riaa:'—' }
  ],
  1979: [
    { pos:  1, artist:'Knack', song:'My Sharona', riaa:'—' },
    { pos:  2, artist:'Donna Summer', song:'Bad Girls', riaa:'—' },
    { pos:  3, artist:'Chic', song:'Le Freak', riaa:'—' },
    { pos:  4, artist:'Rod Stewart', song:'Da Ya Think I\'m Sexy', riaa:'—' },
    { pos:  5, artist:'Peaches and Herb', song:'Reunited', riaa:'—' },
    { pos:  6, artist:'Gloria Gaynor', song:'I Will Survive', riaa:'—' },
    { pos:  7, artist:'Donna Summer', song:'Hot Stuff', riaa:'—' },
    { pos:  8, artist:'Village People', song:'Y.M.C.A.', riaa:'—' },
    { pos:  9, artist:'Anita Ward', song:'Ring My Bell', riaa:'—' },
    { pos: 10, artist:'Robert John', song:'Sad Eyes', riaa:'—' },
    { pos: 11, artist:'Bee Gees', song:'Too Much Heaven', riaa:'—' },
    { pos: 12, artist:'Donna Summer', song:'MacArthur Park', riaa:'—' },
    { pos: 13, artist:'Dr. Hook', song:'When You\'re In Love With A Beautiful Woman', riaa:'—' },
    { pos: 14, artist:'David Naughton', song:'Makin\' It', riaa:'—' },
    { pos: 15, artist:'Pointer Sisters', song:'Fire', riaa:'—' },
    { pos: 16, artist:'Bee Gees', song:'Tragedy', riaa:'—' },
    { pos: 17, artist:'Olivia Newton-John', song:'A Little More Love', riaa:'—' },
    { pos: 18, artist:'Blondie', song:'Heart Of Glass', riaa:'—' },
    { pos: 19, artist:'Doobie Brothers', song:'What A Fool Believes', riaa:'—' },
    { pos: 20, artist:'Chic', song:'Good Times', riaa:'—' },
    { pos: 21, artist:'Barbra Streisand and Neil Diamond', song:'You Don\'t Bring Me Flowers', riaa:'Platinum' },
    { pos: 22, artist:'Amii Stewart', song:'Knock On Wood', riaa:'—' },
    { pos: 23, artist:'Suzi Quatro and Chris Norman', song:'Stumblin\' In', riaa:'—' },
    { pos: 24, artist:'Maxine Nightingale', song:'Lead Me On', riaa:'—' },
    { pos: 25, artist:'Jacksons', song:'Shake Your Body', riaa:'—' },
    { pos: 26, artist:'Melissa Manchester', song:'Don\'t Cry Out Loud', riaa:'—' },
    { pos: 27, artist:'Supertramp', song:'The Logical Song', riaa:'—' },
    { pos: 28, artist:'Billy Joel', song:'My Life', riaa:'Platinum' },
    { pos: 29, artist:'Randy Vanwarmer', song:'Just When I Needed You Most', riaa:'—' },
    { pos: 30, artist:'Raydio', song:'You Can\'t Change That', riaa:'—' },
    { pos: 31, artist:'Peaches and Herb', song:'Shake Your Groove Thing', riaa:'—' },
    { pos: 32, artist:'Dionne Warwick', song:'I\'ll Never Love This Way Again', riaa:'—' },
    { pos: 33, artist:'Bee Gees', song:'Love You Inside Out', riaa:'—' },
    { pos: 34, artist:'Cheap Trick', song:'I Want You To Want Me', riaa:'—' },
    { pos: 35, artist:'Barbra Streisand', song:'The Main Event (Fight)', riaa:'—' },
    { pos: 36, artist:'Elton John', song:'Mama Can\'t Buy You Love', riaa:'—' },
    { pos: 37, artist:'Leif Garrett', song:'I Was Made For Dancin\'', riaa:'—' },
    { pos: 38, artist:'Earth, Wind and Fire', song:'After The Love Has Gone', riaa:'—' },
    { pos: 39, artist:'Donna Summer and Brooklyn Dreams', song:'Heaven Knows', riaa:'—' },
    { pos: 40, artist:'Kenny Rogers', song:'The Gambler', riaa:'—' },
    { pos: 41, artist:'Nicolette Larson', song:'Lotta Love', riaa:'—' },
    { pos: 42, artist:'Little River Band', song:'Lady', riaa:'—' },
    { pos: 43, artist:'Bonnie Pointer', song:'Heaven Must Have Sent You', riaa:'—' },
    { pos: 44, artist:'Toto', song:'Hold The Line', riaa:'—' },
    { pos: 45, artist:'Sister Sledge', song:'He\'s The Greatest Dancer', riaa:'—' },
    { pos: 46, artist:'Dr. Hook', song:'Sharing The Night Together', riaa:'—' },
    { pos: 47, artist:'Kenny Rogers', song:'She Believes In Me', riaa:'—' },
    { pos: 48, artist:'Village People', song:'In The Navy', riaa:'—' },
    { pos: 49, artist:'Frank Mills', song:'Music Box Dancer', riaa:'—' },
    { pos: 50, artist:'Charlie Daniels Band', song:'The Devil Went Down To Georgia', riaa:'Platinum' },
    { pos: 51, artist:'John Stewart', song:'Gold', riaa:'—' },
    { pos: 52, artist:'Wings', song:'Goodnight Tonight', riaa:'—' },
    { pos: 53, artist:'Sister Sledge', song:'We Are Family', riaa:'—' },
    { pos: 54, artist:'Bad Company', song:'Rock \'N\' Roll Fantasy', riaa:'Gold' },
    { pos: 55, artist:'Hot Chocolate', song:'Every 1\'s A Winner', riaa:'—' },
    { pos: 56, artist:'Cher', song:'Take Me Home', riaa:'—' },
    { pos: 57, artist:'Earth, Wind and Fire', song:'Boogie Wonderland', riaa:'—' },
    { pos: 58, artist:'Andy Gibb', song:'(Our Love) Don\'t Throw It All Away', riaa:'—' },
    { pos: 59, artist:'Bobby Caldwell', song:'What You Won\'t Do For Love', riaa:'—' },
    { pos: 60, artist:'Ace Frehley', song:'New York Groove', riaa:'—' },
    { pos: 61, artist:'Dire Straits', song:'Sultans Of Swing', riaa:'—' },
    { pos: 62, artist:'Chic', song:'I Want Your Love', riaa:'—' },
    { pos: 63, artist:'Rickie Lee Jones', song:'Chuck E\'s In Love', riaa:'—' },
    { pos: 64, artist:'Alicia Bridges', song:'I Love The Night Life', riaa:'—' },
    { pos: 65, artist:'McFadden and Whitehead', song:'Ain\'t No Stoppin\' Us Now', riaa:'—' },
    { pos: 66, artist:'Little River Band', song:'Lonesome Loser', riaa:'—' },
    { pos: 67, artist:'Styx', song:'Renegade', riaa:'—' },
    { pos: 68, artist:'England Dan and John Ford Coley', song:'Love Is The Answer', riaa:'—' },
    { pos: 69, artist:'Cheryl Lynn', song:'Got To Be Real', riaa:'Platinum' },
    { pos: 70, artist:'Patrick Hernandez', song:'Born To Be Alive', riaa:'—' },
    { pos: 71, artist:'Electric Light Orchestra', song:'Shine A Little Love', riaa:'—' },
    { pos: 72, artist:'Anne Murray', song:'I Just Fall In Love Again', riaa:'—' },
    { pos: 73, artist:'Ian Matthews', song:'Shake It', riaa:'—' },
    { pos: 74, artist:'Kiss', song:'I Was Made For Lovin\' You', riaa:'—' },
    { pos: 75, artist:'Gino Vannelli', song:'I Just Wanna Stop', riaa:'—' },
    { pos: 76, artist:'G.Q.', song:'Disco Nights', riaa:'—' },
    { pos: 77, artist:'Linda Ronstadt', song:'Ooh Baby Baby', riaa:'—' },
    { pos: 78, artist:'Earth, Wind and Fire', song:'September', riaa:'Multi-Platinum' },
    { pos: 79, artist:'Al Stewart', song:'Time Passages', riaa:'—' },
    { pos: 80, artist:'Herb Alpert', song:'Rise', riaa:'—' },
    { pos: 81, artist:'Electric Light Orchestra', song:'Don\'t Bring Me Down', riaa:'Multi-Platinum' },
    { pos: 82, artist:'Eric Clapton', song:'Promises', riaa:'—' },
    { pos: 83, artist:'Roger Voudouris', song:'Get Used To It', riaa:'—' },
    { pos: 84, artist:'Ambrosia', song:'How Much I Feel', riaa:'—' },
    { pos: 85, artist:'Eddie Rabbitt', song:'Suspicions', riaa:'—' },
    { pos: 86, artist:'Rex Smith', song:'You Take My Breath Away', riaa:'—' },
    { pos: 87, artist:'Alice Cooper', song:'How You Gonna See Me Now', riaa:'—' },
    { pos: 88, artist:'Foreigner', song:'Double Vision', riaa:'—' },
    { pos: 89, artist:'Babys', song:'Every Time I Think Of You', riaa:'—' },
    { pos: 90, artist:'Instant Funk', song:'I Got My Mind Made Up', riaa:'—' },
    { pos: 91, artist:'Michael Jackson', song:'Don\'t Stop \'Til You Get Enough', riaa:'Multi-Platinum' },
    { pos: 92, artist:'Robert Palmer', song:'Bad Case Of Lovin\' You', riaa:'—' },
    { pos: 93, artist:'Barry Manilow', song:'Somewhere In The Night', riaa:'—' },
    { pos: 94, artist:'Bob Seger and The Silver Bullet Band', song:'We\'ve Got Tonight', riaa:'—' },
    { pos: 95, artist:'Van Halen', song:'Dance The Night Away', riaa:'—' },
    { pos: 96, artist:'Nigel Olsson', song:'Dancing Shoes', riaa:'—' },
    { pos: 97, artist:'Diana Ross', song:'The Boss', riaa:'—' },
    { pos: 98, artist:'Commodores', song:'Sail On', riaa:'—' },
    { pos: 99, artist:'G.Q.', song:'I Do Love You', riaa:'—' },
    { pos:100, artist:'Firefall', song:'Strange Way', riaa:'—' }
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

function updatePlayer(artist, song, year) {
  songTitleEl.textContent      = song;
  artistNameEl.textContent     = artist;
  songYearEl.innerHTML         = `&bull;&nbsp;${year}&nbsp;&bull;`;
  artistInitialsEl.textContent = getInitials(artist);

  // Try to load album art — decade folders searched first, then all others
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

// Row click — update player with selected song
countdownBody.addEventListener('click', e => {
  if (e.target.closest('a.profile-link')) return;
  const row = e.target.closest('tr[data-artist]');
  if (!row) return;
  countdownBody.querySelectorAll('tr.row-selected').forEach(r => r.classList.remove('row-selected'));
  row.classList.add('row-selected');
  updatePlayer(row.dataset.artist, row.dataset.song, parseInt(row.dataset.year, 10));
});

document.querySelectorAll('.year-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCountdown(parseInt(btn.dataset.year, 10));
  });
});
