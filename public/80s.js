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
      setStatus('Signal acquired — ready');
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setStatus('Signal lost — retrying...');
    });
  } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = STREAM;
    hlsReady  = true;
    setStatus('Signal acquired — ready');
  } else {
    setStatus('HLS not supported in this browser');
  }
})();

// ── PLAY / PAUSE ──
playBtn.addEventListener('click', () => {
  if (!hlsReady) { setStatus('Loading signal...'); return; }
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
    setStatus('Live &bull; On air now');
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

  // Neon pink fill on track
  volSlider.style.background =
    `linear-gradient(90deg, #ff1a75 ${pct}%, #20084a ${pct}%)`;

  // Speaker icon dims at low volume
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
// ── BILLBOARD YEAR-END TOP 100 DATA (1980s) ──
const BILLBOARD = {
  1980: [
    { pos:  1, artist:'Air Supply', song:'Lost In Love', riaa:'—' },
    { pos:  2, artist:'Air Supply', song:'All Out Of Love', riaa:'—' },
    { pos:  3, artist:'Ambrosia', song:'Biggest Part Of Me', riaa:'—' },
    { pos:  4, artist:'Andy Gibb', song:'Desire', riaa:'—' },
    { pos:  5, artist:'Anne Murray', song:'Daydream Believer', riaa:'—' },
    { pos:  6, artist:'Anne Murray', song:'Broken Hearted Me', riaa:'—' },
    { pos:  7, artist:'Barbra Streisand and Donna Summer', song:'No More Tears (Enough Is Enough)', riaa:'Platinum' },
    { pos:  8, artist:'Barry Manilow', song:'Ships', riaa:'—' },
    { pos:  9, artist:'Benny Mardones', song:'Into The Night', riaa:'—' },
    { pos: 10, artist:'Bette Midler', song:'The Rose', riaa:'—' },
    { pos: 11, artist:'Billy Joel', song:'Its Still Rock And Roll To Me', riaa:'Multi-Platinum' },
    { pos: 12, artist:'Billy Joel', song:'You May Be Right', riaa:'Platinum' },
    { pos: 13, artist:'Billy Preston and Syreeta', song:'With You Im Born Again', riaa:'—' },
    { pos: 14, artist:'Blondie', song:'Call Me', riaa:'—' },
    { pos: 15, artist:'Bob Seger and The Silver Bullet Band', song:'Against The Wind', riaa:'—' },
    { pos: 16, artist:'Bob Seger and The Silver Bullet Band', song:'Fire Lake', riaa:'—' },
    { pos: 17, artist:'Boz Scaggs', song:'Jo Jo', riaa:'—' },
    { pos: 18, artist:'Boz Scaggs', song:'Breakdown Dead Ahead', riaa:'—' },
    { pos: 19, artist:'Brothers Johnson', song:'Stomp', riaa:'—' },
    { pos: 20, artist:'Captain and Tennille', song:'Do That To Me One More Time', riaa:'—' },
    { pos: 21, artist:'Carole King', song:'One Fine Day', riaa:'—' },
    { pos: 22, artist:'Charlie Daniels Band', song:'In America', riaa:'—' },
    { pos: 23, artist:'Charlie Dore', song:'Pilot Of The Airwaves', riaa:'—' },
    { pos: 24, artist:'Christopher Cross', song:'Sailing', riaa:'—' },
    { pos: 25, artist:'Cliff Richard', song:'We Dont Talk Anymore', riaa:'—' },
    { pos: 26, artist:'Commodores', song:'Still', riaa:'—' },
    { pos: 27, artist:'Cristopher Cross', song:'Ride Like The Wind', riaa:'—' },
    { pos: 28, artist:'Dan Fogelberg', song:'Longer', riaa:'—' },
    { pos: 29, artist:'Daryl Hall and John Oates', song:'Wait For Me', riaa:'—' },
    { pos: 30, artist:'Diana Ross', song:'Upside Down', riaa:'Gold' },
    { pos: 31, artist:'Dionne Warwick', song:'Deja Vu', riaa:'—' },
    { pos: 32, artist:'Dirt Band', song:'An American Dream', riaa:'—' },
    { pos: 33, artist:'Donna Summer', song:'On The Radio', riaa:'—' },
    { pos: 34, artist:'Donna Summer', song:'Dim All The Lights', riaa:'—' },
    { pos: 35, artist:'Dr. Hook', song:'Sexy Eyes', riaa:'—' },
    { pos: 36, artist:'Dr. Hook', song:'Better Love Next Time', riaa:'—' },
    { pos: 37, artist:'Eagles', song:'Heartache Tonight', riaa:'—' },
    { pos: 38, artist:'Eagles', song:'I Cant Tell You Why', riaa:'—' },
    { pos: 39, artist:'Eagles', song:'The Long Run', riaa:'—' },
    { pos: 40, artist:'Eddie Rabbitt', song:'Drivin My Life Away', riaa:'—' },
    { pos: 41, artist:'Elton John', song:'Little Jeannie', riaa:'—' },
    { pos: 42, artist:'Fleetwood Mac', song:'Sara', riaa:'—' },
    { pos: 43, artist:'Fleetwood Mac', song:'Tusk', riaa:'—' },
    { pos: 44, artist:'Gary Numan', song:'Cars', riaa:'—' },
    { pos: 45, artist:'Genesis', song:'Misunderstanding', riaa:'—' },
    { pos: 46, artist:'George Benson', song:'Give Me The Night', riaa:'—' },
    { pos: 47, artist:'Herb Alpert', song:'Rise', riaa:'—' },
    { pos: 48, artist:'Irene Cara', song:'Fame', riaa:'—' },
    { pos: 49, artist:'Isaac Hayes', song:'Dont Let Go', riaa:'—' },
    { pos: 50, artist:'J.D. Souther', song:'Youre Only Lonely', riaa:'—' },
    { pos: 51, artist:'Jermaine Jackson', song:'Lets Get Serious', riaa:'—' },
    { pos: 52, artist:'Joe Walsh', song:'All Night Long', riaa:'—' },
    { pos: 53, artist:'K.C. and The Sunshine Band', song:'Please Dont Go', riaa:'—' },
    { pos: 54, artist:'Kenny Loggins', song:'This Is It', riaa:'—' },
    { pos: 55, artist:'Kenny Rogers', song:'Coward Of The County', riaa:'—' },
    { pos: 56, artist:'Kenny Rogers', song:'You Decorated My Life', riaa:'—' },
    { pos: 57, artist:'Kenny Rogers and Kim Carnes', song:'Dont Fall In Love With A Dreamer', riaa:'—' },
    { pos: 58, artist:'Kim Carnes', song:'More Love', riaa:'—' },
    { pos: 59, artist:'Kool and The Gang', song:'Ladies Night', riaa:'—' },
    { pos: 60, artist:'Kool and The Gang', song:'Too Hot', riaa:'Gold' },
    { pos: 61, artist:'Linda Ronstadt', song:'How Do I Make You', riaa:'—' },
    { pos: 62, artist:'Linda Ronstadt', song:'Hurt So Bad', riaa:'—' },
    { pos: 63, artist:'Lipps, Inc.', song:'Funkytown', riaa:'—' },
    { pos: 64, artist:'Little River Band', song:'Cool Change', riaa:'—' },
    { pos: 65, artist:'M', song:'Pop Muzik', riaa:'—' },
    { pos: 66, artist:'Manhattans', song:'Shining Star', riaa:'Platinum' },
    { pos: 67, artist:'Michael Jackson', song:'Rock With You', riaa:'Multi-Platinum' },
    { pos: 68, artist:'Michael Jackson', song:'Shes Out Of My Life', riaa:'Gold' },
    { pos: 69, artist:'Michael Jackson', song:'Off The Wall', riaa:'Platinum' },
    { pos: 70, artist:'Mickey Gilley', song:'Stand By Me', riaa:'—' },
    { pos: 71, artist:'Neil Diamond', song:'September Morn', riaa:'—' },
    { pos: 72, artist:'Neil Sedaka and Dara Sedaka', song:'Shouldve Never Let You Go', riaa:'—' },
    { pos: 73, artist:'Olivia Newton-John', song:'Magic', riaa:'—' },
    { pos: 74, artist:'Pat Benatar', song:'Heartbreaker', riaa:'—' },
    { pos: 75, artist:'Paul McCartney', song:'Coming Up', riaa:'—' },
    { pos: 76, artist:'Peaches and Herb', song:'I Pledge My Love', riaa:'—' },
    { pos: 77, artist:'Pete Townshend', song:'Let My Love Open The Door', riaa:'—' },
    { pos: 78, artist:'Pink Floyd', song:'Another Brick In The Wall', riaa:'Platinum' },
    { pos: 79, artist:'Pretenders', song:'Brass In Pocket', riaa:'—' },
    { pos: 80, artist:'Prince', song:'I Wanna Be Your Lover', riaa:'—' },
    { pos: 81, artist:'Pure Prairie League', song:'Let Me Love You Tonight', riaa:'—' },
    { pos: 82, artist:'Queen', song:'Crazy Little Thing Called Love', riaa:'—' },
    { pos: 83, artist:'Ray, Goodman and Brown', song:'Special Lady', riaa:'—' },
    { pos: 84, artist:'Robbie Dupree', song:'Steal Away', riaa:'—' },
    { pos: 85, artist:'Rocky Burnette', song:'Tired Of Toein The Line', riaa:'—' },
    { pos: 86, artist:'Rolling Stones', song:'Emotional Rescue', riaa:'—' },
    { pos: 87, artist:'Rupert Holmes', song:'Escape (The Pina Colada Song)', riaa:'—' },
    { pos: 88, artist:'Rupert Holmes', song:'Him', riaa:'—' },
    { pos: 89, artist:'S.O.S. Band', song:'Take Your Time', riaa:'—' },
    { pos: 90, artist:'Shalamar', song:'The Second Time Around', riaa:'—' },
    { pos: 91, artist:'Smokey Robinson', song:'Cruisin', riaa:'—' },
    { pos: 92, artist:'Spinners', song:'Working My Way Back To You-Forgive Me Girl', riaa:'—' },
    { pos: 93, artist:'Spinners', song:'Cupid/Ive Loved You For A Long Time', riaa:'—' },
    { pos: 94, artist:'Steve Forbert', song:'Romeos Tune', riaa:'—' },
    { pos: 95, artist:'Stevie Wonder', song:'Send One Your Love', riaa:'—' },
    { pos: 96, artist:'Styx', song:'Babe', riaa:'—' },
    { pos: 97, artist:'Supertramp', song:'Take The Long Way Home', riaa:'—' },
    { pos: 98, artist:'Teri De Sario With K.C.', song:'Yes, Im Ready', riaa:'—' },
    { pos: 99, artist:'Tom Petty and The Heartbreakers', song:'Dont Do Me Like That', riaa:'—' },
    { pos:100, artist:'Tom Petty and The Heartbreakers', song:'Refugee', riaa:'—' }
  ],
  1981: [
    { pos:  1, artist:'Kim Carnes', song:'Bette Davis Eyes', riaa:'—' },
    { pos:  2, artist:'Diana Ross and Lionel Richie', song:'Endless Love', riaa:'Platinum' },
    { pos:  3, artist:'Kenny Rogers', song:'Lady', riaa:'—' },
    { pos:  4, artist:'John Lennon', song:'(Just Like) Starting Over', riaa:'—' },
    { pos:  5, artist:'Rick Springfield', song:'Jessies Girl', riaa:'—' },
    { pos:  6, artist:'Kool and The Gang', song:'Celebration', riaa:'—' },
    { pos:  7, artist:'Daryl Hall and John Oates', song:'Kiss On My List', riaa:'—' },
    { pos:  8, artist:'Eddie Rabbitt', song:'I Love A Rainy Night', riaa:'—' },
    { pos:  9, artist:'Dolly Parton', song:'9 To 5', riaa:'—' },
    { pos: 10, artist:'REO Speedwagon', song:'Keep On Loving You', riaa:'Platinum' },
    { pos: 11, artist:'Joey Scarbury', song:'Theme From Greatest American Hero', riaa:'—' },
    { pos: 12, artist:'Sheena Easton', song:'Morning Train (Nine To Five)', riaa:'—' },
    { pos: 13, artist:'Smokey Robinson', song:'Being With You', riaa:'—' },
    { pos: 14, artist:'Juice Newton', song:'Queen Of Hearts', riaa:'—' },
    { pos: 15, artist:'Blondie', song:'Rapture', riaa:'—' },
    { pos: 16, artist:'Ray Parker jr. and Raydio', song:'A Woman Needs Love', riaa:'—' },
    { pos: 17, artist:'Blondie', song:'The Tide Is High', riaa:'—' },
    { pos: 18, artist:'Grover Washington jr.', song:'Just The Two Of Us', riaa:'—' },
    { pos: 19, artist:'Pointer Sisters', song:'Slow Hand', riaa:'—' },
    { pos: 20, artist:'Climax Blues Band', song:'I Love You', riaa:'—' },
    { pos: 21, artist:'John Lennon', song:'Woman', riaa:'—' },
    { pos: 22, artist:'A Taste Of Honey', song:'Sukiyaki', riaa:'—' },
    { pos: 23, artist:'ABBA', song:'The Winner Takes It All', riaa:'—' },
    { pos: 24, artist:'Stars On 45', song:'Medley', riaa:'—' },
    { pos: 25, artist:'Juice Newton', song:'Angel Of The Morning', riaa:'—' },
    { pos: 26, artist:'Neil Diamond', song:'Love On The Rocks', riaa:'—' },
    { pos: 27, artist:'Air Supply', song:'Every Woman In The World', riaa:'—' },
    { pos: 28, artist:'Air Supply', song:'The One That You Love', riaa:'—' },
    { pos: 29, artist:'Barbra Streisand and Barry Gibb', song:'Guilty', riaa:'—' },
    { pos: 30, artist:'Styx', song:'The Best Of Times', riaa:'—' },
    { pos: 31, artist:'Oak Ridge Boys', song:'Elvira', riaa:'—' },
    { pos: 32, artist:'REO Speedwagon', song:'Take It On The Run', riaa:'Gold' },
    { pos: 33, artist:'Ronnie Milsap', song:'No Gettin Over Me', riaa:'—' },
    { pos: 34, artist:'Gino Vannelli', song:'Living Outside Myself', riaa:'—' },
    { pos: 35, artist:'Barbra Streisand', song:'Woman In Love', riaa:'—' },
    { pos: 36, artist:'Manhattan Transfer', song:'Boy From New York City', riaa:'—' },
    { pos: 37, artist:'Foreigner', song:'Urgent', riaa:'—' },
    { pos: 38, artist:'Rod Stewart', song:'Passion', riaa:'—' },
    { pos: 39, artist:'Commodores', song:'Lady (You Bring Me Up)', riaa:'—' },
    { pos: 40, artist:'Don Mclean', song:'Crying', riaa:'—' },
    { pos: 41, artist:'Marty Balin', song:'Hearts', riaa:'—' },
    { pos: 42, artist:'Diana Ross', song:'Its My Turn', riaa:'—' },
    { pos: 43, artist:'Daryl Hall and John Oates', song:'You Make My Dreams', riaa:'—' },
    { pos: 44, artist:'Kenny Rogers', song:'I Dont Need You', riaa:'—' },
    { pos: 45, artist:'Champaign', song:'How Bout Us', riaa:'—' },
    { pos: 46, artist:'Pat Benatar', song:'Hit Me With Your Best Shot', riaa:'—' },
    { pos: 47, artist:'Greg Kihn Band', song:'The Breakup Song', riaa:'—' },
    { pos: 48, artist:'Alan Parsons Project', song:'Time', riaa:'—' },
    { pos: 49, artist:'Bruce Springsteen', song:'Hungry Heart', riaa:'—' },
    { pos: 50, artist:'Franke and The Knockouts', song:'Sweetheart', riaa:'—' },
    { pos: 51, artist:'Terri Gibbs', song:'Someones Knockin', riaa:'—' },
    { pos: 52, artist:'Leo Sayer', song:'More Than I Can Say', riaa:'—' },
    { pos: 53, artist:'Tierra', song:'Together', riaa:'—' },
    { pos: 54, artist:'Styx', song:'Too Much Time On My Hands', riaa:'—' },
    { pos: 55, artist:'Dottie West', song:'What Are We Doin In Love', riaa:'—' },
    { pos: 56, artist:'Journey', song:'Whos Crying Now', riaa:'Gold' },
    { pos: 57, artist:'Police', song:'De Do Do Do, De Da Da', riaa:'—' },
    { pos: 58, artist:'Gary U.S. Bonds', song:'This Little Girl', riaa:'—' },
    { pos: 59, artist:'Stevie Nicks With Tom Petty and The Heartbreakers', song:'Stop Draggin My Heart Around', riaa:'—' },
    { pos: 60, artist:'Delbert McClinton', song:'Giving It Up For Your Love', riaa:'—' },
    { pos: 61, artist:'Cliff Richard', song:'A Little In Love', riaa:'—' },
    { pos: 62, artist:'Neil Diamond', song:'America', riaa:'—' },
    { pos: 63, artist:'John Cougar', song:'Aint Even Done With The Night', riaa:'—' },
    { pos: 64, artist:'Christopher Cross', song:'Arthurs Theme', riaa:'—' },
    { pos: 65, artist:'Queen', song:'Another One Bites The Dust', riaa:'—' },
    { pos: 66, artist:'Alan Parsons Project', song:'Games People Play', riaa:'—' },
    { pos: 67, artist:'Eric Clapton', song:'I Cant Stand It', riaa:'—' },
    { pos: 68, artist:'Steve Winwood', song:'While You See A Chance', riaa:'—' },
    { pos: 69, artist:'Stevie Wonder', song:'Master Blaster', riaa:'—' },
    { pos: 70, artist:'Neil Diamond', song:'Hello Again', riaa:'—' },
    { pos: 71, artist:'Police', song:'Dont Stand So Close To Me', riaa:'—' },
    { pos: 72, artist:'Steely Dan', song:'Hey Nineteen', riaa:'—' },
    { pos: 73, artist:'Stevie Wonder', song:'I Aint Gonna Stand For It', riaa:'—' },
    { pos: 74, artist:'George Harrison', song:'All Those Years Ago', riaa:'—' },
    { pos: 75, artist:'Eddie Rabbitt', song:'Step By Step', riaa:'—' },
    { pos: 76, artist:'Billy Squier', song:'The Stroke', riaa:'—' },
    { pos: 77, artist:'Alabama', song:'Feels So Right', riaa:'—' },
    { pos: 78, artist:'Stanley Clarke and George Duke', song:'Sweet Baby', riaa:'—' },
    { pos: 79, artist:'Dan Fogelberg', song:'Same Old Lang Syne', riaa:'—' },
    { pos: 80, artist:'Pablo Cruise', song:'Cool Love', riaa:'—' },
    { pos: 81, artist:'ELO', song:'Hold On Tight', riaa:'—' },
    { pos: 82, artist:'John Schneider', song:'Its Now Or Never', riaa:'—' },
    { pos: 83, artist:'Pat Benatar', song:'Treat Me Right', riaa:'—' },
    { pos: 84, artist:'Santana', song:'Winning', riaa:'—' },
    { pos: 85, artist:'Barbra Streisand and Barry Gibb', song:'What Kind Of Fool', riaa:'—' },
    { pos: 86, artist:'John Lennon', song:'Watching The Wheels', riaa:'—' },
    { pos: 87, artist:'Heart', song:'Tell It Like It Is', riaa:'—' },
    { pos: 88, artist:'Ronnie Milsap', song:'Smoky Mountain Rain', riaa:'—' },
    { pos: 89, artist:'Barry Manilow', song:'I Made It Through The Rain', riaa:'—' },
    { pos: 90, artist:'Daryl Hall and John Oates', song:'Youve Lost That Lovin Feelin', riaa:'—' },
    { pos: 91, artist:'Olivia Newton-John and Cliff Richard', song:'Suddenly', riaa:'—' },
    { pos: 92, artist:'Sheena Easton', song:'For Your Eyes Only', riaa:'—' },
    { pos: 93, artist:'Beach Boys', song:'The Beach Boys Medley', riaa:'—' },
    { pos: 94, artist:'Devo', song:'Whip It', riaa:'—' },
    { pos: 95, artist:'Sheena Easton', song:'Modern Girl', riaa:'—' },
    { pos: 96, artist:'Gary Wright', song:'Really Wanna Know You', riaa:'—' },
    { pos: 97, artist:'Rosanne Cash', song:'Seven Year Ache', riaa:'—' },
    { pos: 98, artist:'Diana Ross', song:'Im Coming Out', riaa:'—' },
    { pos: 99, artist:'Boz Scaggs', song:'Miss Sun', riaa:'—' },
    { pos:100, artist:'Andy Gibb', song:'Time Is Time', riaa:'—' }
  ],
  1982: [
    { pos:  1, artist:'Olivia Newton-John', song:'Physical', riaa:'—' },
    { pos:  2, artist:'Survivor', song:'Eye Of The Tiger', riaa:'Multi-Platinum' },
    { pos:  3, artist:'Joan Jett and The Blackhearts', song:'I Love Rock N Roll', riaa:'—' },
    { pos:  4, artist:'Paul McCartney and Stevie Wonder', song:'Ebony And Ivory', riaa:'—' },
    { pos:  5, artist:'J. Geils Band', song:'Centerfold', riaa:'—' },
    { pos:  6, artist:'Human League', song:'Dont You Want Me', riaa:'—' },
    { pos:  7, artist:'John Cougar', song:'Jack And Diane', riaa:'—' },
    { pos:  8, artist:'John Cougar', song:'Hurts So Good', riaa:'—' },
    { pos:  9, artist:'Steve Miller Band', song:'Abracadabra', riaa:'—' },
    { pos: 10, artist:'Chicago', song:'Hard To Say Im Sorry', riaa:'—' },
    { pos: 11, artist:'Soft Cell', song:'Tainted Love', riaa:'—' },
    { pos: 12, artist:'Vangelis', song:'Chariots Of Fire', riaa:'—' },
    { pos: 13, artist:'Quarterflash', song:'Harden My Heart', riaa:'—' },
    { pos: 14, artist:'Toto', song:'Rosanna', riaa:'Platinum' },
    { pos: 15, artist:'Daryl Hall and John Oates', song:'I Cant Go For That', riaa:'—' },
    { pos: 16, artist:'Tommy Tutone', song:'867-5309 (Jenny)', riaa:'—' },
    { pos: 17, artist:'Bertie Higgins', song:'Key Largo', riaa:'—' },
    { pos: 18, artist:'Melissa Manchester', song:'You Should Hear How She Talks About You', riaa:'—' },
    { pos: 19, artist:'Foreigner', song:'Waiting For A Girl Like You', riaa:'—' },
    { pos: 20, artist:'Rick Springfield', song:'Dont Talk To Strangers', riaa:'—' },
    { pos: 21, artist:'Juice Newton', song:'The Sweetest Thing', riaa:'—' },
    { pos: 22, artist:'Willie Nelson', song:'Always On My Mind', riaa:'Platinum' },
    { pos: 23, artist:'Cars', song:'Shake It Up', riaa:'—' },
    { pos: 24, artist:'Dazz Band', song:'Let It Whip', riaa:'—' },
    { pos: 25, artist:'Go-Gos', song:'We Got The Beat', riaa:'—' },
    { pos: 26, artist:'Ray Parker Jr.', song:'The Other Woman', riaa:'—' },
    { pos: 27, artist:'George Benson', song:'Turn Your Love Around', riaa:'—' },
    { pos: 28, artist:'Air Supply', song:'Sweet Dreams', riaa:'—' },
    { pos: 29, artist:'Motels', song:'Only The Lonely', riaa:'—' },
    { pos: 30, artist:'Men At Work', song:'Who Can It Be Now?', riaa:'—' },
    { pos: 31, artist:'Fleetwood Mac', song:'Hold Me', riaa:'—' },
    { pos: 32, artist:'Alan Parsons Project', song:'Eye In The Sky', riaa:'Gold' },
    { pos: 33, artist:'Earth, Wind and Fire', song:'Lets Groove', riaa:'—' },
    { pos: 34, artist:'Journey', song:'Open Arms', riaa:'Gold' },
    { pos: 35, artist:'Dan Fogelberg', song:'Leader Of The Band', riaa:'—' },
    { pos: 36, artist:'Stevie Nicks and Don Henley', song:'Leather And Lace', riaa:'—' },
    { pos: 37, artist:'Air Supply', song:'Even The Nights Are Better', riaa:'—' },
    { pos: 38, artist:'Charlene', song:'Ive Never Been To Me', riaa:'—' },
    { pos: 39, artist:'Paul Davis', song:'65 Love Affair', riaa:'—' },
    { pos: 40, artist:'Asia', song:'Heat Of The Moment', riaa:'—' },
    { pos: 41, artist:'Little River Band', song:'Take It Easy On Me', riaa:'—' },
    { pos: 42, artist:'Buckner and Garcia', song:'Pac-Man Fever', riaa:'—' },
    { pos: 43, artist:'Stevie Wonder', song:'That Girl', riaa:'—' },
    { pos: 44, artist:'Daryl Hall and John Oates', song:'Private Eyes', riaa:'—' },
    { pos: 45, artist:'Lindsey Buckingham', song:'Trouble', riaa:'—' },
    { pos: 46, artist:'Roberta Flack', song:'Making Love', riaa:'—' },
    { pos: 47, artist:'Juice Newton', song:'Loves Been A Little Bit Hard On Me', riaa:'—' },
    { pos: 48, artist:'Rod Stewart', song:'Young Turks', riaa:'—' },
    { pos: 49, artist:'J. Geils Band', song:'Freeze-Frame', riaa:'—' },
    { pos: 50, artist:'REO Speedwagon', song:'Keep The Fire Burnin', riaa:'—' },
    { pos: 51, artist:'Huey Lewis and The News', song:'Do You Believe In Love', riaa:'—' },
    { pos: 52, artist:'Paul Davis', song:'Cool Night', riaa:'—' },
    { pos: 53, artist:'38 Special', song:'Caught Up In You', riaa:'—' },
    { pos: 54, artist:'Diana Ross', song:'Why Do Fools Fall In Love?', riaa:'—' },
    { pos: 55, artist:'Alabama', song:'Love In The First Degree', riaa:'—' },
    { pos: 56, artist:'Royal Philharmonic Orchestra', song:'Hooked On Classics', riaa:'—' },
    { pos: 57, artist:'Crosby, Stills and Nash', song:'Wasted On The Way', riaa:'—' },
    { pos: 58, artist:'Eddie Money', song:'Think Im In Love', riaa:'—' },
    { pos: 59, artist:'Donna Summer', song:'Love Is In Control', riaa:'—' },
    { pos: 60, artist:'Karla Bonoff', song:'Personally', riaa:'—' },
    { pos: 61, artist:'Quincy Jones', song:'Owe Hundred Ways', riaa:'—' },
    { pos: 62, artist:'Elton John', song:'Blue Eyes', riaa:'—' },
    { pos: 63, artist:'Go-Gos', song:'Our Lips Are Sealed', riaa:'—' },
    { pos: 64, artist:'Sheena Easton', song:'You Could Have Been Wih Me', riaa:'—' },
    { pos: 65, artist:'America', song:'You Can Do Magic', riaa:'—' },
    { pos: 66, artist:'Daryl Hall and John Oates', song:'Did It In A Minute', riaa:'—' },
    { pos: 67, artist:'A Flock Of Seagulls', song:'I Ran', riaa:'—' },
    { pos: 68, artist:'Jackson Browne', song:'Somebodys Baby', riaa:'—' },
    { pos: 69, artist:'Commodores', song:'Oh No', riaa:'—' },
    { pos: 70, artist:'Paul McCartney', song:'Take It Away', riaa:'—' },
    { pos: 71, artist:'Deneice Williams', song:'Its Gonna Take A Miracle', riaa:'—' },
    { pos: 72, artist:'Kenny Rogers', song:'Love Will Turn You Around', riaa:'—' },
    { pos: 73, artist:'Journey', song:'Dont Stop Bellevin', riaa:'—' },
    { pos: 74, artist:'Barbra Streisand', song:'Comin In And Out Of Your Life', riaa:'—' },
    { pos: 75, artist:'Laura Branigan', song:'Gloria', riaa:'—' },
    { pos: 76, artist:'Elton John', song:'Empty Garden', riaa:'—' },
    { pos: 77, artist:'Neil Diamond', song:'Yesterdays Songs', riaa:'—' },
    { pos: 78, artist:'Joan Jett and The Blackhearts', song:'Crimson And Clover', riaa:'—' },
    { pos: 79, artist:'Police', song:'Every Little Thing She Does Is Magic', riaa:'—' },
    { pos: 80, artist:'Air Supply', song:'Here I Am', riaa:'—' },
    { pos: 81, artist:'Michael McDonald', song:'I Keep Forgettin', riaa:'—' },
    { pos: 82, artist:'Kool and The Gang', song:'Get Down On It', riaa:'Gold' },
    { pos: 83, artist:'Ronnie Milsap', song:'Any Day Now', riaa:'—' },
    { pos: 84, artist:'Olivia Newton-John', song:'Make A Move On Me', riaa:'—' },
    { pos: 85, artist:'Kool and The Gang', song:'Take My Heart', riaa:'—' },
    { pos: 86, artist:'Diana Ross', song:'Mirror Mirror', riaa:'—' },
    { pos: 87, artist:'Go-Gos', song:'Vacation', riaa:'—' },
    { pos: 88, artist:'Van Halen', song:'(Oh) Pretty Woman', riaa:'—' },
    { pos: 89, artist:'Pointer Sisters', song:'Should I Do It', riaa:'—' },
    { pos: 90, artist:'Billy Idol', song:'Hot In The City', riaa:'—' },
    { pos: 91, artist:'Kim Wilde', song:'Kids In America', riaa:'—' },
    { pos: 92, artist:'Little River Band', song:'Man On Your Mind', riaa:'—' },
    { pos: 93, artist:'Michael Murphy', song:'Whats Forever For', riaa:'—' },
    { pos: 94, artist:'Rolling Stones', song:'Waiting On A Friend', riaa:'—' },
    { pos: 95, artist:'Stevie Wonder', song:'Do I Do', riaa:'—' },
    { pos: 96, artist:'Loverboy', song:'Working For The Weekend', riaa:'—' },
    { pos: 97, artist:'Greg Guidry', song:'Goin Down', riaa:'—' },
    { pos: 98, artist:'Christopher Cross', song:'Arthurs Theme', riaa:'—' },
    { pos: 99, artist:'Kenny Rogers', song:'Through The Years', riaa:'—' },
    { pos:100, artist:'Stevie Nicks', song:'Edge Of Seventeen', riaa:'—' }
  ],
  1983: [
    { pos:  1, artist:'Police', song:'Every Breath You Take', riaa:'—' },
    { pos:  2, artist:'Michael Jackson', song:'Billie Jean', riaa:'Multi-Platinum' },
    { pos:  3, artist:'Irene Cara', song:'Flashdance What A Feeling', riaa:'—' },
    { pos:  4, artist:'Men At Work', song:'Down Under', riaa:'—' },
    { pos:  5, artist:'Michael Jackson', song:'Beat It', riaa:'Multi-Platinum' },
    { pos:  6, artist:'Bonnie Tyler', song:'Total Eclipse Of The Heart', riaa:'Platinum' },
    { pos:  7, artist:'Daryl Hall and John Oates', song:'Maneater', riaa:'—' },
    { pos:  8, artist:'Patti Austin and James Ingram', song:'Baby Come To Me', riaa:'—' },
    { pos:  9, artist:'Michael Sembello', song:'Maniac', riaa:'—' },
    { pos: 10, artist:'Eurythmics', song:'Sweet Dreams (Are Made Of This)', riaa:'—' },
    { pos: 11, artist:'Culture Club', song:'Do You Really Want To Hurt Me', riaa:'—' },
    { pos: 12, artist:'Eddie Rabbitt and Crystal Gayle', song:'You And I', riaa:'—' },
    { pos: 13, artist:'Dexys Midnight Runners', song:'Come On Eileen', riaa:'—' },
    { pos: 14, artist:'Bob Seger and The Silver Bullet Band', song:'Shame On The Moon', riaa:'—' },
    { pos: 15, artist:'Donna Summer', song:'She Works Hard For The Money', riaa:'—' },
    { pos: 16, artist:'Sergio Mendes', song:'Never Gonna Let You Go', riaa:'—' },
    { pos: 17, artist:'Duran Duran', song:'Hungry Like The Wolf', riaa:'—' },
    { pos: 18, artist:'David Bowie', song:'Lets Dance', riaa:'—' },
    { pos: 19, artist:'Golden Earring', song:'Twilight Zone', riaa:'—' },
    { pos: 20, artist:'Frida', song:'I Know Theres Something Going On', riaa:'—' },
    { pos: 21, artist:'Greg Kihn Band', song:'Jeopardy', riaa:'—' },
    { pos: 22, artist:'Eddy Grant', song:'Electric Avenue', riaa:'Platinum' },
    { pos: 23, artist:'Thomas Dolby', song:'She Blinded Me Withh Science', riaa:'—' },
    { pos: 24, artist:'Toto', song:'Africa', riaa:'—' },
    { pos: 25, artist:'Prince', song:'Little Red Corvette', riaa:'—' },
    { pos: 26, artist:'Pretenders', song:'Back On The Chain Gang', riaa:'—' },
    { pos: 27, artist:'Joe Cocker and Jennifer Warnes', song:'Up Where We Belong', riaa:'—' },
    { pos: 28, artist:'Styx', song:'Mr. Roboto', riaa:'—' },
    { pos: 29, artist:'Lionel Richie', song:'You Are', riaa:'—' },
    { pos: 30, artist:'After The Fire', song:'Der Kommissar', riaa:'—' },
    { pos: 31, artist:'Taco', song:'Puttin On The Ritz', riaa:'—' },
    { pos: 32, artist:'Marvin Gaye', song:'Sexual Healing', riaa:'—' },
    { pos: 33, artist:'Human League', song:'(Keep Feeling) Fascination', riaa:'—' },
    { pos: 34, artist:'Culture Club', song:'Time (Clock Of The Heart)', riaa:'—' },
    { pos: 35, artist:'Men Without Hats', song:'The Safety Dance', riaa:'—' },
    { pos: 36, artist:'Toni Basil', song:'Mickey', riaa:'—' },
    { pos: 37, artist:'Phil Collins', song:'You Cant Hurry Love', riaa:'—' },
    { pos: 38, artist:'Journey', song:'Separate Ways', riaa:'—' },
    { pos: 39, artist:'Daryl Hall and John Oates', song:'One On One', riaa:'—' },
    { pos: 40, artist:'Kenny Rogers and Sheena Easton', song:'Weve Got Tonight', riaa:'—' },
    { pos: 41, artist:'Prince', song:'1999', riaa:'—' },
    { pos: 42, artist:'Stray Cats', song:'Stray Cat Strut', riaa:'—' },
    { pos: 43, artist:'Billy Joel', song:'Allentown', riaa:'—' },
    { pos: 44, artist:'Stevie Nicks', song:'Stand Back', riaa:'—' },
    { pos: 45, artist:'Billy Joel', song:'Tell Her About It', riaa:'Gold' },
    { pos: 46, artist:'Naked Eyes', song:'Always Somethmg There To Remind Me', riaa:'—' },
    { pos: 47, artist:'Lionel Richie', song:'Truly', riaa:'—' },
    { pos: 48, artist:'Don Henley', song:'Dirty Laundry', riaa:'—' },
    { pos: 49, artist:'Michael Jackson and Paul McCartney', song:'The Girl Is Mine', riaa:'—' },
    { pos: 50, artist:'Kajagoogoo', song:'Too Shy', riaa:'—' },
    { pos: 51, artist:'Adam Ant', song:'Goody Two Shoes', riaa:'—' },
    { pos: 52, artist:'Clash', song:'Rock The Casbah', riaa:'—' },
    { pos: 53, artist:'Madness', song:'Our House', riaa:'—' },
    { pos: 54, artist:'Men At Work', song:'Overkill', riaa:'—' },
    { pos: 55, artist:'Duran Duran', song:'Is There Something I Should Know', riaa:'—' },
    { pos: 56, artist:'Laura Branigan', song:'Gloria', riaa:'Platinum' },
    { pos: 57, artist:'Rick Springfield', song:'Affair Of The Heart', riaa:'—' },
    { pos: 58, artist:'Tubes', song:'Shes A Beauty', riaa:'—' },
    { pos: 59, artist:'Laura Branigan', song:'Solitaire', riaa:'—' },
    { pos: 60, artist:'Styx', song:'Dont Let It End', riaa:'—' },
    { pos: 61, artist:'Laura Branigan', song:'How Am I Supposed To Live Without You', riaa:'—' },
    { pos: 62, artist:'David Bowie', song:'China Girl', riaa:'—' },
    { pos: 63, artist:'Kinks', song:'Come Dancing', riaa:'—' },
    { pos: 64, artist:'Naked Eyes', song:'Promises, Promises', riaa:'—' },
    { pos: 65, artist:'Little River Band', song:'The Other Guy', riaa:'—' },
    { pos: 66, artist:'Air Supply', song:'Making Love Out Of Nothing At All', riaa:'—' },
    { pos: 67, artist:'Daryl Hall and John Oates', song:'Family Man', riaa:'—' },
    { pos: 68, artist:'Michael Jackson', song:'Wanna Be Startin Somethin', riaa:'Platinum' },
    { pos: 69, artist:'Toto', song:'I Wont Hold You Back', riaa:'—' },
    { pos: 70, artist:'Christopher Cross', song:'All Right', riaa:'—' },
    { pos: 71, artist:'Bryan Adams', song:'Straight From The Heart', riaa:'—' },
    { pos: 72, artist:'Kenny Loggins', song:'Heart To Heart', riaa:'—' },
    { pos: 73, artist:'Lionel Richie', song:'My Love', riaa:'—' },
    { pos: 74, artist:'Elton John', song:'Im Still Standing', riaa:'Gold' },
    { pos: 75, artist:'Loverboy', song:'Hot Girls In Love', riaa:'—' },
    { pos: 76, artist:'Men At Work', song:'Its A Mistake', riaa:'—' },
    { pos: 77, artist:'Culture Club', song:'Ill Tumble 4 Ya', riaa:'—' },
    { pos: 78, artist:'Debarge', song:'All This Love', riaa:'—' },
    { pos: 79, artist:'Sammy Hagar', song:'Your Love Is Driving Me Crazy', riaa:'—' },
    { pos: 80, artist:'Dionne Warwick', song:'Heartbreaker', riaa:'—' },
    { pos: 81, artist:'Journey', song:'Faithfully', riaa:'—' },
    { pos: 82, artist:'Joe Jackson', song:'Steppin Out', riaa:'—' },
    { pos: 83, artist:'Quarterflash', song:'Take Me To Heart', riaa:'—' },
    { pos: 84, artist:'Stray Cats', song:'(Shes) Sexy + 17', riaa:'—' },
    { pos: 85, artist:'Champaign', song:'Try Again', riaa:'—' },
    { pos: 86, artist:'Shalamar', song:'Dead Giveaway', riaa:'—' },
    { pos: 87, artist:'Jackson Browne', song:'Lawyers In Love', riaa:'—' },
    { pos: 88, artist:'Moving Pictures', song:'What About Me', riaa:'—' },
    { pos: 89, artist:'Michael Jackson', song:'Human Nature', riaa:'Platinum' },
    { pos: 90, artist:'Def Leppard', song:'Photograph', riaa:'—' },
    { pos: 91, artist:'Musical Youth', song:'Pass The Dutchie', riaa:'—' },
    { pos: 92, artist:'Spandau Ballet', song:'TRUE', riaa:'—' },
    { pos: 93, artist:'Frank Stallone', song:'Far From Over', riaa:'—' },
    { pos: 94, artist:'Eric Clapton', song:'Ive Got A Rock N Roll Heart', riaa:'—' },
    { pos: 95, artist:'Stephen Bishop', song:'It Might Be You', riaa:'—' },
    { pos: 96, artist:'Peabo Bryson and Roberta Flack', song:'Tonight I Celebrate My Love', riaa:'—' },
    { pos: 97, artist:'Tom Petty and The Heartbreakers', song:'You Got Lucky', riaa:'—' },
    { pos: 98, artist:'Asia', song:'Dont Cry', riaa:'—' },
    { pos: 99, artist:'Joe Jackson', song:'Breaking Us In Two', riaa:'—' },
    { pos:100, artist:'Earth, Wind and Fire', song:'Fall In Love With Me', riaa:'—' }
  ],
  1984: [
    { pos:  1, artist:'Prince', song:'When Doves Cry', riaa:'—' },
    { pos:  2, artist:'Tina Turner', song:'Whats Love Got To Do With It', riaa:'—' },
    { pos:  3, artist:'Paul McCartney and Michael Jackson', song:'Say Say Say', riaa:'Platinum' },
    { pos:  4, artist:'Kenny Loggins', song:'Footloose', riaa:'Platinum' },
    { pos:  5, artist:'Phil Collins', song:'Against All Odds (Take A Look At Me Now)', riaa:'—' },
    { pos:  6, artist:'Van Halen', song:'Jump', riaa:'—' },
    { pos:  7, artist:'Lionel Richie', song:'Hello', riaa:'Gold' },
    { pos:  8, artist:'Yes', song:'Owner Of A Lonely Heart', riaa:'—' },
    { pos:  9, artist:'Ray Parker Jr.', song:'Ghostbusters', riaa:'—' },
    { pos: 10, artist:'Culture Club', song:'Karma Chameleon', riaa:'—' },
    { pos: 11, artist:'John Waite', song:'Missing You', riaa:'—' },
    { pos: 12, artist:'Lionel Richie', song:'All Night Long (All Night)', riaa:'Gold' },
    { pos: 13, artist:'Deniece Williams', song:'Lets Hear It For The Boy', riaa:'Platinum' },
    { pos: 14, artist:'Bruce Springsteen', song:'Dancing In The Dark', riaa:'Platinum' },
    { pos: 15, artist:'Cyndi Lauper', song:'Girls Just Want To Have Fun', riaa:'Platinum' },
    { pos: 16, artist:'Duran Duran', song:'The Reflex', riaa:'Gold' },
    { pos: 17, artist:'Cyndi Lauper', song:'Time After Time', riaa:'Gold' },
    { pos: 18, artist:'Pointer Sisters', song:'Jump (For My Love)', riaa:'—' },
    { pos: 19, artist:'Romantics', song:'Talking In Your Sleep', riaa:'—' },
    { pos: 20, artist:'Laura Branigan', song:'Self Control', riaa:'—' },
    { pos: 21, artist:'Prince and The Revolution', song:'Lets Go Crazy', riaa:'—' },
    { pos: 22, artist:'Daryl Hall and John Oates', song:'Say It Isnt So', riaa:'—' },
    { pos: 23, artist:'Thompson Twins', song:'Hold Me Now', riaa:'—' },
    { pos: 24, artist:'Kool and The Gang', song:'Joanna', riaa:'Gold' },
    { pos: 25, artist:'Stevie Wonder', song:'I Just Called To Say I Love You', riaa:'Gold' },
    { pos: 26, artist:'Rockwell', song:'Somebodys Watching Me', riaa:'Gold' },
    { pos: 27, artist:'Matthew Wilder', song:'Break My Stride', riaa:'—' },
    { pos: 28, artist:'Nena', song:'99 Luftballons', riaa:'—' },
    { pos: 29, artist:'Dan Hartman', song:'I Can Dream About You', riaa:'—' },
    { pos: 30, artist:'Sheila E.', song:'The Glamorous Life', riaa:'—' },
    { pos: 31, artist:'Steve Perry', song:'Oh Sherrie', riaa:'—' },
    { pos: 32, artist:'Lionel Richie', song:'Stuck On You', riaa:'—' },
    { pos: 33, artist:'Elton John', song:'I Guess Thats Why They Call It The Blues', riaa:'—' },
    { pos: 34, artist:'Cyndi Lauper', song:'She Bop', riaa:'Gold' },
    { pos: 35, artist:'Madonna', song:'Borderline', riaa:'Gold' },
    { pos: 36, artist:'Corey Hart', song:'Sunglasses At Night', riaa:'—' },
    { pos: 37, artist:'Billy Idol', song:'Eyes Without A Face', riaa:'—' },
    { pos: 38, artist:'Eurythmics', song:'Here Comes The Rain Again', riaa:'—' },
    { pos: 39, artist:'Billy Joel', song:'Uptown Girl', riaa:'Multi-Platinum' },
    { pos: 40, artist:'Night Ranger', song:'Sister Christian', riaa:'—' },
    { pos: 41, artist:'Cars', song:'Drive', riaa:'—' },
    { pos: 42, artist:'Olivia Newton-John', song:'Twist Of Fate', riaa:'—' },
    { pos: 43, artist:'Duran Duran', song:'Union Of The Snake', riaa:'—' },
    { pos: 44, artist:'Huey Lewis and The News', song:'The Heart Of Rock N Roll', riaa:'—' },
    { pos: 45, artist:'Chicago', song:'Hard Habit To Break', riaa:'—' },
    { pos: 46, artist:'Scandal', song:'The Warrior', riaa:'—' },
    { pos: 47, artist:'Peabo Bryson', song:'If Ever Youre In My Arms Again', riaa:'—' },
    { pos: 48, artist:'Pointer Sisters', song:'Automatic', riaa:'—' },
    { pos: 49, artist:'Shannon', song:'Let The Music Play', riaa:'—' },
    { pos: 50, artist:'Julio Iglesias and Willie Nelson', song:'To All The Girls Ive Loved Before', riaa:'Platinum' },
    { pos: 51, artist:'Billy Ocean', song:'Caribbean Queen', riaa:'—' },
    { pos: 52, artist:'Genesis', song:'Thats All', riaa:'—' },
    { pos: 53, artist:'Lionel Richie', song:'Running With The Night', riaa:'—' },
    { pos: 54, artist:'Elton John', song:'Sad Songs (Say So Much)', riaa:'—' },
    { pos: 55, artist:'Huey Lewis and The News', song:'I Want A New Drug', riaa:'Gold' },
    { pos: 56, artist:'Kenny Rogers and Dolly Parton', song:'Islands In The Stream', riaa:'Gold' },
    { pos: 57, artist:'Pat Benatar', song:'Love Is A Battlefield', riaa:'Gold' },
    { pos: 58, artist:'Rod Stewart', song:'Infatuation', riaa:'—' },
    { pos: 59, artist:'Mike Reno and Ann Wilson', song:'Almost Paradise', riaa:'—' },
    { pos: 60, artist:'ZZ Top', song:'Legs', riaa:'—' },
    { pos: 61, artist:'Jacksons', song:'State Of Shock', riaa:'—' },
    { pos: 62, artist:'Rick Springfield', song:'Love Somebody', riaa:'—' },
    { pos: 63, artist:'Culture Club', song:'Miss Me Blind', riaa:'—' },
    { pos: 64, artist:'Huey Lewis and The News', song:'If This Is It', riaa:'—' },
    { pos: 65, artist:'Cars', song:'You Might Think', riaa:'—' },
    { pos: 66, artist:'Madonna', song:'Lucky Star', riaa:'—' },
    { pos: 67, artist:'Bruce Springsteen', song:'Cover Me', riaa:'Gold' },
    { pos: 68, artist:'Quiet Riot', song:'Cum On Feel The Noize', riaa:'—' },
    { pos: 69, artist:'Irene Cara', song:'Breakdance', riaa:'—' },
    { pos: 70, artist:'Daryl Hall and John Oates', song:'Adult Education', riaa:'—' },
    { pos: 71, artist:'Tracy Ullman', song:'They Dont Know', riaa:'—' },
    { pos: 72, artist:'Billy Joel', song:'An Innocent Man', riaa:'—' },
    { pos: 73, artist:'Bananarama', song:'Cruel Summer', riaa:'—' },
    { pos: 74, artist:'Wang Chung', song:'Dance Hall Days', riaa:'—' },
    { pos: 75, artist:'K.C.', song:'Give It Up', riaa:'—' },
    { pos: 76, artist:'Pointer Sisters', song:'Im So Excited', riaa:'—' },
    { pos: 77, artist:'Ray Parker Jr.', song:'I Still Cant Get Over Loving You', riaa:'—' },
    { pos: 78, artist:'Michael Jackson', song:'Thriller', riaa:'Multi-Platinum' },
    { pos: 79, artist:'Madonna', song:'Holiday', riaa:'—' },
    { pos: 80, artist:'Ollie And Jerry', song:'Breakin Theres No Stopping Us', riaa:'—' },
    { pos: 81, artist:'John Lennon', song:'Nobody Told Me', riaa:'—' },
    { pos: 82, artist:'Culture Club', song:'Church Of The Poison Mind', riaa:'—' },
    { pos: 83, artist:'Christopher Cross', song:'Think Of Laura', riaa:'—' },
    { pos: 84, artist:'Debarge', song:'Time Will Reveal', riaa:'—' },
    { pos: 85, artist:'Police', song:'Wrapped Around Your Finger', riaa:'—' },
    { pos: 86, artist:'John Cougar Mellencamp', song:'Pink Houses', riaa:'—' },
    { pos: 87, artist:'Ratt', song:'Round And Round', riaa:'—' },
    { pos: 88, artist:'Go-Gos', song:'Head Over Heels', riaa:'—' },
    { pos: 89, artist:'Billy Joel', song:'The Longest Time', riaa:'Platinum' },
    { pos: 90, artist:'Kool and The Gang', song:'Tonight', riaa:'—' },
    { pos: 91, artist:'Christine McVie', song:'Got A Hold On Me', riaa:'—' },
    { pos: 92, artist:'Shalamar', song:'Dancing In The Sheets', riaa:'—' },
    { pos: 93, artist:'Rolling Stones', song:'Undercover Of The Night', riaa:'—' },
    { pos: 94, artist:'John Cafferty and The Beaver Brown Band', song:'On The Dark Side', riaa:'—' },
    { pos: 95, artist:'Duran Duran', song:'New Moon On Monday', riaa:'—' },
    { pos: 96, artist:'Peter Schilling', song:'Major Tom (Coming Home)', riaa:'—' },
    { pos: 97, artist:'Cars', song:'Magic', riaa:'—' },
    { pos: 98, artist:'Night Ranger', song:'When You Close Your Eyes', riaa:'—' },
    { pos: 99, artist:'Billy Squier', song:'Rock Me Tonite', riaa:'—' },
    { pos:100, artist:'James Ingram and Michael McDonald', song:'Yah Mo B There', riaa:'—' }
  ],
  1985: [
    { pos:  1, artist:'Wham!', song:'Careless Whisper', riaa:'Platinum' },
    { pos:  2, artist:'Madonna', song:'Like A Virgin', riaa:'Gold' },
    { pos:  3, artist:'Wham!', song:'Wake Me Up Before You Go-Go', riaa:'Platinum' },
    { pos:  4, artist:'Foreigner', song:'I Want To Know What Love Is', riaa:'—' },
    { pos:  5, artist:'Chaka Khan', song:'I Feel For You', riaa:'—' },
    { pos:  6, artist:'Daryl Hall and John Oates', song:'Out Of Touch', riaa:'—' },
    { pos:  7, artist:'Tears For Fears', song:'Everybody Wants To Rule The World', riaa:'—' },
    { pos:  8, artist:'Dire Straits', song:'Money For Nothing', riaa:'—' },
    { pos:  9, artist:'Madonna', song:'Crazy For You', riaa:'—' },
    { pos: 10, artist:'A-Ha', song:'Take On Me', riaa:'—' },
    { pos: 11, artist:'Paul Young', song:'Everytime You Go Away', riaa:'Gold' },
    { pos: 12, artist:'Phil Collins and Philip Bailey', song:'Easy Lover', riaa:'—' },
    { pos: 13, artist:'REO Speedwagon', song:'Cant Fight This Feeling', riaa:'Gold' },
    { pos: 14, artist:'Starship', song:'We Built This City', riaa:'Gold' },
    { pos: 15, artist:'Huey Lewis and The News', song:'The Power Of Love', riaa:'Gold' },
    { pos: 16, artist:'Simple Minds', song:'Dont You (Forget About Me)', riaa:'—' },
    { pos: 17, artist:'Kool and The Gang', song:'Cherish', riaa:'Gold' },
    { pos: 18, artist:'John Parr', song:'St. Elmos Fire (Man In Motion)', riaa:'—' },
    { pos: 19, artist:'Glenn Frey', song:'The Heat Is On', riaa:'—' },
    { pos: 20, artist:'U.S.A. For Africa', song:'We Are The World', riaa:'Multi-Platinum' },
    { pos: 21, artist:'Tears For Fears', song:'Shout', riaa:'Gold' },
    { pos: 22, artist:'Stevie Wonder', song:'Part-Time Lover', riaa:'—' },
    { pos: 23, artist:'Whitney Houston', song:'Saving All My Love For You', riaa:'Platinum' },
    { pos: 24, artist:'Bryan Adams', song:'Heaven', riaa:'—' },
    { pos: 25, artist:'Wham!', song:'Everything She Wants', riaa:'Gold' },
    { pos: 26, artist:'New Edition', song:'Cool It Now', riaa:'Gold' },
    { pos: 27, artist:'Jan Hammer', song:'Miami Vice Theme', riaa:'—' },
    { pos: 28, artist:'Billy Ocean', song:'Lover Boy', riaa:'—' },
    { pos: 29, artist:'Teena Marie', song:'Lover Girl', riaa:'—' },
    { pos: 30, artist:'Glenn Frey', song:'You Belong To The City', riaa:'—' },
    { pos: 31, artist:'Ready For The World', song:'Oh Sheila', riaa:'—' },
    { pos: 32, artist:'Debarge', song:'Rhythm Of The Night', riaa:'—' },
    { pos: 33, artist:'Phil Collins', song:'One More Night', riaa:'Gold' },
    { pos: 34, artist:'Honeydrippers', song:'Sea Of Love', riaa:'—' },
    { pos: 35, artist:'Duran Duran', song:'A View To A Kill', riaa:'Gold' },
    { pos: 36, artist:'Duran Duran', song:'The Wild Boys', riaa:'—' },
    { pos: 37, artist:'Chicago', song:'Youre The Inspiration', riaa:'—' },
    { pos: 38, artist:'Pointer Sisters', song:'Neutron Dance', riaa:'—' },
    { pos: 39, artist:'Pat Benatar', song:'We Belong', riaa:'—' },
    { pos: 40, artist:'Commodores', song:'Nightshift', riaa:'—' },
    { pos: 41, artist:'Howard Jones', song:'Things Can Only Get Better', riaa:'—' },
    { pos: 42, artist:'Jack Wagner', song:'All I Need', riaa:'—' },
    { pos: 43, artist:'Aretha Franklin', song:'Freeway Of Love', riaa:'—' },
    { pos: 44, artist:'Corey Hart', song:'Never Surrender', riaa:'—' },
    { pos: 45, artist:'Phil Collins', song:'Sussudio', riaa:'Gold' },
    { pos: 46, artist:'Sheena Easton', song:'Strut', riaa:'—' },
    { pos: 47, artist:'Whitney Houston', song:'You Give Good Love', riaa:'Platinum' },
    { pos: 48, artist:'Survivor', song:'The Search Is Over', riaa:'—' },
    { pos: 49, artist:'Diana Ross', song:'Missing You', riaa:'—' },
    { pos: 50, artist:'Phil Collins and Marilyn Martin', song:'Separate Lives', riaa:'—' },
    { pos: 51, artist:'Prince and The Revolution', song:'Raspberry Beret', riaa:'—' },
    { pos: 52, artist:'Billy Ocean', song:'Suddenly', riaa:'—' },
    { pos: 53, artist:'Don Henley', song:'The Boys Of Summer', riaa:'—' },
    { pos: 54, artist:'Murray Head', song:'One Night In Bangkok', riaa:'—' },
    { pos: 55, artist:'Sting', song:'If You Love Somebody Set Them Free', riaa:'—' },
    { pos: 56, artist:'Animotion', song:'Obsession', riaa:'—' },
    { pos: 57, artist:'Tina Turner', song:'We Dont Need Another Hero', riaa:'—' },
    { pos: 58, artist:'Madonna', song:'Material Girl', riaa:'—' },
    { pos: 59, artist:'Tina Turner', song:'Better Be Good To Me', riaa:'—' },
    { pos: 60, artist:'Tears For Fears', song:'Head Over Heels', riaa:'—' },
    { pos: 61, artist:'Harold Faltermeyer', song:'Axel F', riaa:'—' },
    { pos: 62, artist:'Sade', song:'Smooth Operator', riaa:'—' },
    { pos: 63, artist:'Mary Jane Girls', song:'In My House', riaa:'—' },
    { pos: 64, artist:'Phil Collins', song:'Dont Lose My Number', riaa:'—' },
    { pos: 65, artist:'Cyndi Lauper', song:'All Through The Night', riaa:'—' },
    { pos: 66, artist:'Bryan Adams', song:'Run To You', riaa:'—' },
    { pos: 67, artist:'Bruce Springsteen', song:'Glory Days', riaa:'—' },
    { pos: 68, artist:'Til Tuesday', song:'Voices Carry', riaa:'—' },
    { pos: 69, artist:'Kool and The Gang', song:'Misled', riaa:'—' },
    { pos: 70, artist:'Eurythmics', song:'Would I Lie To You?', riaa:'—' },
    { pos: 71, artist:'ABC', song:'Be Near Me', riaa:'—' },
    { pos: 72, artist:'Paul McCartney', song:'No More Lonely Nights', riaa:'—' },
    { pos: 73, artist:'Survivor', song:'I Cant Hold Back', riaa:'—' },
    { pos: 74, artist:'Bryan Adams', song:'Summer Of 69', riaa:'—' },
    { pos: 75, artist:'Katrina and The Waves', song:'Walking On Sunshine', riaa:'—' },
    { pos: 76, artist:'Wham!', song:'Freedom', riaa:'—' },
    { pos: 77, artist:'Julian Lennon', song:'Too Late For Goodbyes', riaa:'—' },
    { pos: 78, artist:'Julian Lennon', song:'Valotte', riaa:'—' },
    { pos: 79, artist:'Power Station', song:'Some Like It Hot', riaa:'—' },
    { pos: 80, artist:'Ashford and Simpson', song:'Solid', riaa:'—' },
    { pos: 81, artist:'Madonna', song:'Angel', riaa:'—' },
    { pos: 82, artist:'Bruce Springsteen', song:'Im On Fire', riaa:'—' },
    { pos: 83, artist:'Daryl Hall and John Oates', song:'Method Op Modern Love', riaa:'—' },
    { pos: 84, artist:'Thompson Twins', song:'Lay Your Hands On Me', riaa:'—' },
    { pos: 85, artist:'Debarge', song:'Whos Holding Donna Now', riaa:'—' },
    { pos: 86, artist:'John Cougar Mellencamp', song:'Lonely Ol Night', riaa:'—' },
    { pos: 87, artist:'Heart', song:'What About Love', riaa:'—' },
    { pos: 88, artist:'David Lee Roth', song:'California Girls', riaa:'—' },
    { pos: 89, artist:'Kool and The Gang', song:'Fresh', riaa:'—' },
    { pos: 90, artist:'Jermaine Jackson', song:'Do What You Do', riaa:'—' },
    { pos: 91, artist:'The Time', song:'Jungle Of Love', riaa:'—' },
    { pos: 92, artist:'Bruce Springsteen', song:'Born In The USA', riaa:'Gold' },
    { pos: 93, artist:'Tina Turner', song:'Private Dancer', riaa:'—' },
    { pos: 94, artist:'Aretha Franklin', song:'Whos Zoomin Who', riaa:'—' },
    { pos: 95, artist:'Sting', song:'Fortress Around Your Heart', riaa:'—' },
    { pos: 96, artist:'Lionel Richie', song:'Penny Lover', riaa:'—' },
    { pos: 97, artist:'Don Henley', song:'All She Wants To Do Is Dance', riaa:'—' },
    { pos: 98, artist:'Madonna', song:'Dress You Up', riaa:'—' },
    { pos: 99, artist:'Night Ranger', song:'Sentimental Street', riaa:'—' },
    { pos:100, artist:'Sheena Easton', song:'Sugar Walls', riaa:'—' }
  ],
  1986: [
    { pos:  1, artist:'Dionne and Friends', song:'Thats What Friends Are For', riaa:'Gold' },
    { pos:  2, artist:'Lionel Richie', song:'Say You, Say Me', riaa:'Gold' },
    { pos:  3, artist:'Klymaxx', song:'I Miss You', riaa:'—' },
    { pos:  4, artist:'Patti Labelle and Michael McDonald', song:'On My Own', riaa:'Gold' },
    { pos:  5, artist:'Mr. Mister', song:'Broken Wings', riaa:'—' },
    { pos:  6, artist:'Whitney Houston', song:'How Will I Know', riaa:'Multi-Platinum' },
    { pos:  7, artist:'Eddie Murphy', song:'Party All The Time', riaa:'Platinum' },
    { pos:  8, artist:'Survivor', song:'Burning Heart', riaa:'—' },
    { pos:  9, artist:'Mr. Mister', song:'Kyrie', riaa:'—' },
    { pos: 10, artist:'Robert Palmer', song:'Addicted To Love', riaa:'Gold' },
    { pos: 11, artist:'Whitney Houston', song:'Greatest Love Of All', riaa:'Platinum' },
    { pos: 12, artist:'Atlantic Starr', song:'Secret Lovers', riaa:'—' },
    { pos: 13, artist:'Carl Anderson and Gloria Loring', song:'Friends And Lovers', riaa:'—' },
    { pos: 14, artist:'Peter Cetera', song:'Glory Of Love', riaa:'—' },
    { pos: 15, artist:'Pet Shop Boys', song:'West End Girls', riaa:'—' },
    { pos: 16, artist:'Billy Ocean', song:'Therell Be Sad Songs', riaa:'—' },
    { pos: 17, artist:'Simple Minds', song:'Alive And Kicking', riaa:'—' },
    { pos: 18, artist:'Heart', song:'Never', riaa:'—' },
    { pos: 19, artist:'Prince and The Revolution', song:'Kiss', riaa:'Gold' },
    { pos: 20, artist:'Steve Winwood', song:'Higher Love', riaa:'—' },
    { pos: 21, artist:'Huey Lewis and The News', song:'Stuck With You', riaa:'—' },
    { pos: 22, artist:'Simply Red', song:'Holding Back The Years', riaa:'—' },
    { pos: 23, artist:'Peter Gabriel', song:'Sledgehammer', riaa:'—' },
    { pos: 24, artist:'Starship', song:'Sara', riaa:'—' },
    { pos: 25, artist:'Human League', song:'Human', riaa:'—' },
    { pos: 26, artist:'Nu Shooz', song:'I Cant Wait', riaa:'Gold' },
    { pos: 27, artist:'Berlin', song:'Take My Breath Away', riaa:'Gold' },
    { pos: 28, artist:'Falco', song:'Rock Me Amadeus', riaa:'—' },
    { pos: 29, artist:'Madonna', song:'Papa Dont Preach', riaa:'Gold' },
    { pos: 30, artist:'Bon Jovi', song:'You Give Love A Bad Name', riaa:'—' },
    { pos: 31, artist:'Billy Ocean', song:'When The Going Gets Tough', riaa:'—' },
    { pos: 32, artist:'Janet Jackson', song:'When I Think Of You', riaa:'Gold' },
    { pos: 33, artist:'Heart', song:'These Dreams', riaa:'—' },
    { pos: 34, artist:'Glass Tiger', song:'Dont Forget Me (When Im Gone)', riaa:'—' },
    { pos: 35, artist:'Madonna', song:'Live To Tell', riaa:'—' },
    { pos: 36, artist:'Belinda Carlisle', song:'Mad About You', riaa:'—' },
    { pos: 37, artist:'Level 42', song:'Something About You', riaa:'—' },
    { pos: 38, artist:'Bananarama', song:'Venus', riaa:'—' },
    { pos: 39, artist:'Lionel Richie', song:'Dancing On The Ceiling', riaa:'—' },
    { pos: 40, artist:'Miami Sound Machine', song:'Conga', riaa:'Gold' },
    { pos: 41, artist:'Cyndi Lauper', song:'True Colors', riaa:'Platinum' },
    { pos: 42, artist:'Kenny Loggins', song:'Danger Zone', riaa:'—' },
    { pos: 43, artist:'Janet Jackson', song:'What Have You Done For Me Lately', riaa:'Gold' },
    { pos: 44, artist:'Howard Jones', song:'No One Is To Blame', riaa:'—' },
    { pos: 45, artist:'Sly Fox', song:'Lets Go All The Way', riaa:'—' },
    { pos: 46, artist:'Robert Palmer', song:'I Didnt Mean To Turn You On', riaa:'—' },
    { pos: 47, artist:'Miami Sound Machine', song:'Words Get In The Way', riaa:'—' },
    { pos: 48, artist:'Bangles', song:'Manic Monday', riaa:'—' },
    { pos: 49, artist:'Dire Straits', song:'Walk Of Life', riaa:'—' },
    { pos: 50, artist:'Boston', song:'Amanda', riaa:'—' },
    { pos: 51, artist:'Stacey Q', song:'Two Of Hearts', riaa:'—' },
    { pos: 52, artist:'Jets', song:'Crush On You', riaa:'—' },
    { pos: 53, artist:'Orchestral Manoeuvres In The Dark', song:'If You Leave', riaa:'—' },
    { pos: 54, artist:'Genesis', song:'Invisible Touch', riaa:'—' },
    { pos: 55, artist:'Sade', song:'The Sweetest Taboo', riaa:'—' },
    { pos: 56, artist:'INXS', song:'What You Need', riaa:'—' },
    { pos: 57, artist:'Stevie Nicks', song:'Talk To Me', riaa:'—' },
    { pos: 58, artist:'Janet Jackson', song:'Nasty', riaa:'Gold' },
    { pos: 59, artist:'Eddie Money', song:'Take Me Home Tonight', riaa:'—' },
    { pos: 60, artist:'Jermaine Stewart', song:'We Dont Have To Take Our Clothes Off', riaa:'—' },
    { pos: 61, artist:'Lisa Lisa and Cult Jam With Full Force', song:'All Cried Out', riaa:'Gold' },
    { pos: 62, artist:'Outfield', song:'Your Love', riaa:'—' },
    { pos: 63, artist:'Wham!', song:'Im Your Man', riaa:'—' },
    { pos: 64, artist:'Scritti Politti', song:'Perfect Way', riaa:'—' },
    { pos: 65, artist:'James Brown', song:'Living In America', riaa:'—' },
    { pos: 66, artist:'John Cougar Mellencamp', song:'R.O.C.K. In The U.S.A.', riaa:'—' },
    { pos: 67, artist:'El Debarge', song:'Whos Johnny', riaa:'—' },
    { pos: 68, artist:'Cameo', song:'Word Up', riaa:'—' },
    { pos: 69, artist:'Van Halen', song:'Why Cant This Be Love', riaa:'—' },
    { pos: 70, artist:'Mike and The Mechanics', song:'Silent Running', riaa:'—' },
    { pos: 71, artist:'Tina Turner', song:'Typical Male', riaa:'—' },
    { pos: 72, artist:'John Cougar Mellencamp', song:'Small Town', riaa:'—' },
    { pos: 73, artist:'Baltimora', song:'Tarzan Boy', riaa:'—' },
    { pos: 74, artist:'Mike and The Mechanics', song:'All I Need Is A Miracle', riaa:'—' },
    { pos: 75, artist:'Michael McDonald', song:'Sweet Freedom', riaa:'—' },
    { pos: 76, artist:'Madonna', song:'True Blue', riaa:'Gold' },
    { pos: 77, artist:'Timex Social Club', song:'Rumors', riaa:'—' },
    { pos: 78, artist:'Dream Academy', song:'Life In A Northern Town', riaa:'—' },
    { pos: 79, artist:'Miami Sound Machine', song:'Bad Boy', riaa:'Gold' },
    { pos: 80, artist:'ZZ Top', song:'Sleeping Bag', riaa:'—' },
    { pos: 81, artist:'Cars', song:'Tonight She Comes', riaa:'—' },
    { pos: 82, artist:'Rod Stewart', song:'Love Touch', riaa:'—' },
    { pos: 83, artist:'Sheila E.', song:'A Love Bizarre', riaa:'—' },
    { pos: 84, artist:'Genesis', song:'Throwing It All Away', riaa:'—' },
    { pos: 85, artist:'Regina', song:'Baby Love', riaa:'—' },
    { pos: 86, artist:'Arcadia', song:'Election Day', riaa:'—' },
    { pos: 87, artist:'Elton John', song:'Nikita', riaa:'—' },
    { pos: 88, artist:'Phil Collins', song:'Take Me Home', riaa:'—' },
    { pos: 89, artist:'Run-D.M.C. (Feat. Aerosmith)', song:'Walk This Way', riaa:'Platinum' },
    { pos: 90, artist:'Anita Baker', song:'Sweet Love', riaa:'—' },
    { pos: 91, artist:'Moody Blues', song:'Your Wildest Dreams', riaa:'—' },
    { pos: 92, artist:'Paul McCartney', song:'Spies Like Us', riaa:'—' },
    { pos: 93, artist:'Starpoint', song:'Object Of My Desire', riaa:'—' },
    { pos: 94, artist:'Daryl Hall', song:'Dreamtime', riaa:'—' },
    { pos: 95, artist:'Force M.D.s', song:'Tender Love', riaa:'—' },
    { pos: 96, artist:'Thompson Twins', song:'King For A Day', riaa:'—' },
    { pos: 97, artist:'Lionel Richie', song:'Love Will Conquer All', riaa:'—' },
    { pos: 98, artist:'George Michael', song:'A Different Corner', riaa:'—' },
    { pos: 99, artist:'Toto', song:'Ill Be Over You', riaa:'—' },
    { pos:100, artist:'Stevie Wonder', song:'Go Home', riaa:'—' }
  ],
  1987: [
    { pos:  1, artist:'Bangles', song:'Walk Like An Egyptian', riaa:'Gold' },
    { pos:  2, artist:'Heart', song:'Alone', riaa:'—' },
    { pos:  3, artist:'Gregory Abbott', song:'Shake You Down', riaa:'Platinum' },
    { pos:  4, artist:'Whitney Houston', song:'I Wanna Dance With Somebody (Who Loves Me)', riaa:'Multi-Platinum' },
    { pos:  5, artist:'Starship', song:'Nothings Gonna Stop Us Now', riaa:'Gold' },
    { pos:  6, artist:'Robbie Nevil', song:'Cest La Vie', riaa:'—' },
    { pos:  7, artist:'Whitesnake', song:'Here I Go Again', riaa:'—' },
    { pos:  8, artist:'Bruce Hornsby and The Range', song:'The Way It Is', riaa:'—' },
    { pos:  9, artist:'Bob Seger', song:'Shakedown', riaa:'—' },
    { pos: 10, artist:'Bon Jovi', song:'Livin On A Prayer', riaa:'—' },
    { pos: 11, artist:'Los Lobos', song:'La Bamba', riaa:'—' },
    { pos: 12, artist:'Wang Chung', song:'Everybody Have Fun Tonight', riaa:'—' },
    { pos: 13, artist:'Crowded House', song:'Dont Dream Its Over', riaa:'—' },
    { pos: 14, artist:'Atlantic Starr', song:'Always', riaa:'—' },
    { pos: 15, artist:'U2', song:'With Or Without You', riaa:'—' },
    { pos: 16, artist:'Jody Watley', song:'Looking For A New Love', riaa:'—' },
    { pos: 17, artist:'Lisa Lisa and Cult Jam', song:'Head To Toe', riaa:'Gold' },
    { pos: 18, artist:'Tiffany', song:'I Think Were Alone Now', riaa:'—' },
    { pos: 19, artist:'Billy Idol', song:'Mony Mony', riaa:'—' },
    { pos: 20, artist:'Billy Vera and The Beaters', song:'At This Moment', riaa:'Gold' },
    { pos: 21, artist:'Chris De Burgh', song:'The Lady In Red', riaa:'—' },
    { pos: 22, artist:'Whitney Houston', song:'Didnt We Almost Have It All', riaa:'Gold' },
    { pos: 23, artist:'U2', song:'I Still Havent Found What Im Looking For', riaa:'—' },
    { pos: 24, artist:'George Michael', song:'I Want Your Sex', riaa:'Gold' },
    { pos: 25, artist:'Duran Duran', song:'Notorious', riaa:'—' },
    { pos: 26, artist:'Debbie Gibson', song:'Only In My Dreams', riaa:'Gold' },
    { pos: 27, artist:'Bill Medley and Jennifer Warnes', song:'(Ive Had) The Time Of My Life', riaa:'Gold' },
    { pos: 28, artist:'Peter Cetera and Amy Grant', song:'The Next Time I Fall', riaa:'—' },
    { pos: 29, artist:'Club Nouveau', song:'Lean On Me', riaa:'Gold' },
    { pos: 30, artist:'Madonna', song:'Open Your Heart', riaa:'—' },
    { pos: 31, artist:'Lisa Lisa and Cult Jam', song:'Lost In Emotion', riaa:'Gold' },
    { pos: 32, artist:'Cutting Crew', song:'(I Just) Died In Your Arms', riaa:'—' },
    { pos: 33, artist:'Tpau', song:'Heart And Soul', riaa:'—' },
    { pos: 34, artist:'Kim Wilde', song:'You Keep Me Hangin On', riaa:'—' },
    { pos: 35, artist:'Georgia Satellites', song:'Keep Your Hands To Yourself', riaa:'—' },
    { pos: 36, artist:'Aretha Franklin and George Michael', song:'I Knew You Were Waiting (For Me)', riaa:'—' },
    { pos: 37, artist:'Janet Jackson', song:'Control', riaa:'Gold' },
    { pos: 38, artist:'Prince', song:'U Got The Look', riaa:'—' },
    { pos: 39, artist:'Linda Ronstadt and James Ingram', song:'Somewhere Out There', riaa:'Gold' },
    { pos: 40, artist:'Genesis', song:'Land Of Confusion', riaa:'—' },
    { pos: 41, artist:'Huey Lewis and The News', song:'Jacobs Ladder', riaa:'—' },
    { pos: 42, artist:'Madonna', song:'Whos That Girl', riaa:'—' },
    { pos: 43, artist:'Jets', song:'You Got It All', riaa:'—' },
    { pos: 44, artist:'Samantha Fox', song:'Touch Me (I Want Your Body)', riaa:'—' },
    { pos: 45, artist:'Michael Jackson and Siedah Garrett', song:'I Just Cant Stop Loving You', riaa:'Gold' },
    { pos: 46, artist:'Madonna', song:'Causing A Commotion', riaa:'—' },
    { pos: 47, artist:'Genesis', song:'In Too Deep', riaa:'—' },
    { pos: 48, artist:'Janet Jackson', song:'Lets Wait Awhile', riaa:'—' },
    { pos: 49, artist:'Huey Lewis and The News', song:'Hip To Be Square', riaa:'—' },
    { pos: 50, artist:'Chicago', song:'Will You Still Love Me?', riaa:'—' },
    { pos: 51, artist:'Fleetwood Mac', song:'Little Lies', riaa:'—' },
    { pos: 52, artist:'Suzanne Vega', song:'Luka', riaa:'—' },
    { pos: 53, artist:'Bananarama', song:'I Heard A Rumour', riaa:'—' },
    { pos: 54, artist:'Richard Marx', song:'Dont Mean Nothing', riaa:'—' },
    { pos: 55, artist:'Kenny G', song:'Songbird', riaa:'—' },
    { pos: 56, artist:'Europe', song:'Carrie', riaa:'—' },
    { pos: 57, artist:'System', song:'Dont Disturb This Groove', riaa:'—' },
    { pos: 58, artist:'Madonna', song:'La Isla Bonita', riaa:'—' },
    { pos: 59, artist:'Michael Jackson', song:'Bad', riaa:'Platinum' },
    { pos: 60, artist:'Prince', song:'Sign O The Times', riaa:'—' },
    { pos: 61, artist:'Cyndi Lauper', song:'Change Of Heart', riaa:'—' },
    { pos: 62, artist:'Expose', song:'Come Go With Me', riaa:'—' },
    { pos: 63, artist:'Dan Hill', song:'Cant We Try', riaa:'—' },
    { pos: 64, artist:'Billy Idol', song:'To Be A Lover', riaa:'—' },
    { pos: 65, artist:'Bruce Hornsby and The Range', song:'Mandolin Rain', riaa:'—' },
    { pos: 66, artist:'Swing Out Sister', song:'Breakout', riaa:'—' },
    { pos: 67, artist:'Ben E. King', song:'Stand By Me', riaa:'—' },
    { pos: 68, artist:'Genesis', song:'Tonight, Tonight, Tonight', riaa:'—' },
    { pos: 69, artist:'Glass Tiger', song:'Someday', riaa:'—' },
    { pos: 70, artist:'ABC', song:'When Smokey Sings', riaa:'—' },
    { pos: 71, artist:'Levert', song:'Casanova', riaa:'Gold' },
    { pos: 72, artist:'Gloria Estefan and Miami Sound Machine', song:'Rhythm Is Gonna Get You', riaa:'—' },
    { pos: 73, artist:'Whispers', song:'Rock Steady', riaa:'—' },
    { pos: 74, artist:'Bon Jovi', song:'Wanted Dead Or Alive', riaa:'—' },
    { pos: 75, artist:'Peter Gabriel', song:'Big Time', riaa:'—' },
    { pos: 76, artist:'Steve Winwood', song:'The Finer Things', riaa:'—' },
    { pos: 77, artist:'Expose', song:'Let Me Be The One', riaa:'—' },
    { pos: 78, artist:'Survivor', song:'Is This Love', riaa:'—' },
    { pos: 79, artist:'Herb Alpert', song:'Diamonds', riaa:'—' },
    { pos: 80, artist:'Expose', song:'Point Of No Return', riaa:'—' },
    { pos: 81, artist:'Fleetwood Mac', song:'Big Love', riaa:'—' },
    { pos: 82, artist:'Lou Gramm', song:'Midnight Blue', riaa:'—' },
    { pos: 83, artist:'Crowded House', song:'Something So Strong', riaa:'—' },
    { pos: 84, artist:'Bryan Adams', song:'Heat Of The Night', riaa:'—' },
    { pos: 85, artist:'Glenn Medeiros', song:'Nothings Gonna Change My Love For You', riaa:'—' },
    { pos: 86, artist:'Bruce Springsteen', song:'Brilliant Disguise', riaa:'—' },
    { pos: 87, artist:'Smokey Robinson', song:'Just To See Her', riaa:'—' },
    { pos: 88, artist:'Heart', song:'Who Will You Run Too', riaa:'—' },
    { pos: 89, artist:'Bruce Willis', song:'Respect Yourself', riaa:'—' },
    { pos: 90, artist:'Jets', song:'Cross My Broken Heart', riaa:'—' },
    { pos: 91, artist:'Kool and The Gang', song:'Victory', riaa:'—' },
    { pos: 92, artist:'Pretenders', song:'Dont Get Me Wrong', riaa:'—' },
    { pos: 93, artist:'Huey Lewis and The News', song:'Doing It All For My Baby', riaa:'—' },
    { pos: 94, artist:'Breakfast Club', song:'Right On Track', riaa:'—' },
    { pos: 95, artist:'Lionel Richie', song:'Ballerina Girl', riaa:'—' },
    { pos: 96, artist:'Kenny Loggins', song:'Meet Me Half Way', riaa:'—' },
    { pos: 97, artist:'Cutting Crew', song:'Ive Been In Love Before', riaa:'—' },
    { pos: 98, artist:'Beastie Boys', song:'(You Gotta) Fight For Your Right (To Party)', riaa:'—' },
    { pos: 99, artist:'Pseudo Echo', song:'Funkytown', riaa:'—' },
    { pos:100, artist:'Ready For The World', song:'Love You Down', riaa:'—' }
  ],
  1988: [
    { pos:  1, artist:'George Michael', song:'Faith', riaa:'Platinum' },
    { pos:  2, artist:'INXS', song:'Need You Tonight', riaa:'—' },
    { pos:  3, artist:'George Harrison', song:'Got My Mind Set On You', riaa:'—' },
    { pos:  4, artist:'Rick Astley', song:'Never Gonna Give You Up', riaa:'Gold' },
    { pos:  5, artist:'Guns N Roses', song:'Sweet Child O Mine', riaa:'Gold' },
    { pos:  6, artist:'Whitney Houston', song:'So Emotional', riaa:'Gold' },
    { pos:  7, artist:'Belinda Carlisle', song:'Heaven Is A Place On Earth', riaa:'—' },
    { pos:  8, artist:'Tiffany', song:'Couldve Been', riaa:'—' },
    { pos:  9, artist:'Breathe', song:'Hands To Heaven', riaa:'—' },
    { pos: 10, artist:'Steve Winwood', song:'Roll With It', riaa:'—' },
    { pos: 11, artist:'George Michael', song:'One More Try', riaa:'Gold' },
    { pos: 12, artist:'Terence Trent dArby', song:'Wishing Well', riaa:'Gold' },
    { pos: 13, artist:'Gloria Estefan and Miami Sound Machine', song:'Anything For You', riaa:'Gold' },
    { pos: 14, artist:'Cheap Trick', song:'The Flame', riaa:'—' },
    { pos: 15, artist:'Billy Ocean', song:'Get Outta My Dreams, Get Into My Car', riaa:'—' },
    { pos: 16, artist:'Expose', song:'Seasons Change', riaa:'—' },
    { pos: 17, artist:'Whitesnake', song:'Is This Love', riaa:'—' },
    { pos: 18, artist:'Escape Club', song:'Wild, Wild West', riaa:'Gold' },
    { pos: 19, artist:'Def Leppard', song:'Pour Some Sugar On Me', riaa:'Gold' },
    { pos: 20, artist:'Taylor Dayne', song:'Ill Always Love You', riaa:'Gold' },
    { pos: 21, artist:'Michael Jackson', song:'Man In The Mirror', riaa:'Multi-Platinum' },
    { pos: 22, artist:'Debbie Gibson', song:'Shake Your Love', riaa:'Gold' },
    { pos: 23, artist:'Robert Palmer', song:'Simply Irresistible', riaa:'—' },
    { pos: 24, artist:'Richard Marx', song:'Hold On To The Nights', riaa:'—' },
    { pos: 25, artist:'Eric Carnen', song:'Hungry Eyes', riaa:'—' },
    { pos: 26, artist:'Johnny Hates Jazz', song:'Shattered Dreams', riaa:'—' },
    { pos: 27, artist:'George Michael', song:'Father Figure', riaa:'—' },
    { pos: 28, artist:'Samantha Fox', song:'Naughty Girls (Need Love Too)', riaa:'—' },
    { pos: 29, artist:'Phil Collins', song:'A Groovy Kind Of Love', riaa:'Gold' },
    { pos: 30, artist:'Def Leppard', song:'Love Bites', riaa:'—' },
    { pos: 31, artist:'Richard Marx', song:'Endless Summer Nights', riaa:'—' },
    { pos: 32, artist:'Debbie Gibson', song:'Foolish Beat', riaa:'—' },
    { pos: 33, artist:'Whitney Houston', song:'Where Do Broken Hearts Go', riaa:'Gold' },
    { pos: 34, artist:'Aerosmith', song:'Angel', riaa:'—' },
    { pos: 35, artist:'Bangles', song:'Hazy Shade Of Winter', riaa:'—' },
    { pos: 36, artist:'Michael Jackson', song:'The Way You Make Me Feel', riaa:'Multi-Platinum' },
    { pos: 37, artist:'Bobby McFerrin', song:'Dont Worry, Be Happy', riaa:'Gold' },
    { pos: 38, artist:'Eric Carnen', song:'Make Me Lose Control', riaa:'—' },
    { pos: 39, artist:'UB40', song:'Red Red Wine', riaa:'Gold' },
    { pos: 40, artist:'Patric Swayze', song:'Shes Like The Wind', riaa:'—' },
    { pos: 41, artist:'Bon Jovi', song:'Bad Medicine', riaa:'—' },
    { pos: 42, artist:'Beach Boys', song:'Kokomo', riaa:'Platinum' },
    { pos: 43, artist:'Elton John', song:'I Dont Wanna Go On With You Like That', riaa:'—' },
    { pos: 44, artist:'Rick Astley', song:'Together Forever', riaa:'—' },
    { pos: 45, artist:'George Michael', song:'Monkey', riaa:'—' },
    { pos: 46, artist:'INXS', song:'Devil Inside', riaa:'—' },
    { pos: 47, artist:'Richard Marx', song:'Shouldve Known Better', riaa:'—' },
    { pos: 48, artist:'Chicago', song:'I Dont Wanna Live Without Your Love', riaa:'—' },
    { pos: 49, artist:'Kylie Minogue', song:'The Loco-Motion', riaa:'Gold' },
    { pos: 50, artist:'Pet Shop Boys and Dusty Springfield', song:'What Have I Done To Deserve This?', riaa:'—' },
    { pos: 51, artist:'Jets', song:'Make It Real', riaa:'—' },
    { pos: 52, artist:'Information Society', song:'Whats On Your Mind', riaa:'Gold' },
    { pos: 53, artist:'Taylor Dayne', song:'Tell It To My Heart', riaa:'Gold' },
    { pos: 54, artist:'Debbie Gibson', song:'Out Of The Blue', riaa:'—' },
    { pos: 55, artist:'Jody Watley', song:'Dont You Want Me', riaa:'—' },
    { pos: 56, artist:'U2', song:'Desire', riaa:'Gold' },
    { pos: 57, artist:'Belinda Carlisle', song:'I Get Weak', riaa:'—' },
    { pos: 58, artist:'Terence Trent dArby', song:'Sign Your Name', riaa:'—' },
    { pos: 59, artist:'Roger', song:'I Want To Be Your Man', riaa:'—' },
    { pos: 60, artist:'Pebbles', song:'Girlfriend', riaa:'—' },
    { pos: 61, artist:'Michael Jackson', song:'Dirty Diana', riaa:'Platinum' },
    { pos: 62, artist:'Gloria Estefan and Miami Sound Machine', song:'1 2 3 4', riaa:'—' },
    { pos: 63, artist:'Pebbles', song:'Mercedes Boy', riaa:'—' },
    { pos: 64, artist:'Huey Lewis and The News', song:'Perfect World', riaa:'—' },
    { pos: 65, artist:'INXS', song:'New Sensation', riaa:'—' },
    { pos: 66, artist:'Pretty Poison', song:'Catch Me (Im Falling)', riaa:'Gold' },
    { pos: 67, artist:'New Edition', song:'If It Isnt Love', riaa:'—' },
    { pos: 68, artist:'Jets', song:'Rocket 2 U', riaa:'—' },
    { pos: 69, artist:'Peter Cetera', song:'One Good Woman', riaa:'—' },
    { pos: 70, artist:'Cheap Trick', song:'Dont Be Cruel', riaa:'—' },
    { pos: 71, artist:'Elton John', song:'Candle In The Wind', riaa:'—' },
    { pos: 72, artist:'Daryl Hall and John Oates', song:'Everything Your Heart Desires', riaa:'—' },
    { pos: 73, artist:'Foreigner', song:'Say You Will', riaa:'—' },
    { pos: 74, artist:'Keith Sweat', song:'I Want Her', riaa:'Gold' },
    { pos: 75, artist:'Natalie Cole', song:'Pink Cadillac', riaa:'—' },
    { pos: 76, artist:'Tracy Chapman', song:'Fast Car', riaa:'—' },
    { pos: 77, artist:'Icehouse', song:'Electric Blue', riaa:'—' },
    { pos: 78, artist:'Bruce Hornsby and The Range', song:'The Valley Road', riaa:'—' },
    { pos: 79, artist:'Bobby Brown', song:'Dont Be Cruel', riaa:'Gold' },
    { pos: 80, artist:'Pet Shop Boys', song:'Always On My Mind', riaa:'—' },
    { pos: 81, artist:'Brenda Russell feat. Joe Esposito', song:'Piano In The Dark', riaa:'—' },
    { pos: 82, artist:'Van Halen', song:'When Its Love', riaa:'—' },
    { pos: 83, artist:'Paul Carrack', song:'Dont Shed A Tear', riaa:'—' },
    { pos: 84, artist:'Sting', song:'Well Be Together', riaa:'—' },
    { pos: 85, artist:'Joan Jett and The Blackhearts', song:'I Hate Myself For Loving You', riaa:'—' },
    { pos: 86, artist:'Foreigner', song:'I Dont Want To Live Without You', riaa:'—' },
    { pos: 87, artist:'Al B. Sure!', song:'Nite And Day', riaa:'—' },
    { pos: 88, artist:'Steve Winwood', song:'Dont You Know What The Night Can Do', riaa:'—' },
    { pos: 89, artist:'Whitney Houston', song:'One Moment In Time', riaa:'Gold' },
    { pos: 90, artist:'Gloria Estefan and Miami Sound Machine', song:'Cant Stay Away From You', riaa:'—' },
    { pos: 91, artist:'George Michael', song:'Kissing A Fool', riaa:'—' },
    { pos: 92, artist:'John Cougar Mellancamp', song:'Cherry Bomb', riaa:'—' },
    { pos: 93, artist:'Brenda K. Starr', song:'I Still Believe', riaa:'—' },
    { pos: 94, artist:'Cher', song:'I Found Someone', riaa:'—' },
    { pos: 95, artist:'INXS', song:'Never Tear Us Apart', riaa:'—' },
    { pos: 96, artist:'Steve Windwood', song:'Valerie', riaa:'—' },
    { pos: 97, artist:'David Lee Roth', song:'Just Like Paradise', riaa:'—' },
    { pos: 98, artist:'Poison', song:'Nothin But A Good Time', riaa:'—' },
    { pos: 99, artist:'White Lion', song:'Wait', riaa:'—' },
    { pos:100, artist:'Taylor Dayne', song:'Prove Your Love', riaa:'—' }
  ],
  1989: [
    { pos:  1, artist:'Chicago', song:'Look Away', riaa:'Gold' },
    { pos:  2, artist:'Bobby Brown', song:'My Prerogative', riaa:'Gold' },
    { pos:  3, artist:'Poison', song:'Every Rose Has Its Thorn', riaa:'Gold' },
    { pos:  4, artist:'Paula Abdul', song:'Straight Up', riaa:'Platinum' },
    { pos:  5, artist:'Janet Jackson', song:'Miss You Much', riaa:'Platinum' },
    { pos:  6, artist:'Paula Abdul', song:'Cold Hearted', riaa:'Gold' },
    { pos:  7, artist:'Bette Midler', song:'Wind Beneath My Wings', riaa:'Platinum' },
    { pos:  8, artist:'Milli Vanilli', song:'Girl You Know Its True', riaa:'Platinum' },
    { pos:  9, artist:'Will To Power', song:'Baby, I Love Your Way-Freebird', riaa:'Gold' },
    { pos: 10, artist:'Anita Baker', song:'Giving You The Best That I Got', riaa:'—' },
    { pos: 11, artist:'Richard Marx', song:'Right Here Waiting', riaa:'Platinum' },
    { pos: 12, artist:'Boy Meets Girl', song:'Waiting For A Star To Fall', riaa:'—' },
    { pos: 13, artist:'Debbie Gibson', song:'Lost In Your Eyes', riaa:'Gold' },
    { pos: 14, artist:'Gloria Estefan', song:'Dont Wanna Lose You', riaa:'Gold' },
    { pos: 15, artist:'Warrant', song:'Heavan', riaa:'Gold' },
    { pos: 16, artist:'Milli Vanilli', song:'Girl Im Gonna Miss You', riaa:'Gold' },
    { pos: 17, artist:'Roxette', song:'The Look', riaa:'Gold' },
    { pos: 18, artist:'Fine Young Cannibals', song:'She Drives Me Crazy', riaa:'Gold' },
    { pos: 19, artist:'Bobby Brown', song:'On Our Own', riaa:'Platinum' },
    { pos: 20, artist:'Phil Collins', song:'Two Hearts', riaa:'—' },
    { pos: 21, artist:'Milli Vanilli', song:'Blame It On The Rain', riaa:'Gold' },
    { pos: 22, artist:'Roxette', song:'Listen To Your Heart', riaa:'—' },
    { pos: 23, artist:'Bon Jovi', song:'Ill Be There For You', riaa:'—' },
    { pos: 24, artist:'Simply Red', song:'If You Dont Know Be By Now', riaa:'Gold' },
    { pos: 25, artist:'Madonna', song:'Like A Prayer', riaa:'Platinum' },
    { pos: 26, artist:'New Kids On The Block', song:'Ill Be Loving You (Forever)', riaa:'Gold' },
    { pos: 27, artist:'Breathe', song:'How Can I Fall?', riaa:'—' },
    { pos: 28, artist:'Milli Vanilli', song:'Baby Dont Forget My Number', riaa:'—' },
    { pos: 29, artist:'Martika', song:'Toy Solider', riaa:'Gold' },
    { pos: 30, artist:'Paula Abdul', song:'Forever Your Girl.', riaa:'Gold' },
    { pos: 31, artist:'Mike and The Mechanics', song:'The Living Years', riaa:'—' },
    { pos: 32, artist:'The Bangles', song:'Eternal Flame', riaa:'Gold' },
    { pos: 33, artist:'Tone Loc', song:'Wild Thing', riaa:'Multi-Platinum' },
    { pos: 34, artist:'Bad English', song:'When I See You Smile', riaa:'Gold' },
    { pos: 35, artist:'Cher', song:'If I Could Turn Back Time', riaa:'—' },
    { pos: 36, artist:'Neneh Cherry', song:'Buffalo Stance', riaa:'Gold' },
    { pos: 37, artist:'Sheriff', song:'When Im With You', riaa:'Gold' },
    { pos: 38, artist:'Taylor Dayne', song:'Dont Rush Me', riaa:'—' },
    { pos: 39, artist:'Bon Jovi', song:'Born To Be My Baby', riaa:'—' },
    { pos: 40, artist:'Fine Young Cannibals', song:'Good Thing', riaa:'—' },
    { pos: 41, artist:'Sheena Easton', song:'The Lover In Me', riaa:'—' },
    { pos: 42, artist:'Young M.C.', song:'Bust A Move', riaa:'Platinum' },
    { pos: 43, artist:'Great White', song:'Once Bitten, Twice Shy', riaa:'Gold' },
    { pos: 44, artist:'Prince', song:'Batdance', riaa:'Platinum' },
    { pos: 45, artist:'Michael Damian', song:'Rock On', riaa:'Gold' },
    { pos: 46, artist:'Jody Watley', song:'Real Love', riaa:'Gold' },
    { pos: 47, artist:'B-52s', song:'Love Shack', riaa:'Gold' },
    { pos: 48, artist:'Bobby Brown', song:'Every Little Step', riaa:'Gold' },
    { pos: 49, artist:'New Kids On The Block', song:'Hangin Tough', riaa:'Platinum' },
    { pos: 50, artist:'Rod Stewart', song:'My Heart Cant Tell You No', riaa:'—' },
    { pos: 51, artist:'Love and Rockets', song:'So Alive', riaa:'—' },
    { pos: 52, artist:'New Kids On The Block', song:'You Got It (The Right Stuff)', riaa:'Gold' },
    { pos: 53, artist:'Def Leppard', song:'Armageddon It', riaa:'—' },
    { pos: 54, artist:'Richard Marx', song:'Satisfied', riaa:'—' },
    { pos: 55, artist:'Madonna', song:'Express Yourself', riaa:'Gold' },
    { pos: 56, artist:'Dino', song:'I Like It', riaa:'Gold' },
    { pos: 57, artist:'Donny Osmond', song:'Soldier Of Love', riaa:'—' },
    { pos: 58, artist:'Tears For Fears', song:'Sowing The Seeds Of Love', riaa:'—' },
    { pos: 59, artist:'Madonna', song:'Cherish', riaa:'—' },
    { pos: 60, artist:'White Lion', song:'When The Children Cry', riaa:'—' },
    { pos: 61, artist:'Skid Row', song:'18 And Life', riaa:'Gold' },
    { pos: 62, artist:'Duran Duran', song:'I Dont Want Your Love', riaa:'—' },
    { pos: 63, artist:'.38 Special', song:'Second Chances', riaa:'—' },
    { pos: 64, artist:'Karyn White', song:'The Way You Love Me', riaa:'Gold' },
    { pos: 65, artist:'Tone Loc', song:'Funky Cold Medina', riaa:'Platinum' },
    { pos: 66, artist:'Bangles', song:'In Your Room', riaa:'—' },
    { pos: 67, artist:'Natalie Cole', song:'Miss You Like Crazy', riaa:'—' },
    { pos: 68, artist:'Cure', song:'Love Song', riaa:'—' },
    { pos: 69, artist:'Karyn White', song:'Secret Rendesvous', riaa:'—' },
    { pos: 70, artist:'Jeff Healey Band', song:'Angel Eyes', riaa:'—' },
    { pos: 71, artist:'Guns N Roses', song:'Patience', riaa:'Gold' },
    { pos: 72, artist:'Eddie Money', song:'Walk On Water', riaa:'—' },
    { pos: 73, artist:'New Kids On The Block', song:'Cover Girl', riaa:'Gold' },
    { pos: 74, artist:'Guns N Roses', song:'Welcom To The Jungle', riaa:'—' },
    { pos: 75, artist:'Surface', song:'Shower Me With Your Love', riaa:'Gold' },
    { pos: 76, artist:'R.E.M.', song:'Stand', riaa:'—' },
    { pos: 77, artist:'Lita Ford', song:'Close My Eyes Forever', riaa:'Gold' },
    { pos: 78, artist:'Tiffany', song:'All This Time', riaa:'—' },
    { pos: 79, artist:'Cher and Peter Cetera', song:'After All', riaa:'Gold' },
    { pos: 80, artist:'Bobby Brown', song:'Roni', riaa:'—' },
    { pos: 81, artist:'Aerosmith', song:'Love In An Elevator', riaa:'Gold' },
    { pos: 82, artist:'Bon Jovi', song:'Lay Your Hands On Me', riaa:'—' },
    { pos: 83, artist:'When In Rome', song:'This Promise', riaa:'—' },
    { pos: 84, artist:'Edie Brickell and The New Bohemians', song:'What I Am', riaa:'—' },
    { pos: 85, artist:'Boys Club', song:'I Remember Holding You', riaa:'—' },
    { pos: 86, artist:'Guns N Roses', song:'Paradise City', riaa:'—' },
    { pos: 87, artist:'Samantha Fox', song:'I Wanna Have Some Fun', riaa:'Gold' },
    { pos: 88, artist:'Rick Astley', song:'She Wants To Dance With Me', riaa:'—' },
    { pos: 89, artist:'Vanessa Williams', song:'Dreamin', riaa:'—' },
    { pos: 90, artist:'Babyface', song:'Its No Crime', riaa:'—' },
    { pos: 91, artist:'Alice Cooper', song:'Poison', riaa:'Gold' },
    { pos: 92, artist:'Donna Summer', song:'This Time I Know Its For Real', riaa:'Gold' },
    { pos: 93, artist:'Michael Jackson', song:'Smooth Criminal', riaa:'Multi-Platinum' },
    { pos: 94, artist:'Deon Estus', song:'Heavan Help Me', riaa:'—' },
    { pos: 95, artist:'Bobby Brown', song:'Rock Witcha', riaa:'Gold' },
    { pos: 96, artist:'Sa-fire', song:'Thinking Of You', riaa:'—' },
    { pos: 97, artist:'Expose', song:'What You Dont Know', riaa:'Gold' },
    { pos: 98, artist:'Ann Wilson and Robin Zander', song:'Surrender To Me', riaa:'—' },
    { pos: 99, artist:'Don Henley', song:'The End Of The Innocence', riaa:'—' },
    { pos:100, artist:'Soul II Soul', song:'Keep On Movin', riaa:'Platinum' }
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
