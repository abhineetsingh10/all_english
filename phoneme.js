// =====================================================
// ENGLISH IPA PHONEME CHART  –  phoneme.js
//
// Layout: one flat horizontal row per phoneme category.
// Every phoneme is its own cell. Voiced/voiceless pairs
// sit as adjacent cells in the same row.
// =====================================================

// =====================================================
// FIXED IPA PHONEME INVENTORY  (ordered within each row)
// =====================================================
const PHONEME_ROWS = [
  {
    id    : "monophthongs",
    label : "Vowels — Monophthongs",
    phonemes: [
      { character: "iː", label: "iː  FLEECE"       },
      { character: "ɪ",  label: "ɪ   KIT"           },
      { character: "e",  label: "e   DRESS (short)"  },
      { character: "ɛ",  label: "ɛ   DRESS"         },
      { character: "æ",  label: "æ   TRAP"          },
      { character: "a",  label: "a   short-a"       },
      { character: "ɑː", label: "ɑː  PALM / START"  },
      { character: "ɒ",  label: "ɒ   LOT"          },
      { character: "ɔː", label: "ɔː  THOUGHT"       },
      { character: "ʊ",  label: "ʊ   FOOT"         },
      { character: "uː", label: "uː  GOOSE"        },
      { character: "ʌ",  label: "ʌ   STRUT"        },
      { character: "ɜː", label: "ɜː  NURSE"        },
      { character: "ə",  label: "ə   schwa"        }
    ]
  },
  {
    id    : "diphthongs",
    label : "Vowels — Diphthongs",
    phonemes: [
      { character: "eɪ", label: "eɪ  FACE"   },
      { character: "aɪ", label: "aɪ  PRICE"  },
      { character: "ɔɪ", label: "ɔɪ  CHOICE" },
      { character: "əʊ", label: "əʊ  GOAT"   },
      { character: "aʊ", label: "aʊ  MOUTH"  },
      { character: "ɪə", label: "ɪə  NEAR"   },
      { character: "eə", label: "eə  SQUARE" },
      { character: "ʊə", label: "ʊə  CURE"   }
    ]
  },
  {
    id    : "plosives",
    label : "Consonants — Plosives",
    phonemes: [
      { character: "p",  label: "p  voiceless bilabial plosive" },
      { character: "b",  label: "b  voiced bilabial plosive"    },
      { character: "t",  label: "t  voiceless alveolar plosive" },
      { character: "d",  label: "d  voiced alveolar plosive"    },
      { character: "k",  label: "k  voiceless velar plosive"    },
      { character: "ɡ",  label: "ɡ  voiced velar plosive"       }
    ]
  },
  {
    id    : "nasals",
    label : "Consonants — Nasals",
    phonemes: [
      { character: "m",  label: "m  bilabial nasal" },
      { character: "n",  label: "n  alveolar nasal" },
      { character: "ŋ",  label: "ŋ  velar nasal"    }
    ]
  },
  {
    id    : "fricatives",
    label : "Consonants — Fricatives",
    phonemes: [
      { character: "f",  label: "f  voiceless labiodental"    },
      { character: "v",  label: "v  voiced labiodental"       },
      { character: "θ",  label: "θ  voiceless dental"         },
      { character: "ð",  label: "ð  voiced dental"            },
      { character: "s",  label: "s  voiceless alveolar"       },
      { character: "z",  label: "z  voiced alveolar"          },
      { character: "ʃ",  label: "ʃ  voiceless post-alveolar"  },
      { character: "ʒ",  label: "ʒ  voiced post-alveolar"     },
      { character: "h",  label: "h  glottal fricative"        }
    ]
  },
  {
    id    : "affricates",
    label : "Consonants — Affricates",
    phonemes: [
      { character: "tʃ", label: "tʃ  voiceless palato-alveolar" },
      { character: "dʒ", label: "dʒ  voiced palato-alveolar"    }
    ]
  },
  {
    id    : "approximants",
    label : "Consonants — Approximants",
    phonemes: [
      { character: "w",  label: "w  bilabial / velar approximant" },
      { character: "r",  label: "r  alveolar approximant"         },
      { character: "j",  label: "j  palatal approximant"          },
      { character: "l",  label: "l  lateral approximant"          }
    ]
  },
];

// Quick lookup: character → row id
const CHAR_TO_ROW = {};
PHONEME_ROWS.forEach(row => {
  row.phonemes.forEach(ph => { CHAR_TO_ROW[ph.character] = row.id; });
});

// =====================================================
// LAYOUT CONFIG
// =====================================================
const CELL     = 42;   // px — cell size (square)
const CELL_GAP = 4;    // px — gap between cells in a row
const STEP     = CELL + CELL_GAP;

const ROW_GAP  = 12;   // px — vertical gap between rows
const ROW_H    = CELL + ROW_GAP;

const LABEL_W  = 235;  // px — width reserved for row label
const MARGIN   = { top: 56, right: 40, bottom: 40, left: 16 };

const TRANS_MS = 280;

// =====================================================
// COLORS
// =====================================================
const COLOR = {
  familiar : "#43A047",
  target   : "#E53935",
  not_seen : "#E0E0E0",
  special  : "#CE93D8"
};

// =====================================================
// GLOBAL STATE
// =====================================================
let fullData          = [];
let currentUser       = null;
let viewMode          = "single";
let selectedMilestone = 0;
let totalUsers        = 0;

// =====================================================
// SVG
// =====================================================
const svgEl = d3.select("#chart");

// =====================================================
// TOOLTIP
// =====================================================
const tooltip = d3.select("#tooltip");

function showTip(event, ph, rowId) {
  const userData = viewMode === "single"
    ? fullData.filter(d => d.userid === currentUser)
    : [];
  const m = userData.find(x => x.character === ph.character);
  const state = m ? getState(m) : "not_seen";
  const stateLabel = {
    familiar : "Familiar",
    target   : "Seen (not yet mastered)",
    not_seen : "Not yet seen"
  }[state];

  const audio = PHONEME_WORDS[ph.character];
  let html = `<strong>${ph.character}</strong><br>${ph.label}<br>`;
  if (audio) html += `Example: <em>${audio.word}</em> <span style="font-size:11px;opacity:0.7">(${audio.hint})</span><br>`;
  html += `<span style="font-size:11px;opacity:0.75">&#128266; Click speaker icon to hear</span><br>`;

  if (viewMode === "single") {
    html += `Status: <em>${stateLabel}</em>`;
    if (m && m.acquired_milestone   != null) html += `<br>Acquired: M${m.acquired_milestone}`;
    if (m && m.first_seen_milestone != null) html += `<br>First seen: M${m.first_seen_milestone}`;
  } else {
    const rows = fullData.filter(d => d.character === ph.character);
    const n = new Set(
      rows.filter(r => r.acquired_milestone !== null && r.acquired_milestone <= selectedMilestone)
          .map(r => r.userid)
    ).size;
    html += `Acquired by ${n} / ${totalUsers} children`;
  }

  tooltip
    .style("display", "block")
    .html(html)
    .style("left", (event.clientX + 14) + "px")
    .style("top",  (event.clientY - 10) + "px");
}

function hideTip() { tooltip.style("display", "none"); }

// =====================================================
// COLOR HELPERS
// =====================================================
function getState(d) {
  if (d.acquired_milestone   !== null && d.acquired_milestone   <= selectedMilestone) return "familiar";
  if (d.first_seen_milestone !== null && d.first_seen_milestone <= selectedMilestone) return "target";
  return "not_seen";
}

function colorForChar(character, rowId) {
  if (viewMode === "single") {
    const m = fullData.find(d => d.userid === currentUser && d.character === character);
    return m ? COLOR[getState(m)] : COLOR.not_seen;
  }

  // All-children aggregate
  const rows = fullData.filter(d => d.character === character);
  if (!rows.length) return COLOR.not_seen;
  const acquired = new Set(
    rows.filter(r => r.acquired_milestone !== null && r.acquired_milestone <= selectedMilestone)
        .map(r => r.userid)
  ).size;
  return acquired === 0 ? COLOR.not_seen : d3.interpolateGreens(acquired / totalUsers);
}

// =====================================================
// LOAD DATA
// =====================================================
d3.csv("phoneme_all_users.csv", d => ({
  userid               : d.userid,
  character            : d.character,
  char_type            : d.char_type,
  acquired_milestone   : d.acquired_milestone   !== "" ? +d.acquired_milestone   : null,
  first_seen_milestone : d.first_seen_milestone !== "" ? +d.first_seen_milestone : null
})).then(data => {

  fullData   = data;
  totalUsers = new Set(data.map(d => d.userid)).size;

  // ---- Set SVG dimensions ----
  const visibleRows = PHONEME_ROWS;
  const maxCells    = d3.max(visibleRows, r => r.phonemes.length);
  const svgW        = MARGIN.left + LABEL_W + maxCells * STEP + MARGIN.right;
  const svgH        = MARGIN.top  + visibleRows.length * ROW_H + MARGIN.bottom;

  svgEl.attr("width", svgW).attr("height", svgH);

  buildControls();
  buildChart(visibleRows);
  redraw();
});

// =====================================================
// CONTROLS
// =====================================================
function buildControls() {

  d3.select("#viewMode")
    .selectAll("option")
    .data([
      { label: "Single Child",   value: "single" },
      { label: "All Children",   value: "all"    }
    ])
    .enter().append("option")
    .attr("value", d => d.value).text(d => d.label);

  d3.select("#viewMode").on("change", function () {
    viewMode = this.value;
    redraw();
  });

  const users = [...new Set(fullData.map(d => d.userid))].sort();
  currentUser = users[0];

  d3.select("#userSelect")
    .selectAll("option").data(users).enter()
    .append("option").attr("value", d => d).text(d => d);

  d3.select("#userSelect").on("change", function () {
    currentUser = this.value;
    redraw();
  });

  const maxM = d3.max(fullData, d => d.acquired_milestone ?? d.first_seen_milestone ?? 0);

  const slider = document.getElementById("milestoneSlider");
  const milestoneLabel = document.getElementById("milestoneLabel");
  const playBtn = document.getElementById("playBtn");
  const ticksContainer = document.getElementById("sliderTicks");

  slider.max = maxM;
  slider.value = 0;

  for (let i = 0; i <= maxM; i++) {
    const tick = document.createElement("span");
    tick.textContent = `M${i}`;
    ticksContainer.appendChild(tick);
  }

  function setMilestone(val) {
    selectedMilestone = val;
    slider.value = val;
    milestoneLabel.textContent = `M${val}`;
    redraw();
  }

  slider.addEventListener("input", function () { setMilestone(+this.value); });

  let playTimer = null;
  const PLAY_INTERVAL_MS = 900;

  playBtn.addEventListener("click", function () {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
      playBtn.textContent = "\u25B6";
      playBtn.classList.remove("playing");
    } else {
      if (selectedMilestone >= maxM) setMilestone(0);
      playBtn.textContent = "\u23F8";
      playBtn.classList.add("playing");
      playTimer = setInterval(() => {
        const next = selectedMilestone + 1;
        if (next > maxM) {
          clearInterval(playTimer);
          playTimer = null;
          playBtn.textContent = "\u25B6";
          playBtn.classList.remove("playing");
        } else {
          setMilestone(next);
        }
      }, PLAY_INTERVAL_MS);
    }
  });
}

// =====================================================
// BUILD CHART  (runs once after data loads)
// =====================================================
function buildChart(visibleRows) {

  const root = svgEl.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  // ---- Alternating row backgrounds ----
  visibleRows.forEach((row, ri) => {
    root.append("rect")
      .attr("x", 0)
      .attr("y", ri * ROW_H - ROW_GAP / 2)
      .attr("width",  LABEL_W + row.phonemes.length * STEP + 10)
      .attr("height", ROW_H)
      .attr("rx", 6)
      .attr("fill", ri % 2 === 0 ? "#f8f8f8" : "#ffffff")
      .attr("stroke", "none");
  });

  visibleRows.forEach((row, ri) => {
    const y = ri * ROW_H;

    const g = root.append("g")
      .attr("class", `phoneme-row row-${row.id}`)
      .attr("transform", `translate(0,${y})`);

    // ---- Row label ----
    g.append("text")
      .attr("class", "row-label")
      .attr("x", LABEL_W - 12)
      .attr("y", CELL / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .style("font-size", "11.5px")
      .style("font-weight", "700")
      .style("fill", "#555")
      .style("letter-spacing", "0.2px")
      .text(row.label);

    // ---- Divider ----
    g.append("line")
      .attr("x1", LABEL_W - 6).attr("x2", LABEL_W - 6)
      .attr("y1", 4).attr("y2", CELL - 4)
      .attr("stroke", "#d0d0d0").attr("stroke-width", 1.5);

    // ---- Phoneme cells ----
    const cellG = g.selectAll(".ph-cell")
      .data(row.phonemes)
      .enter().append("g")
      .attr("class", "ph-cell")
      .attr("data-char",  d => d.character)
      .attr("data-rowid", row.id)
      .attr("transform",  (d, i) => `translate(${LABEL_W + i * STEP}, 0)`)
      .style("cursor", "default")
      .on("mousemove", function (event, d) { showTip(event, d, row.id); })
      .on("mouseleave", hideTip);

    cellG.append("rect")
      .attr("class", "ph-rect")
      .attr("width",  CELL)
      .attr("height", CELL)
      .attr("rx", 6)
      .attr("fill", COLOR.not_seen);

    cellG.append("text")
      .attr("class", "ph-symbol")
      .attr("x", CELL / 2)
      .attr("y", CELL / 2 - 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", `${CELL * 0.37}px`)
      .style("pointer-events", "none")
      .style("fill", "#444")
      .text(d => d.character);

    const spkG = cellG.append("g")
      .attr("class", "ph-speaker")
      .attr("transform", `translate(${CELL - 13}, ${CELL - 13})`)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        speakPhoneme(d.character);
      })
      .on("mouseenter", function () {
        d3.select(this).select(".spk-bg").attr("fill-opacity", 0.32);
      })
      .on("mouseleave", function () {
        d3.select(this).select(".spk-bg").attr("fill-opacity", 0.16);
      });

    spkG.append("circle")
      .attr("class", "spk-bg")
      .attr("r", 7).attr("cx", 0).attr("cy", 0)
      .attr("fill", "#000").attr("fill-opacity", 0.16);

    spkG.append("path")
      .attr("d", "M-3.5,-2.5 L-3.5,2.5 L-1,2.5 L2,0.5 L2,-2.5 Z M3.2,-1.8 Q5,0 3.2,1.8")
      .attr("fill", "#fff")
      .attr("stroke", "none")
      .style("pointer-events", "none");
  });
}

// =====================================================
// REDRAW  –  update fills whenever state changes
// =====================================================
function redraw() {

  d3.select("#userSelect").property("disabled", viewMode === "all");

  svgEl.selectAll(".ph-cell").each(function () {
    const node   = d3.select(this);
    const char   = node.attr("data-char");
    const rowId  = node.attr("data-rowid");
    const fill   = colorForChar(char, rowId);
    const isLight = (fill === COLOR.not_seen);

    node.select(".ph-rect")
      .transition().duration(TRANS_MS)
      .attr("fill", fill);

    node.select(".ph-symbol")
      .style("fill", isLight ? "#444" : "#fff");
  });
}
// =====================================================
// PHONEME → EXAMPLE WORD
// =====================================================
const PHONEME_WORDS = {
  "iː" : { word: "sheep",   hint: "sh-EE-p"    },
  "ɪ"  : { word: "sit",     hint: "s-I-t"       },
  "e"  : { word: "red",     hint: "r-E-d"       },
  "ɛ"  : { word: "bed",     hint: "b-E-d"       },
  "æ"  : { word: "cat",     hint: "c-A-t"       },
  "a"  : { word: "father",  hint: "f-A-ther"    },
  "ɑː" : { word: "start",   hint: "st-AR-t"     },
  "ɒ"  : { word: "hot",     hint: "h-O-t"       },
  "ɔː" : { word: "thought", hint: "th-AW-t"     },
  "ʊ"  : { word: "foot",    hint: "f-OO-t"      },
  "uː" : { word: "goose",   hint: "g-OO-se"     },
  "ʌ"  : { word: "strut",   hint: "str-U-t"     },
  "ɜː" : { word: "nurse",   hint: "n-UR-se"     },
  "ə"  : { word: "about",   hint: "uh-BOUT"     },
  "eɪ" : { word: "face",    hint: "f-AY-ce"     },
  "aɪ" : { word: "price",   hint: "pr-ICE"      },
  "ɔɪ" : { word: "choice",  hint: "ch-OY-ce"    },
  "əʊ" : { word: "goat",    hint: "g-OH-t"      },
  "aʊ" : { word: "mouth",   hint: "m-OW-th"     },
  "ɪə" : { word: "near",    hint: "n-EAR"       },
  "eə" : { word: "square",  hint: "sq-AIR"      },
  "ʊə" : { word: "cure",    hint: "c-OOR"       },
  "p"  : { word: "pan",     hint: "P-an"        },
  "b"  : { word: "bat",     hint: "B-at"        },
  "t"  : { word: "top",     hint: "T-op"        },
  "d"  : { word: "dog",     hint: "D-og"        },
  "k"  : { word: "cat",     hint: "K-at"        },
  "ɡ"  : { word: "go",      hint: "G-o"         },
  "m"  : { word: "map",     hint: "M-ap"        },
  "n"  : { word: "net",     hint: "N-et"        },
  "ŋ"  : { word: "sing",    hint: "si-NG"       },
  "f"  : { word: "fan",     hint: "F-an"        },
  "v"  : { word: "van",     hint: "V-an"        },
  "θ"  : { word: "thin",    hint: "TH-in"       },
  "ð"  : { word: "this",    hint: "TH-is"       },
  "s"  : { word: "sun",     hint: "S-un"        },
  "z"  : { word: "zoo",     hint: "Z-oo"        },
  "ʃ"  : { word: "ship",    hint: "SH-ip"       },
  "ʒ"  : { word: "vision",  hint: "vi-ZH-ion"   },
  "h"  : { word: "hat",     hint: "H-at"        },
  "tʃ" : { word: "church",  hint: "CH-urch"     },
  "dʒ" : { word: "judge",   hint: "J-udge"      },
  "w"  : { word: "wet",     hint: "W-et"        },
  "r"  : { word: "red",     hint: "R-ed"        },
  "j"  : { word: "yes",     hint: "Y-es"        },
  "l"  : { word: "leg",     hint: "L-eg"        },
};

// =====================================================
// SPEAK  –  Web Speech API
// =====================================================
// Audio cache — avoids re-fetching repeated clicks
const _audioCache = {};

function flashCell(character) {
  const cell = svgEl.select(`.ph-cell[data-char="${CSS.escape(character)}"]`);
  cell.select(".spk-bg")
    .transition().duration(120).attr("r", 10).attr("fill-opacity", 0.45)
    .transition().duration(400).attr("r", 7).attr("fill-opacity", 0.16);
}

async function speakPhoneme(character) {
  const entry = PHONEME_WORDS[character];
  if (!entry) return;

  flashCell(character);

  const apiKey = document.getElementById("googleKey").value.trim();
  if (apiKey) {
    await speakGoogle(entry.word, apiKey, character);
  } else {
    speakBrowser(entry.word);
  }
}

// ── Google Cloud TTS  (en-IN-Neural2-A — Indian female neural voice) ────────
async function speakGoogle(word, apiKey, character) {
  if (_audioCache[character]) {
    _audioCache[character].currentTime = 0;
    _audioCache[character].play();
    return;
  }
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: word },
          voice: {
            languageCode: "en-IN",
            name: "en-IN-Neural2-A",   // Indian female, highest quality
            ssmlGender: "FEMALE"
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.85,        // slightly slower for phoneme clarity
            pitch: 0.0
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Google TTS error:", err.error?.message || res.status);
      speakBrowser(word);
      return;
    }

    const { audioContent } = await res.json();  // base64 MP3
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    _audioCache[character] = audio;
    audio.play();

  } catch (e) {
    console.warn("Google TTS failed:", e);
    speakBrowser(word);
  }
}

// ── Web Speech API fallback ──────────────────────────────────────────────────
function speakBrowser(word) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(word);
  utt.lang   = "en-IN";
  utt.rate   = 0.78;
  utt.pitch  = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const pick =
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang === "en-GB") ||
    voices.find(v => v.lang.startsWith("en"));
  if (pick) { utt.voice = pick; utt.lang = pick.lang; }
  window.speechSynthesis.speak(utt);
}