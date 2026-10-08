// Otomatik üretildi: uma-puanlama/site-aktar.mjs (2026-10-08). Elle düzenleme; yeniden üretilir.
// rating = 0.6·avg + 0.4·best. avg: 5 pistin eşit ağırlıklı ortalaması (1–24, koşamadığı pist 1);
// best: en iyi pist puanı. simPrice: rating'in sırasına göre 5–24 🪙.
// price: fiyat-elle.json'da varsa oradaki elle fiyat (manualPrice: true), yoksa simPrice; en az 8 🪙.
const UMA_SCORE_META = {"generated":"2026-10-08","priceMin":8,"priceMax":48,"unratedPrice":15,"specialistWeight":0.4,"tracks":[{"id":"chukyo-1200","name":"Chukyo 1200m","conditions":"Spring · Rainy · Soft"},{"id":"sapporo-1500","name":"Sapporo 1500m","conditions":"Summer · Sunny · Firm"},{"id":"tokyo-2400","name":"Tokyo 2400m","conditions":"Fall · Cloudy · Firm"},{"id":"kyoto-3000","name":"Kyoto 3000m","conditions":"Winter · Cloudy · Firm"},{"id":"morioka-1600","name":"Morioka 1600m","conditions":"Spring · Sunny · Firm"}]};
const UMA_SCORES = {
 "Satono Diamond (New Year)": {
  "id": "106702",
  "outfit": "Jade's Prosperity",
  "rating": 14.5,
  "avg": 10.8,
  "best": 20,
  "bestTrack": "kyoto-3000",
  "power": 17.3,
  "price": 17,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 17,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 20,
    "style": "Late"
   },
   "morioka-1600": null
  },
  "jp": true
 },
 "Kitasan Black (New Year)": {
  "id": "106802",
  "outfit": "Crane's Ambition",
  "rating": 12.5,
  "avg": 8.8,
  "best": 18,
  "bestTrack": "tokyo-2400",
  "power": 14,
  "price": 21,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 15,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": null
  },
  "jp": true
 },
 "Narita Brian (BLAZE)": {
  "id": "101602",
  "outfit": "Ravenous Wolf",
  "rating": 12.3,
  "avg": 9.8,
  "best": 16,
  "bestTrack": "sapporo-1500",
  "power": 15.7,
  "price": 21,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 16,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Late"
   },
   "morioka-1600": null
  },
  "jp": true
 },
 "Zenno Rob Roy": {
  "id": "104701",
  "outfit": "Heroic Author",
  "rating": 9.9,
  "avg": 5.8,
  "best": 16,
  "bestTrack": "tokyo-2400",
  "power": 13,
  "price": 16,
  "simPrice": 10,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 16,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 10,
    "style": "Late"
   },
   "morioka-1600": null
  },
  "jp": true
 },
 "Vodka (Christmas)": {
  "id": "100802",
  "outfit": "Fiery Aqua Vitae",
  "rating": 12.2,
  "avg": 7.6,
  "best": 19,
  "bestTrack": "tokyo-2400",
  "power": 17.5,
  "price": 16,
  "simPrice": 16,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 16,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "Late"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Daiwa Scarlet (Christmas)": {
  "id": "100902",
  "outfit": "Nuit Étoilée de Scarlet",
  "rating": 6.5,
  "avg": 4.8,
  "best": 9,
  "bestTrack": "sapporo-1500",
  "power": 7.3,
  "price": 15,
  "simPrice": 6,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 9,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 6,
    "style": "Front"
   },
   "morioka-1600": null
  }
 },
 "Wonder Acute": {
  "id": "110001",
  "outfit": "Butterfly Sting",
  "rating": 8.3,
  "avg": 3.8,
  "best": 15,
  "bestTrack": "morioka-1600",
  "power": 15,
  "price": 14,
  "simPrice": 7,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 15,
    "style": "Pace"
   }
  }
 },
 "Nakayama Festa": {
  "id": "104901",
  "outfit": "Desperate Measures",
  "rating": 13.7,
  "avg": 10.8,
  "best": 18,
  "bestTrack": "sapporo-1500",
  "power": 17.3,
  "price": 14,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 18,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Tamamo Cross (Festival)": {
  "id": "102102",
  "outfit": "Raging Thunder",
  "rating": 12.6,
  "avg": 7.6,
  "best": 20,
  "bestTrack": "tokyo-2400",
  "power": 17.5,
  "price": 17,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 20,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 15,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Inari One (Festival)": {
  "id": "103402",
  "outfit": "Golden Dream",
  "rating": 13.5,
  "avg": 9.2,
  "best": 20,
  "bestTrack": "kyoto-3000",
  "power": 11.3,
  "price": 21,
  "simPrice": 21,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 10,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 20,
    "style": "End"
   },
   "morioka-1600": {
    "score": 7,
    "style": "Pace"
   }
  }
 },
 "Yamanin Zephyr": {
  "id": "107801",
  "outfit": "Fluttertail Spirit",
  "rating": 12.9,
  "avg": 10.2,
  "best": 17,
  "bestTrack": "sapporo-1500",
  "power": 12.5,
  "price": 17,
  "simPrice": 19,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 15,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 17,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 10,
    "style": "Pace"
   }
  }
 },
 "Aston Machan": {
  "id": "108701",
  "outfit": "Flare",
  "rating": 11.4,
  "avg": 6.4,
  "best": 19,
  "bestTrack": "chukyo-1200",
  "power": 14.5,
  "price": 17,
  "simPrice": 15,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 19,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 10,
    "style": "Front"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Agnes Digital (Halloween)": {
  "id": "101902",
  "outfit": "Fanatic♡Jiangshi",
  "rating": 13.3,
  "avg": 10.2,
  "best": 18,
  "bestTrack": "tokyo-2400",
  "power": 16.3,
  "price": 15,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 14,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "End"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 17,
    "style": "Pace"
   }
  }
 },
 "Meisho Doto (Halloween)": {
  "id": "105802",
  "outfit": "Dot-o'-Lantern",
  "rating": 11.1,
  "avg": 7.2,
  "best": 17,
  "bestTrack": "tokyo-2400",
  "power": 16.5,
  "price": 18,
  "simPrice": 14,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 17,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Seeking the Pearl": {
  "id": "104201",
  "outfit": "Rocket☆Star",
  "rating": 10.5,
  "avg": 6.8,
  "best": 16,
  "bestTrack": "chukyo-1200",
  "power": 15.5,
  "price": 12,
  "simPrice": 12,
  "tracks": {
   "chukyo-1200": {
    "score": 16,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 15,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Yukino Bijin": {
  "id": "102901",
  "outfit": "Darl'n Snowflake",
  "rating": 13.6,
  "avg": 10.6,
  "best": 18,
  "bestTrack": "morioka-1600",
  "power": 13,
  "price": 16,
  "simPrice": 21,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 9,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 14,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 18,
    "style": "Pace"
   }
  }
 },
 "Winning Ticket (Steampunk)": {
  "id": "103502",
  "outfit": "Dream Deliverer",
  "rating": 11.9,
  "avg": 7.2,
  "best": 19,
  "bestTrack": "tokyo-2400",
  "power": 16.5,
  "price": 14,
  "simPrice": 16,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 19,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 14,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Narita Taishin (Steampunk)": {
  "id": "105002",
  "outfit": "Difference Engineer",
  "rating": 13.5,
  "avg": 9.2,
  "best": 20,
  "bestTrack": "tokyo-2400",
  "power": 14.7,
  "price": 21,
  "simPrice": 21,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 7,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 20,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 17,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Smart Falcon (Grand Concert)": {
  "id": "104602",
  "outfit": "Twilight Triumph",
  "rating": 15.6,
  "avg": 12.6,
  "best": 20,
  "bestTrack": "morioka-1600",
  "power": 15.5,
  "price": 14,
  "simPrice": 24,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 14,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 16,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 20,
    "style": "Front"
   }
  }
 },
 "Copano Rickey": {
  "id": "109801",
  "outfit": "Eightfold☆Fortune",
  "rating": 10.4,
  "avg": 4.6,
  "best": 19,
  "bestTrack": "morioka-1600",
  "power": 19,
  "price": 21,
  "simPrice": 12,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 19,
    "style": "Pace"
   }
  }
 },
 "Bamboo Memory": {
  "id": "105301",
  "outfit": "Iron Ambition",
  "rating": 13,
  "avg": 9.6,
  "best": 18,
  "bestTrack": "sapporo-1500",
  "power": 11.8,
  "price": 16,
  "simPrice": 19,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Late"
   },
   "sapporo-1500": {
    "score": 18,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "End"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 6,
    "style": "Late"
   }
  }
 },
 "Gold Ship (Summer)": {
  "id": "100702",
  "outfit": "RUN! RUIN! LAUNCHER!",
  "rating": 12,
  "avg": 8.6,
  "best": 17,
  "bestTrack": "tokyo-2400",
  "power": 13.7,
  "price": 16,
  "simPrice": 16,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 11,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 17,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Mejiro McQueen (Summer)": {
  "id": "101303",
  "outfit": "Fair Lady of the Waves",
  "rating": 8.2,
  "avg": 5,
  "best": 13,
  "bestTrack": "kyoto-3000",
  "power": 11,
  "price": 15,
  "simPrice": 7,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 9,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Special Week (Commander)": {
  "id": "100103",
  "outfit": "Ruler of Japan",
  "rating": 11.8,
  "avg": 7.6,
  "best": 18,
  "bestTrack": "kyoto-3000",
  "power": 12,
  "price": 15,
  "simPrice": 15,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 7,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Air Shakur": {
  "id": "103601",
  "outfit": "unsigned",
  "rating": 12.9,
  "avg": 8.2,
  "best": 20,
  "bestTrack": "tokyo-2400",
  "power": 19,
  "price": 15,
  "simPrice": 19,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 20,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Taiki Shuttle (Camping)": {
  "id": "101002",
  "outfit": "Bubblegum☆Memories",
  "rating": 13.4,
  "avg": 9.6,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 15.3,
  "price": 20,
  "simPrice": 20,
  "tracks": {
   "chukyo-1200": {
    "score": 8,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 19,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 19,
    "style": "Pace"
   }
  }
 },
 "Mejiro Dober (Camping)": {
  "id": "105902",
  "outfit": "Sapphire Sojourn",
  "rating": 11.2,
  "avg": 6,
  "best": 19,
  "bestTrack": "tokyo-2400",
  "power": 13.5,
  "price": 16,
  "simPrice": 14,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 8,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "Late"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Sweep Tosho": {
  "id": "104401",
  "outfit": "Platanus Witch",
  "rating": 9.3,
  "avg": 6.8,
  "best": 13,
  "bestTrack": "tokyo-2400",
  "power": 10.7,
  "price": 14,
  "simPrice": 9,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 12,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 13,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 7,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Inari One": {
  "id": "103401",
  "outfit": "Edomurasaki",
  "rating": 15.2,
  "avg": 12.6,
  "best": 19,
  "bestTrack": "tokyo-2400",
  "power": 15.5,
  "price": 16,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 15,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 14,
    "style": "End"
   },
   "morioka-1600": {
    "score": 14,
    "style": "End"
   }
  }
 },
 "Fine Motion (Wedding)": {
  "id": "102202",
  "outfit": "Titania",
  "rating": 12.8,
  "avg": 8.6,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 13.7,
  "price": 16,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 19,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 10,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Curren Chan (Wedding)": {
  "id": "103802",
  "outfit": "Ma Chérie of the New Moon",
  "rating": 11,
  "avg": 5.6,
  "best": 19,
  "bestTrack": "chukyo-1200",
  "power": 12.5,
  "price": 17,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 19,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 6,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Mejiro Palmer": {
  "id": "106401",
  "outfit": "Line Breakthrough",
  "rating": 8.4,
  "avg": 5.4,
  "best": 13,
  "bestTrack": "tokyo-2400",
  "power": 12,
  "price": 14,
  "simPrice": 8,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 13,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Front"
   },
   "morioka-1600": null
  }
 },
 "Ines Fujin": {
  "id": "103101",
  "outfit": "Always Electrifying",
  "rating": 6.1,
  "avg": 4.8,
  "best": 8,
  "bestTrack": "sapporo-1500",
  "power": 7.3,
  "price": 15,
  "simPrice": 6,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 8,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 6,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Nice Nature (Cheerleader)": {
  "id": "106002",
  "outfit": "Run & Win",
  "rating": 12.4,
  "avg": 9.4,
  "best": 17,
  "bestTrack": "sapporo-1500",
  "power": 15,
  "price": 14,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 17,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 16,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 12,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "King Halo (Cheerleader)": {
  "id": "106102",
  "outfit": "Cheerleader in Noble White",
  "rating": 13.3,
  "avg": 8.8,
  "best": 20,
  "bestTrack": "chukyo-1200",
  "power": 10.8,
  "price": 18,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 20,
    "style": "Late"
   },
   "sapporo-1500": {
    "score": 8,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 8,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Yaeno Muteki": {
  "id": "107201",
  "outfit": "Blazed Head, Covered Fists",
  "rating": 8.6,
  "avg": 5.6,
  "best": 13,
  "bestTrack": "tokyo-2400",
  "power": 12.5,
  "price": 12,
  "simPrice": 8,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 12,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 13,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Nishino Flower": {
  "id": "105101",
  "outfit": "Layered Petals",
  "rating": 10.8,
  "avg": 6.6,
  "best": 17,
  "bestTrack": "chukyo-1200",
  "power": 15,
  "price": 21,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 17,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 13,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Fuji Kiseki (Ballroom)": {
  "id": "100502",
  "outfit": "Succès Étoilé",
  "rating": 8.8,
  "avg": 6.6,
  "best": 12,
  "bestTrack": "chukyo-1200",
  "power": 10.3,
  "price": 14,
  "simPrice": 8,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 12,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 10,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 9,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Seiun Sky (Ballroom)": {
  "id": "102002",
  "outfit": "Soirée des Chatons",
  "rating": 13.9,
  "avg": 9.8,
  "best": 20,
  "bestTrack": "sapporo-1500",
  "power": 15.7,
  "price": 18,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 20,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Front"
   },
   "morioka-1600": null
  }
 },
 "Mejiro Bright": {
  "id": "107401",
  "outfit": "Brunissage Line",
  "rating": 12.5,
  "avg": 8.8,
  "best": 18,
  "bestTrack": "kyoto-3000",
  "power": 14,
  "price": 13,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 9,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Satono Diamond": {
  "id": "106701",
  "outfit": "Natural Brilliance",
  "rating": 11.8,
  "avg": 8.4,
  "best": 17,
  "bestTrack": "kyoto-3000",
  "power": 13.3,
  "price": 16,
  "simPrice": 16,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 16,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 17,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Kitasan Black": {
  "id": "106801",
  "outfit": "Gilded Shrine to Glory",
  "rating": 10.7,
  "avg": 7.8,
  "best": 15,
  "bestTrack": "sapporo-1500",
  "power": 12.3,
  "price": 18,
  "simPrice": 12,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 15,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 12,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Admire Vega": {
  "id": "103301",
  "outfit": "Starry Nocturne",
  "rating": 13,
  "avg": 9,
  "best": 19,
  "bestTrack": "kyoto-3000",
  "power": 14.3,
  "price": 14,
  "simPrice": 19,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 8,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 16,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 19,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Mejiro Ardan": {
  "id": "107101",
  "outfit": "Crystalline",
  "rating": 12,
  "avg": 8.6,
  "best": 17,
  "bestTrack": "sapporo-1500",
  "power": 13.7,
  "price": 11,
  "simPrice": 16,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 17,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 17,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 7,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Mihono Bourbon (Valentine)": {
  "id": "102602",
  "outfit": "CODE: ICING",
  "rating": 14.8,
  "avg": 12,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 14.8,
  "price": 24,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 18,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 19,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 7,
    "style": "Front"
   },
   "morioka-1600": null
  }
 },
 "Eishin Flash (Valentine)": {
  "id": "103702",
  "outfit": "Precise Chocolatier",
  "rating": 10.7,
  "avg": 5.8,
  "best": 18,
  "bestTrack": "tokyo-2400",
  "power": 13,
  "price": 13,
  "simPrice": 12,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 18,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 8,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Sakura Chiyono O": {
  "id": "106901",
  "outfit": "Strength in Full Bloom",
  "rating": 8.1,
  "avg": 4.8,
  "best": 13,
  "bestTrack": "sapporo-1500",
  "power": 10.5,
  "price": 12,
  "simPrice": 7,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 13,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "TM Opera O (New Year)": {
  "id": "101502",
  "outfit": "New Year, Same Radiance!",
  "rating": 10.9,
  "avg": 6.2,
  "best": 18,
  "bestTrack": "kyoto-3000",
  "power": 14,
  "price": 17,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 10,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Haru Urara (New Year)": {
  "id": "105202",
  "outfit": "New Year ♪ New Urara!",
  "rating": 5.2,
  "avg": 2.6,
  "best": 9,
  "bestTrack": "morioka-1600",
  "power": 9,
  "price": 8,
  "simPrice": 5,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 9,
    "style": "Late"
   }
  }
 },
 "Tamamo Cross": {
  "id": "102101",
  "outfit": "Fast as Lightning",
  "rating": 12.8,
  "avg": 8,
  "best": 20,
  "bestTrack": "tokyo-2400",
  "power": 18.5,
  "price": 17,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 20,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 17,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Fine Motion": {
  "id": "102201",
  "outfit": "Noble Seamair",
  "rating": 8.5,
  "avg": 6.8,
  "best": 11,
  "bestTrack": "sapporo-1500",
  "power": 10.7,
  "price": 14,
  "simPrice": 8,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 11,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 10,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Oguri Cap (Christmas)": {
  "id": "100602",
  "outfit": "Ashen Miracle",
  "rating": 15.8,
  "avg": 13.6,
  "best": 19,
  "bestTrack": "tokyo-2400",
  "power": 16.8,
  "price": 48,
  "simPrice": 24,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 13,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "Pace"
   },
   "morioka-1600": {
    "score": 17,
    "style": "Late"
   }
  }
 },
 "Biwa Hayahide (Christmas)": {
  "id": "102302",
  "outfit": "Rouge Caroler",
  "rating": 11.5,
  "avg": 9.2,
  "best": 15,
  "bestTrack": "sapporo-1500",
  "power": 14.7,
  "price": 14,
  "simPrice": 15,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 15,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 14,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 15,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Mejiro Dober": {
  "id": "105901",
  "outfit": "Off the Line",
  "rating": 10,
  "avg": 6,
  "best": 16,
  "bestTrack": "sapporo-1500",
  "power": 13.5,
  "price": 16,
  "simPrice": 11,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 16,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Late"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Tosen Jordan": {
  "id": "104801",
  "outfit": "Jokester ☆ Vibes",
  "rating": 9.2,
  "avg": 6,
  "best": 14,
  "bestTrack": "tokyo-2400",
  "power": 13.5,
  "price": 12,
  "simPrice": 9,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 14,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Symboli Rudolf (Festival)": {
  "id": "101702",
  "outfit": "Archer by Moonlight",
  "rating": 12.1,
  "avg": 8.2,
  "best": 18,
  "bestTrack": "tokyo-2400",
  "power": 13,
  "price": 16,
  "simPrice": 16,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 9,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 12,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Gold City (Festival)": {
  "id": "104002",
  "outfit": "Autumn Cosmos",
  "rating": 13.2,
  "avg": 10.6,
  "best": 17,
  "bestTrack": "sapporo-1500",
  "power": 13,
  "price": 14,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 17,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 14,
    "style": "Late"
   },
   "morioka-1600": {
    "score": 11,
    "style": "Pace"
   }
  }
 },
 "Manhattan Cafe": {
  "id": "102501",
  "outfit": "Creeping Shadow",
  "rating": 14,
  "avg": 8,
  "best": 23,
  "bestTrack": "kyoto-3000",
  "power": 18.5,
  "price": 17,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 14,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 23,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Kawakami Princess": {
  "id": "103901",
  "outfit": "Princess of Pink",
  "rating": 13.2,
  "avg": 9.4,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 15,
  "price": 14,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 10,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 19,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 16,
    "style": "Late"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Rice Shower (Halloween)": {
  "id": "103002",
  "outfit": "Vampire Makeover!",
  "rating": 9.9,
  "avg": 7.2,
  "best": 14,
  "bestTrack": "sapporo-1500",
  "power": 11.3,
  "price": 13,
  "simPrice": 11,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 14,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Super Creek (Halloween)": {
  "id": "104502",
  "outfit": "Chiffon-Wrapped Mummy",
  "rating": 8.4,
  "avg": 5.4,
  "best": 13,
  "bestTrack": "tokyo-2400",
  "power": 12,
  "price": 8,
  "simPrice": 8,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 13,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Agnes Digital": {
  "id": "101901",
  "outfit": "Full-Color Fangirling",
  "rating": 11.3,
  "avg": 8.8,
  "best": 15,
  "bestTrack": "tokyo-2400",
  "power": 14,
  "price": 17,
  "simPrice": 14,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 12,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "End"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 15,
    "style": "Late"
   }
  }
 },
 "Hishi Akebono": {
  "id": "102801",
  "outfit": "Buono ☆ Alla Moda",
  "rating": 11.2,
  "avg": 6.6,
  "best": 18,
  "bestTrack": "chukyo-1200",
  "power": 15,
  "price": 14,
  "simPrice": 14,
  "tracks": {
   "chukyo-1200": {
    "score": 18,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 12,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Matikanefukukitaru (Full Armor)": {
  "id": "105602",
  "outfit": "Lucky Tidings",
  "rating": 13.4,
  "avg": 9.6,
  "best": 19,
  "bestTrack": "kyoto-3000",
  "power": 15.3,
  "price": 12,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 13,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 14,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 19,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Eishin Flash": {
  "id": "103701",
  "outfit": "Meisterschaft",
  "rating": 10.8,
  "avg": 6.6,
  "best": 17,
  "bestTrack": "tokyo-2400",
  "power": 15,
  "price": 15,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 17,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Meisho Doto": {
  "id": "105801",
  "outfit": "Turbulent Blue",
  "rating": 9.2,
  "avg": 5.4,
  "best": 15,
  "bestTrack": "kyoto-3000",
  "power": 12,
  "price": 13,
  "simPrice": 9,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 9,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 15,
    "style": "Late",
    "warn": true
   },
   "morioka-1600": null
  }
 },
 "Special Week (Summer)": {
  "id": "100102",
  "outfit": "Hopp'n♪Happy Heart",
  "rating": 11.7,
  "avg": 8.8,
  "best": 16,
  "bestTrack": "tokyo-2400",
  "power": 14,
  "price": 15,
  "simPrice": 15,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 13,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 16,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Maruzensky (Summer)": {
  "id": "100402",
  "outfit": "Hot☆Summer Night",
  "rating": 13.7,
  "avg": 10.8,
  "best": 18,
  "bestTrack": "sapporo-1500",
  "power": 10.8,
  "price": 16,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 18,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 13,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 3,
    "style": "Front"
   },
   "morioka-1600": {
    "score": 9,
    "style": "Front"
   }
  }
 },
 "Gold City": {
  "id": "104001",
  "outfit": "Authentic / 1928",
  "rating": 14.7,
  "avg": 11.2,
  "best": 20,
  "bestTrack": "sapporo-1500",
  "power": 13.8,
  "price": 14,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 20,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "Late",
    "warn": true
   },
   "morioka-1600": {
    "score": 11,
    "style": "Late"
   }
  }
 },
 "Fuji Kiseki": {
  "id": "100501",
  "outfit": "Shooting Star Revue",
  "rating": 11.6,
  "avg": 7.4,
  "best": 18,
  "bestTrack": "sapporo-1500",
  "power": 11.7,
  "price": 15,
  "simPrice": 15,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 18,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 6,
    "style": "Front"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Grass Wonder (Fantasy)": {
  "id": "101102",
  "outfit": "Saintly Jade Cleric",
  "rating": 8,
  "avg": 6,
  "best": 11,
  "bestTrack": "kyoto-3000",
  "power": 9.3,
  "price": 8,
  "simPrice": 7,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 10,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Late",
    "warn": true
   },
   "morioka-1600": null
  }
 },
 "El Condor Pasa (Fantasy)": {
  "id": "101402",
  "outfit": "Kukulkan Warrior",
  "rating": 14.7,
  "avg": 11.8,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 14.5,
  "price": 14,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 19,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 16,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": {
    "score": 14,
    "style": "Late"
   }
  }
 },
 "Hishi Amazon": {
  "id": "101201",
  "outfit": "Azure Amazon",
  "rating": 13.6,
  "avg": 10.6,
  "best": 18,
  "bestTrack": "tokyo-2400",
  "power": 13,
  "price": 14,
  "simPrice": 21,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 10,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 9,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 18,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 15,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Seiun Sky": {
  "id": "102001",
  "outfit": "Reeling in the Big One",
  "rating": 12.4,
  "avg": 8.6,
  "best": 18,
  "bestTrack": "sapporo-1500",
  "power": 13.7,
  "price": 18,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 18,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 11,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 12,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Air Groove (Wedding)": {
  "id": "101802",
  "outfit": "Quercus Civilis",
  "rating": 13.5,
  "avg": 9.8,
  "best": 19,
  "bestTrack": "sapporo-1500",
  "power": 15.7,
  "price": 15,
  "simPrice": 21,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 14,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 19,
    "style": "Pace",
    "warn": true
   },
   "tokyo-2400": {
    "score": 14,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Mayano Top Gun (Wedding)": {
  "id": "102402",
  "outfit": "Sunlight Bouquet",
  "rating": 13.3,
  "avg": 8.2,
  "best": 21,
  "bestTrack": "kyoto-3000",
  "power": 10,
  "price": 14,
  "simPrice": 20,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 3,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 6,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 21,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Narita Brian": {
  "id": "101601",
  "outfit": "Maverick",
  "rating": 13,
  "avg": 10.4,
  "best": 17,
  "bestTrack": "sapporo-1500",
  "power": 16.7,
  "price": 14,
  "simPrice": 19,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 17,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 17,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Smart Falcon": {
  "id": "104601",
  "outfit": "LOVE☆4EVER",
  "rating": 9.2,
  "avg": 7.4,
  "best": 12,
  "bestTrack": "morioka-1600",
  "power": 9,
  "price": 16,
  "simPrice": 9,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 7,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 6,
    "style": "Front"
   },
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 12,
    "style": "Front"
   }
  }
 },
 "Narita Taishin": {
  "id": "105001",
  "outfit": "Nevertheless",
  "rating": 14.4,
  "avg": 8.6,
  "best": 23,
  "bestTrack": "kyoto-3000",
  "power": 13.7,
  "price": 22,
  "simPrice": 22,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 6,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 23,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Curren Chan": {
  "id": "103801",
  "outfit": "Fille Éclair",
  "rating": 9.4,
  "avg": 5,
  "best": 16,
  "bestTrack": "chukyo-1200",
  "power": 11,
  "price": 16,
  "simPrice": 9,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 16,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 6,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Tokai Teio (Anime Collab)": {
  "id": "100302",
  "outfit": "Beyond the Horizon",
  "rating": 7.3,
  "avg": 4.2,
  "best": 12,
  "bestTrack": "tokyo-2400",
  "power": 9,
  "price": 12,
  "simPrice": 6,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 12,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 6,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Mejiro McQueen (Anime Collab)": {
  "id": "101302",
  "outfit": "End of the Skies",
  "rating": 7.7,
  "avg": 4.8,
  "best": 12,
  "bestTrack": "kyoto-3000",
  "power": 10.5,
  "price": 9,
  "simPrice": 7,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 9,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 12,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Biwa Hayahide": {
  "id": "102301",
  "outfit": "pf. Winning Equation...",
  "rating": 10.2,
  "avg": 7,
  "best": 15,
  "bestTrack": "kyoto-3000",
  "power": 11,
  "price": 11,
  "simPrice": 11,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 10,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 15,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Mihono Bourbon": {
  "id": "102601",
  "outfit": "MB-19890425",
  "rating": 12.7,
  "avg": 9.2,
  "best": 18,
  "bestTrack": "chukyo-1200",
  "power": 11.3,
  "price": 13,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 18,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 11,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 6,
    "style": "Front"
   },
   "morioka-1600": null
  }
 },
 "Special Week": {
  "id": "100101",
  "outfit": "Special Dreamer",
  "rating": 10.3,
  "avg": 7.8,
  "best": 14,
  "bestTrack": "sapporo-1500",
  "power": 12.3,
  "price": 13,
  "simPrice": 11,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 14,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Silence Suzuka": {
  "id": "100201",
  "outfit": "Innocent Silence",
  "rating": 5.7,
  "avg": 4.2,
  "best": 8,
  "bestTrack": "sapporo-1500",
  "power": 6.3,
  "price": 14,
  "simPrice": 5,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 5,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 8,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 6,
    "style": "Front"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Tokai Teio": {
  "id": "100301",
  "outfit": "Peak Joy",
  "rating": 9,
  "avg": 5.6,
  "best": 14,
  "bestTrack": "tokyo-2400",
  "power": 12.5,
  "price": 12,
  "simPrice": 8,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 14,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Maruzensky": {
  "id": "100401",
  "outfit": "Formula R",
  "rating": 15.1,
  "avg": 11.8,
  "best": 20,
  "bestTrack": "sapporo-1500",
  "power": 11.8,
  "price": 20,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 8,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 20,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 9,
    "style": "Front"
   },
   "kyoto-3000": {
    "score": 6,
    "style": "Front"
   },
   "morioka-1600": {
    "score": 16,
    "style": "Front"
   }
  }
 },
 "Oguri Cap": {
  "id": "100601",
  "outfit": "Starlight Beat",
  "rating": 11,
  "avg": 9,
  "best": 14,
  "bestTrack": "sapporo-1500",
  "power": 11,
  "price": 18,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 14,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 9,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": {
    "score": 12,
    "style": "Pace"
   }
  }
 },
 "Taiki Shuttle": {
  "id": "101001",
  "outfit": "Wild Frontier",
  "rating": 10.5,
  "avg": 8.2,
  "best": 14,
  "bestTrack": "sapporo-1500",
  "power": 13,
  "price": 19,
  "simPrice": 12,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 12,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 14,
    "style": "Front"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 13,
    "style": "Pace"
   }
  }
 },
 "Mejiro McQueen": {
  "id": "101301",
  "outfit": "Frontline Elegance",
  "rating": 9.8,
  "avg": 5.6,
  "best": 16,
  "bestTrack": "kyoto-3000",
  "power": 12.5,
  "price": 12,
  "simPrice": 10,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 9,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "TM Opera O": {
  "id": "101501",
  "outfit": "O Sole Suo!",
  "rating": 9.8,
  "avg": 5.6,
  "best": 16,
  "bestTrack": "tokyo-2400",
  "power": 12.5,
  "price": 15,
  "simPrice": 10,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 16,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Symboli Rudolf": {
  "id": "101701",
  "outfit": "Emperor's Path",
  "rating": 10.9,
  "avg": 8.2,
  "best": 15,
  "bestTrack": "tokyo-2400",
  "power": 13,
  "price": 15,
  "simPrice": 13,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 11,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 13,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Rice Shower": {
  "id": "103001",
  "outfit": "Rosy Dreams",
  "rating": 11.4,
  "avg": 7,
  "best": 18,
  "bestTrack": "kyoto-3000",
  "power": 11,
  "price": 13,
  "simPrice": 15,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 8,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 18,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Matikanetannhauser": {
  "id": "106201",
  "outfit": "Clippety-Tippety-Clop",
  "rating": 12.5,
  "avg": 8.2,
  "best": 19,
  "bestTrack": "kyoto-3000",
  "power": 13,
  "price": 12,
  "simPrice": 17,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 7,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 13,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 19,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Gold Ship": {
  "id": "100701",
  "outfit": "Red Strife",
  "rating": 17.2,
  "avg": 12.6,
  "best": 24,
  "bestTrack": "kyoto-3000",
  "power": 20.3,
  "price": 17,
  "simPrice": 24,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 18,
    "style": "End"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 24,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Vodka": {
  "id": "100801",
  "outfit": "Wild Top Gear",
  "rating": 9.5,
  "avg": 5.2,
  "best": 16,
  "bestTrack": "sapporo-1500",
  "power": 11.5,
  "price": 9,
  "simPrice": 9,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 16,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Pace"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Daiwa Scarlet": {
  "id": "100901",
  "outfit": "Peak Blue",
  "rating": 10.7,
  "avg": 7.8,
  "best": 15,
  "bestTrack": "tokyo-2400",
  "power": 12.3,
  "price": 12,
  "simPrice": 12,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 12,
    "style": "Front"
   },
   "tokyo-2400": {
    "score": 15,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 10,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Grass Wonder": {
  "id": "101101",
  "outfit": "Stone-Piercing Blue",
  "rating": 14.6,
  "avg": 11,
  "best": 20,
  "bestTrack": "sapporo-1500",
  "power": 17.7,
  "price": 15,
  "simPrice": 23,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 20,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 19,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 14,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "El Condor Pasa": {
  "id": "101401",
  "outfit": "El☆Número 1",
  "rating": 9.8,
  "avg": 9,
  "best": 11,
  "bestTrack": "chukyo-1200",
  "power": 9,
  "price": 13,
  "simPrice": 10,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 11,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 7,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 8,
    "style": "End"
   },
   "morioka-1600": {
    "score": 8,
    "style": "Pace"
   }
  }
 },
 "Air Groove": {
  "id": "101801",
  "outfit": "Empress Road",
  "rating": 8.4,
  "avg": 6.6,
  "best": 11,
  "bestTrack": "sapporo-1500",
  "power": 10.3,
  "price": 9,
  "simPrice": 7,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 10,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 11,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "Late"
   },
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Mayano Top Gun": {
  "id": "102401",
  "outfit": "Scramble☆Zone",
  "rating": 12.6,
  "avg": 8.4,
  "best": 19,
  "bestTrack": "kyoto-3000",
  "power": 10.3,
  "price": 13,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": {
    "score": 3,
    "style": "Front"
   },
   "sapporo-1500": {
    "score": 7,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 12,
    "style": "End"
   },
   "kyoto-3000": {
    "score": 19,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "Super Creek": {
  "id": "104501",
  "outfit": "Murmuring Stream",
  "rating": 6.8,
  "avg": 4,
  "best": 11,
  "bestTrack": "kyoto-3000",
  "power": 8.5,
  "price": 10,
  "simPrice": 6,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 6,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Mejiro Ryan": {
  "id": "102701",
  "outfit": "Down the Line",
  "rating": 9.9,
  "avg": 7.2,
  "best": 14,
  "bestTrack": "tokyo-2400",
  "power": 11.3,
  "price": 15,
  "simPrice": 11,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 9,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 14,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 11,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Agnes Tachyon": {
  "id": "103201",
  "outfit": "tach-nology",
  "rating": 7.4,
  "avg": 5.6,
  "best": 10,
  "bestTrack": "tokyo-2400",
  "power": 8.7,
  "price": 11,
  "simPrice": 6,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 7,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 10,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Pace"
   },
   "morioka-1600": null
  }
 },
 "Winning Ticket": {
  "id": "103501",
  "outfit": "Get to Winning!",
  "rating": 11.1,
  "avg": 7.2,
  "best": 17,
  "bestTrack": "tokyo-2400",
  "power": 16.5,
  "price": 8,
  "simPrice": 14,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": {
    "score": 17,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 16,
    "style": "Late"
   },
   "morioka-1600": null
  }
 },
 "Sakura Bakushin O": {
  "id": "104101",
  "outfit": "Blossom in Learning",
  "rating": 9.9,
  "avg": 5.8,
  "best": 16,
  "bestTrack": "chukyo-1200",
  "power": 13,
  "price": 10,
  "simPrice": 10,
  "tracks": {
   "chukyo-1200": {
    "score": 16,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 10,
    "style": "Pace"
   },
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": null
  }
 },
 "Haru Urara": {
  "id": "105201",
  "outfit": "Bestest Prize ♪",
  "rating": 4.1,
  "avg": 2.2,
  "best": 7,
  "bestTrack": "morioka-1600",
  "power": 7,
  "price": 8,
  "simPrice": 5,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": null,
   "tokyo-2400": null,
   "kyoto-3000": null,
   "morioka-1600": {
    "score": 7,
    "style": "Late",
    "warn": true
   }
  }
 },
 "Matikanefukukitaru": {
  "id": "105601",
  "outfit": "Rising☆Fortune",
  "rating": 12.6,
  "avg": 9.6,
  "best": 17,
  "bestTrack": "tokyo-2400",
  "power": 15.3,
  "price": 10,
  "simPrice": 18,
  "manualPrice": true,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 15,
    "style": "Late"
   },
   "tokyo-2400": {
    "score": 17,
    "style": "Late",
    "warn": true
   },
   "kyoto-3000": {
    "score": 14,
    "style": "Late",
    "warn": true
   },
   "morioka-1600": null
  }
 },
 "Nice Nature": {
  "id": "106001",
  "outfit": "Poinsettia Ribbon",
  "rating": 6.5,
  "avg": 4.8,
  "best": 9,
  "bestTrack": "sapporo-1500",
  "power": 7.3,
  "price": 8,
  "simPrice": 6,
  "tracks": {
   "chukyo-1200": null,
   "sapporo-1500": {
    "score": 9,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Pace"
   },
   "kyoto-3000": {
    "score": 5,
    "style": "End"
   },
   "morioka-1600": null
  }
 },
 "King Halo": {
  "id": "106101",
  "outfit": "King of Emeralds",
  "rating": 9.7,
  "avg": 8.2,
  "best": 12,
  "bestTrack": "sapporo-1500",
  "power": 10,
  "price": 10,
  "simPrice": 10,
  "tracks": {
   "chukyo-1200": {
    "score": 11,
    "style": "Pace"
   },
   "sapporo-1500": {
    "score": 12,
    "style": "Pace"
   },
   "tokyo-2400": {
    "score": 8,
    "style": "Late"
   },
   "kyoto-3000": {
    "score": 9,
    "style": "Late"
   },
   "morioka-1600": null
  }
 }
};
