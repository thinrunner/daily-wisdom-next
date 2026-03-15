// Mood-based music suggestions — curated Spotify & YouTube Music links
// Each mood has 3 rotation options, selected via dayIndex % 3

export const MOOD_MUSIC = {
  calm: [
    { name: "Weightless", artist: "Marconi Union", spotify: "https://open.spotify.com/track/6kkwzB6KXbMqiLPMRNO7yH", youtube: "https://music.youtube.com/watch?v=UfcAVejslrU" },
    { name: "Clair de Lune", artist: "Debussy", spotify: "https://open.spotify.com/track/1JSTJqkT5qHq8MDJnJbRE1", youtube: "https://music.youtube.com/watch?v=CvFH_6DNRCY" },
    { name: "Gymnopédie No.1", artist: "Erik Satie", spotify: "https://open.spotify.com/track/5NGtFXVpXSvwunEIGeviY3", youtube: "https://music.youtube.com/watch?v=S-Xm7s9eGxU" },
  ],
  strength: [
    { name: "Stronger", artist: "Kelly Clarkson", spotify: "https://open.spotify.com/track/6D60klaHqbCl9ySc8VcRve", youtube: "https://music.youtube.com/watch?v=Xn676-fLq7I" },
    { name: "Eye of the Tiger", artist: "Survivor", spotify: "https://open.spotify.com/track/2KH16WveTQWT6KOG9Rg6e2", youtube: "https://music.youtube.com/watch?v=btPJPFnesV4" },
    { name: "Hall of Fame", artist: "The Script", spotify: "https://open.spotify.com/track/53uskMEFIzsMknSOnoHnqx", youtube: "https://music.youtube.com/watch?v=mk48xRzuNvA" },
  ],
  joy: [
    { name: "Here Comes the Sun", artist: "The Beatles", spotify: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2", youtube: "https://music.youtube.com/watch?v=KQetemT1sWc" },
    { name: "Happy", artist: "Pharrell Williams", spotify: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH", youtube: "https://music.youtube.com/watch?v=ZbZSe6N_BXs" },
    { name: "Walking on Sunshine", artist: "Katrina & The Waves", spotify: "https://open.spotify.com/track/05wIrZSwuaVWhcv5FfqeH0", youtube: "https://music.youtube.com/watch?v=iPUmE-tne5U" },
  ],
  action: [
    { name: "Lose Yourself", artist: "Eminem", spotify: "https://open.spotify.com/track/1v1oIWf2Xgh54kIWuKsDf6", youtube: "https://music.youtube.com/watch?v=_Yhyp-_hX2s" },
    { name: "Remember the Name", artist: "Fort Minor", spotify: "https://open.spotify.com/track/23mgS5X6MkPhTclEIbJKD6", youtube: "https://music.youtube.com/watch?v=VDvr08sCPOc" },
    { name: "Can't Hold Us", artist: "Macklemore", spotify: "https://open.spotify.com/track/3bidbhpOYeV4knp8AIu8Xn", youtube: "https://music.youtube.com/watch?v=2zNSgSzhBfM" },
  ],
  peace: [
    { name: "Imagine", artist: "John Lennon", spotify: "https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9", youtube: "https://music.youtube.com/watch?v=YkgkThdzX-8" },
    { name: "What a Wonderful World", artist: "Louis Armstrong", spotify: "https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9", youtube: "https://music.youtube.com/watch?v=A3yCcXgbKrE" },
    { name: "River Flows in You", artist: "Yiruma", spotify: "https://open.spotify.com/track/4PJMkxbXT3BDXBkAlCUFJw", youtube: "https://music.youtube.com/watch?v=7maJOI3QMu0" },
  ],
  growth: [
    { name: "Unwritten", artist: "Natasha Bedingfield", spotify: "https://open.spotify.com/track/5sTnCjApjF0CQujAt6JnXb", youtube: "https://music.youtube.com/watch?v=b7k0a5hYnSI" },
    { name: "Breakaway", artist: "Kelly Clarkson", spotify: "https://open.spotify.com/track/25J4umNL8h8reGWCP7QIG5", youtube: "https://music.youtube.com/watch?v=c-3vPxKdj6o" },
    { name: "The Climb", artist: "Miley Cyrus", spotify: "https://open.spotify.com/track/2aJTVoKbNSRVYBKffOnnmW", youtube: "https://music.youtube.com/watch?v=NG2zyeVRcbs" },
  ],
  inner: [
    { name: "Spiegel im Spiegel", artist: "Arvo Pärt", spotify: "https://open.spotify.com/track/6FDXFX3pkHvFnNAkYpZbOD", youtube: "https://music.youtube.com/watch?v=TJ6Mzvh3XCc" },
    { name: "Experience", artist: "Ludovico Einaudi", spotify: "https://open.spotify.com/track/1BFpl1Aq0mBcmz8DfBrmdz", youtube: "https://music.youtube.com/watch?v=_VONMkKkdf4" },
    { name: "Nuvole Bianche", artist: "Ludovico Einaudi", spotify: "https://open.spotify.com/track/2MDGBRkGBIBMiJBXwKJbUk", youtube: "https://music.youtube.com/watch?v=4VR-6AS0-l4" },
  ],
  courage: [
    { name: "Brave", artist: "Sara Bareilles", spotify: "https://open.spotify.com/track/5mESkj3pMjhpmY6L8TKxlQ", youtube: "https://music.youtube.com/watch?v=QUQsqBqxoR4" },
    { name: "Fight Song", artist: "Rachel Platten", spotify: "https://open.spotify.com/track/0r2Bul2NuSPux5p3gP1dHC", youtube: "https://music.youtube.com/watch?v=xo1VInw-SKc" },
    { name: "Warriors", artist: "Imagine Dragons", spotify: "https://open.spotify.com/track/1Nt8OWdEiEcOSfRIjlG7qI", youtube: "https://music.youtube.com/watch?v=fmI_Ndrxy14" },
  ],
  creativity: [
    { name: "Bohemian Rhapsody", artist: "Queen", spotify: "https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv", youtube: "https://music.youtube.com/watch?v=fJ9rUzIMcZQ" },
    { name: "Rhapsody in Blue", artist: "George Gershwin", spotify: "https://open.spotify.com/track/7tCfEIYMYJf2EroIxnJlcj", youtube: "https://music.youtube.com/watch?v=ynEOo28lsbc" },
    { name: "Electric Feel", artist: "MGMT", spotify: "https://open.spotify.com/track/3FtYbEfBqAlGO46NUDQSAt", youtube: "https://music.youtube.com/watch?v=MmZexg8sxyk" },
  ],
  nature: [
    { name: "Morning Mood", artist: "Edvard Grieg", spotify: "https://open.spotify.com/track/02iVJbeDGZey0HE1wuHoKH", youtube: "https://music.youtube.com/watch?v=kzTQ5M3Rl3A" },
    { name: "The Four Seasons: Spring", artist: "Vivaldi", spotify: "https://open.spotify.com/track/3HBTUhHkSwrW1mMCFi1jdD", youtube: "https://music.youtube.com/watch?v=GRxofEmo3HA" },
    { name: "Pastoral Symphony", artist: "Beethoven", spotify: "https://open.spotify.com/track/3RqLBm9WFJGVMHQHQ0qdAt", youtube: "https://music.youtube.com/watch?v=t2gktHcMnvw" },
  ],
  cosmos: [
    { name: "Starman", artist: "David Bowie", spotify: "https://open.spotify.com/track/0pQskrTITgmCMyr85tb9qq", youtube: "https://music.youtube.com/watch?v=tRcPA7Fzebw" },
    { name: "Space Oddity", artist: "David Bowie", spotify: "https://open.spotify.com/track/72Z17vmmeQKAg8bptWvpVG", youtube: "https://music.youtube.com/watch?v=iYYRH4apXDo" },
    { name: "Interstellar Main Theme", artist: "Hans Zimmer", spotify: "https://open.spotify.com/track/4a3ByTFCnGDVT0MWBvYqsp", youtube: "https://music.youtube.com/watch?v=UDVtMYqUAyw" },
  ],
  love: [
    { name: "All You Need Is Love", artist: "The Beatles", spotify: "https://open.spotify.com/track/0EPy2VBRRqJAqidrbkMRaO", youtube: "https://music.youtube.com/watch?v=_7xMfIp-irg" },
    { name: "Can't Help Falling in Love", artist: "Elvis Presley", spotify: "https://open.spotify.com/track/44AyOl4qVkzS48vBsbNXaC", youtube: "https://music.youtube.com/watch?v=vGJTaP6anOU" },
    { name: "A Thousand Years", artist: "Christina Perri", spotify: "https://open.spotify.com/track/6lanRgr6wXibZr8KgzXxBl", youtube: "https://music.youtube.com/watch?v=rtOvBOTyX00" },
  ],
  vitality: [
    { name: "Don't Stop Me Now", artist: "Queen", spotify: "https://open.spotify.com/track/7hQJA50XrCWABAu5v6QZ4i", youtube: "https://music.youtube.com/watch?v=HgzGwKwLmgM" },
    { name: "Alive", artist: "Sia", spotify: "https://open.spotify.com/track/3Wrjm47oTz2sjIgGIhHKFq", youtube: "https://music.youtube.com/watch?v=t2NgsJrrUoM" },
    { name: "On Top of the World", artist: "Imagine Dragons", spotify: "https://open.spotify.com/track/0JYnMxNBSBqMnHjl7JOzKi", youtube: "https://music.youtube.com/watch?v=w5tWYmIOWGk" },
  ],
  truth: [
    { name: "Redemption Song", artist: "Bob Marley", spotify: "https://open.spotify.com/track/5jLSHIpE8bOGB6dHLgTWyM", youtube: "https://music.youtube.com/watch?v=yv8VjIUJGlY" },
    { name: "Blowin' in the Wind", artist: "Bob Dylan", spotify: "https://open.spotify.com/track/47JfKBuKkOMqRViURVoApF", youtube: "https://music.youtube.com/watch?v=vWwgrjjIMXA" },
    { name: "The Sound of Silence", artist: "Simon & Garfunkel", spotify: "https://open.spotify.com/track/3YfS47QufnLMFA0FPsIbdp", youtube: "https://music.youtube.com/watch?v=4fWyzwo1xg0" },
  ],
  purpose: [
    { name: "Fix You", artist: "Coldplay", spotify: "https://open.spotify.com/track/7LVHVU3tWfcxj5aiPFEW4Q", youtube: "https://music.youtube.com/watch?v=k4V3Mo61fJM" },
    { name: "Lean on Me", artist: "Bill Withers", spotify: "https://open.spotify.com/track/3M8FzayQWtkvOhqMn2V4T2", youtube: "https://music.youtube.com/watch?v=fOZ-MySzAac" },
    { name: "Beautiful Day", artist: "U2", spotify: "https://open.spotify.com/track/5ZWHK57cSCJZq9NKkJPcaH", youtube: "https://music.youtube.com/watch?v=co6WMzDOh1o" },
  ],
  journey: [
    { name: "Life Is a Highway", artist: "Tom Cochrane", spotify: "https://open.spotify.com/track/3fKVm73sHSiCGSHEdjqNcQ", youtube: "https://music.youtube.com/watch?v=U3sMjm9Eloo" },
    { name: "Road Trippin'", artist: "Red Hot Chili Peppers", spotify: "https://open.spotify.com/track/4JXoKfKb1Hn7vFIJRLJJzK", youtube: "https://music.youtube.com/watch?v=11GYvfYjyV0" },
    { name: "Into the Unknown", artist: "Idina Menzel", spotify: "https://open.spotify.com/track/3Z0oQ8oElGHSjPNSLIbHZn", youtube: "https://music.youtube.com/watch?v=gIOyB9ZXn8s" },
  ],
};

export function getMusicForMood(mood, dayIndex) {
  const tracks = MOOD_MUSIC[mood] || MOOD_MUSIC.calm;
  return tracks[dayIndex % tracks.length];
}
