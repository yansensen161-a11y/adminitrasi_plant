// ─── Shared Portal Definitions, Themes, and Icon Catalog ─────────────────────

export const icons = {
  dashboard:       "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  kpi:             "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
  masterData:      "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  unit:            "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  hourMeter:       "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  planInspect:     "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  inspectionCheck: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  planComp:        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
  analisa:         "M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  mcc:             "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  far:             "M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.07 15.93 0 13.36 0 11.9 0 10.58.72 9.73 1.83L8 4 6.27 1.83C5.43.72 4.1 0 2.64 0 1.07 0 0 1.07 0 2.64c0 .48.11.92.18 1.36H-2v2h2.18c.07-.44.18-.88.18-1.36C.36 3.18.82 2.72 1.36 2.72c.54 0 1.04.28 1.32.72L5 6H2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6h-2zm-4 0H8L5.68 2.87C5.96 2.43 6.46 2.15 7 2.15c.54 0 1.04.28 1.32.72L10.5 6h3L15.68 2.87C15.96 2.43 16.46 2.15 17 2.15c.54 0 1.04.28 1.32.72L16 6z",
  forecast:        "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z",
  canibal:         "M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.19v6.72zm14 0v-6.72l-6 3.39v6.71l6-3.38z",
  magPlug:         "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  battery:         "M17 5v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V5h10zm-2 2H9v0h6zm3 4H6v6h12v-6zm-7 1v4h-2v-4h2zm4 0v4h-2v-4h2z",
  oil:             "M12 2c-.22 0-.42.1-.55.27l-7.79 9.68a7.84 7.84 0 1016.68 0L12.55 2.27A.7.7 0 0012 2zm0 2.92l5.77 7.18a6.34 6.34 0 11-11.54 0z",
  manpower:        "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  org:             "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  perhitungan:     "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  roster:          "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  cuti:            "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  users:           "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-6 8v-1c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v1H6z",
  settings:        "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  gatepass:        "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z M7.5 15c.83 0 1.5-.67 1.5-1.5S8.33 12 7.5 12 6 12.67 6 13.5 6.67 15 7.5 15zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z",
  logs:            "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2V9h2v2zm0 4h-2v-2h2v2z",
  jsa:             "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  performanceUnit: "M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z",
  truck:           "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  disc:            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  wrench:          "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  clipboard:       "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z",
  shield:          "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 9.04-7 10.19-3.87-1.15-7-5.52-7-10.19V6.3l7-3.12z",
  portalDeck:      "M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
  tools:           "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  toolroom:        "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  washing:         "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  breakdown:       "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  spk:             "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  planService:     "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z",
  pm:              "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z",
  checksheet:      "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  p2h:             "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  genset:          "M7 2v11h3v9l7-12h-4l4-8z",
  dt:              "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  dozer:           "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z",
  grader:          "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z",
  warranty:        "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  tyre:            "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z",
  tirevault:       "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z",
  pressure:        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-3.09c1.72-.45 3-2 3-3.91 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 1.91 1.28 3.46 3 3.91v3.09h2z",
  inspection:      "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  document:        "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  database:        "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  calendar:        "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z",
  analytics:       "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  fuel:            "M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
  bell:            "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  check:           "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  video:           "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z",
  play:            "M8 5v14l11-7z",
};

const baseText = "text-gray-600 dark:text-slate-400";
const hoverText = "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white";
const activeText = "text-gray-900 dark:text-white";
const collapsibleActiveBase = "bg-gray-100 text-gray-900 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/10";

export const themes = {
  emerald: {
    key: "emerald",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    cardBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    cardBorder: "border-emerald-500/30",
    accentText: "text-emerald-600 dark:text-emerald-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-emerald-50/50 to-transparent border-l-emerald-600 dark:from-emerald-500/10 dark:border-l-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",
    icon: "text-emerald-500 dark:text-emerald-400 dark:drop-shadow-[0_0_4px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_12px_rgba(16,185,129,1)] scale-110",
    glow: "bg-emerald-400/20",
  },
  orange: {
    key: "orange",
    badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    cardBg: "bg-orange-50/40 dark:bg-orange-950/20",
    cardBorder: "border-orange-500/30",
    accentText: "text-orange-600 dark:text-orange-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-orange-50/50 to-transparent border-l-orange-600 dark:from-orange-500/10 dark:border-l-orange-400 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]",
    icon: "text-orange-500 dark:text-orange-400 dark:drop-shadow-[0_0_4px_rgba(249,115,22,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-orange-600 dark:text-orange-300 dark:drop-shadow-[0_0_12px_rgba(249,115,22,1)] scale-110",
    glow: "bg-orange-400/20",
  },
  amber: {
    key: "amber",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    cardBg: "bg-amber-50/40 dark:bg-amber-950/20",
    cardBorder: "border-amber-500/30",
    accentText: "text-amber-600 dark:text-amber-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-amber-50/50 to-transparent border-l-amber-500 dark:from-amber-500/10 dark:border-l-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]",
    icon: "text-amber-500 dark:text-amber-400 dark:drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-amber-500 dark:text-amber-300 dark:drop-shadow-[0_0_12px_rgba(245,158,11,1)] scale-110",
    glow: "bg-amber-400/20",
  },
  cyan: {
    key: "cyan",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    cardBg: "bg-cyan-50/40 dark:bg-cyan-950/20",
    cardBorder: "border-cyan-500/30",
    accentText: "text-cyan-600 dark:text-cyan-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-cyan-50/50 to-transparent border-l-cyan-600 dark:from-cyan-500/10 dark:border-l-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]",
    icon: "text-cyan-500 dark:text-cyan-400 dark:drop-shadow-[0_0_4px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-cyan-600 dark:text-cyan-300 dark:drop-shadow-[0_0_12px_rgba(6,182,212,1)] scale-110",
    glow: "bg-cyan-400/20",
  },
  purple: {
    key: "purple",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    cardBg: "bg-purple-50/40 dark:bg-purple-950/20",
    cardBorder: "border-purple-500/30",
    accentText: "text-purple-600 dark:text-purple-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-purple-50/50 to-transparent border-l-purple-600 dark:from-purple-500/10 dark:border-l-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]",
    icon: "text-purple-500 dark:text-purple-400 dark:drop-shadow-[0_0_4px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-purple-600 dark:text-purple-300 dark:drop-shadow-[0_0_12px_rgba(168,85,247,1)] scale-110",
    glow: "bg-purple-400/20",
  },
  teal: {
    key: "teal",
    badge: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    cardBg: "bg-teal-50/40 dark:bg-teal-950/20",
    cardBorder: "border-teal-500/30",
    accentText: "text-teal-600 dark:text-teal-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-teal-50/50 to-transparent border-l-teal-600 dark:from-teal-500/10 dark:border-l-teal-400 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]",
    icon: "text-teal-500 dark:text-teal-400 dark:drop-shadow-[0_0_4px_rgba(20,184,166,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-teal-600 dark:text-teal-300 dark:drop-shadow-[0_0_12px_rgba(20,184,166,1)] scale-110",
    glow: "bg-teal-400/20",
  },
  rose: {
    key: "rose",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    cardBg: "bg-rose-50/40 dark:bg-rose-950/20",
    cardBorder: "border-rose-500/30",
    accentText: "text-rose-600 dark:text-rose-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-rose-50/50 to-transparent border-l-rose-600 dark:from-rose-500/10 dark:border-l-rose-400 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]",
    icon: "text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_4px_rgba(244,63,94,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-rose-600 dark:text-rose-300 dark:drop-shadow-[0_0_12px_rgba(244,63,94,1)] scale-110",
    glow: "bg-rose-400/20",
  },
  blue: {
    key: "blue",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    cardBg: "bg-blue-50/40 dark:bg-blue-950/20",
    cardBorder: "border-blue-500/30",
    accentText: "text-blue-600 dark:text-blue-400",
    text: baseText, hover: hoverText, activeText: activeText, shadowActive: "", shadowHover: "", collapsibleActive: collapsibleActiveBase,
    activeBg: "bg-gradient-to-r from-blue-50/50 to-transparent border-l-blue-600 dark:from-blue-500/10 dark:border-l-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]",
    icon: "text-blue-500 dark:text-blue-400 dark:drop-shadow-[0_0_4px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110",
    activeIcon: "text-blue-600 dark:text-blue-300 dark:drop-shadow-[0_0_12px_rgba(59,130,246,1)] scale-110",
    glow: "bg-blue-400/20",
  }
};

export const PORTALS = [
  {
    id: "plant-fleet",
    name: "Plant & Fleet",
    shortName: "Fleet",
    badge: "01 • FLEET",
    themeKey: "emerald",
    iconKey: "truck",
    defaultUrl: "/work-orders",
    sections: [
      {
        label: "MAINTENANCE CONTROL",
        key: "maint-control",
        items: [
          {
            name: "Work Order",
            iconKey: "mcc",
            subItems: [
              { name: "Monitoring Breakdown", href: "/work-orders?tab=breakdown", iconKey: "mcc" },
              { name: "Historical WO Closed", href: "/work-orders?tab=historical", iconKey: "perhitungan" },
            ],
          },
          { name: "Monitoring Order List", href: "/monitoring-orderan", iconKey: "planComp" },
          { name: "Part Order & Lifetime", href: "/part-order-lifetime", iconKey: "planComp" },
          { name: "Oil Consumption", href: "/oil-consumption", iconKey: "oil" },
          { name: "Failure Analysis (FAR)", href: "/failure-analysis", iconKey: "far" },
          { name: "Forecast Budget Monthly", href: "/forecast-budget-monthly", iconKey: "forecast" },
        ],
      },
      {
        label: "PREVENTIVE MAINTENANCE",
        key: "preventive",
        items: [
          { name: "PM Monitoring", href: "/pm-monitoring", iconKey: "planInspect" },
          { name: "Inspeksi Harian P2H", href: "/inspection-unit", iconKey: "inspectionCheck" },
          { name: "Daily Maintenance Achievement", href: "/plan-inspections", iconKey: "planInspect" },
          { name: "Plan PCR Undercarriage", href: "/pcr-uc", iconKey: "planComp" },
          { name: "Plan PCR Component", href: "/pcr-component", iconKey: "planComp" },
          { name: "Analisa Biaya Repair (ABR)", href: "/abr", iconKey: "analisa" },
        ],
      },
      {
        label: "COMPONENT & CONDITION",
        key: "component",
        items: [
          { name: "Component Report (CCR)", href: "/ccr", iconKey: "planComp" },
          { name: "Monitoring Part Canibal", href: "/part-canibals", iconKey: "canibal" },
          { name: "Replace Battery", href: "/repair/battery", iconKey: "battery" },
          { name: "WO Outside Repair", href: "/repair/job-outside", iconKey: "mcc" },
          { name: "Magnetic Plug", href: "/repair/magnetic-plug", iconKey: "magPlug" },
        ],
      },
      {
        label: "KPI & ANALYTICS",
        key: "kpi-analytics",
        items: [
          { name: "Key Performance Index", href: "/kpi", iconKey: "kpi" },
          { name: "Performance Unit Operasi", href: "/performance-unit", iconKey: "performanceUnit" },
          { name: "Hour Meter Log Tracker", href: "/hour-meters", iconKey: "hourMeter" },
        ],
      },
    ],
  },
  {
    id: "tyres",
    name: "Tyre Management",
    shortName: "Tyre",
    badge: "02 • TYRE",
    themeKey: "orange",
    iconKey: "disc",
    defaultUrl: "/tyres",
    sections: [
      {
        label: "TYRE VAULT & INVENTORY",
        key: "tyre-vault",
        items: [
          { name: "Tyre Dashboard", href: "/tyres", iconKey: "dashboard" },
          { name: "Ban Terpasang Unit (Active)", href: "/tyres?condition=ACTIVE", iconKey: "unit" },
          { name: "Ready Pool Stock (Gudang)", href: "/tyres?condition=STOCK", iconKey: "planComp" },
          { name: "Ban Dalam Perbaikan", href: "/tyres?condition=REPAIR", iconKey: "mcc" },
          { name: "Ban Afkir & Scrap", href: "/tyres?condition=SCRAP", iconKey: "canibal" },
        ],
      },
      {
        label: "VISUAL & RIWAYAT",
        key: "tyre-visual",
        items: [
          { name: "Visual Wheel Map Sasis (3D)", href: "/tyres?condition=3D_VIEWER", iconKey: "dashboard" },
          { name: "Histori & Pergantian Ban", href: "/historical-tyre", iconKey: "perhitungan" },
        ],
      },
    ],
  },
  {
    id: "asset-management",
    name: "Asset Management",
    shortName: "Asset",
    badge: "03 • ASSET",
    themeKey: "amber",
    iconKey: "wrench",
    defaultUrl: "/units",
    sections: [
      {
        label: "FLEET POPULASI UNIT",
        key: "fleet-asset",
        items: [
          { name: "Populasi Unit Alat Berat", href: "/units", iconKey: "unit" },
          { name: "Gatepass Unit Keluar", href: "/gatepass-unit", iconKey: "gatepass" },
          { name: "List Populasi Ringkas", href: "/list-populasi", iconKey: "masterData" },
        ],
      },
      {
        label: "TOOLROOM & SST",
        key: "toolroom",
        items: [
          { name: "Inventory Toolroom", href: "/toolroom", iconKey: "mcc" },
          { name: "Peminjaman Tool SST", href: "/toolroom?tab=borrow", iconKey: "planInspect" },
          { name: "Inspection Tool", href: "/toolroom?tab=inspection", iconKey: "inspectionCheck" },
          { name: "Orderan Tool", href: "/toolroom?tab=order", iconKey: "far" },
          { name: "Scrap & Rusak Tool", href: "/toolroom?tab=scrap", iconKey: "canibal" },
          { name: "Gate Pass Tool", href: "/toolroom?tab=gatepass", iconKey: "gatepass" },
        ],
      },
    ],
  },
  {
    id: "form-plant",
    name: "Form Plant Hub",
    shortName: "Forms",
    badge: "04 • FORMS",
    themeKey: "cyan",
    iconKey: "clipboard",
    defaultUrl: "/form-penundaan-service",
    sections: [
      {
        label: "MASTER FORM PEMELIHARAAN",
        key: "master-forms",
        items: [
          { name: "Form Penundaan Service", href: "/form-penundaan-service", iconKey: "planInspect" },
          { name: "Form Washing Unit", href: "/form-washing-unit", iconKey: "inspectionCheck" },
          { name: "Form Service Genset", href: "/form-service-genset", iconKey: "planComp" },
          { name: "Form Service Dump Truck", href: "/form-service-dump-truck", iconKey: "unit" },
          { name: "Form OHT 773", href: "/form-oht773", iconKey: "unit" },
          { name: "Form Inspection Bucket", href: "/form-inspection-bucket", iconKey: "magPlug" },
          { name: "Check Sheet Service Hauler", href: "/form-check-sheet-service", iconKey: "planInspect" },
          { name: "Check Sheet Dozer", href: "/form-check-sheet-dozer", iconKey: "planComp" },
          { name: "Check Sheet Motorgrader", href: "/form-check-sheet-motorgrader", iconKey: "planComp" },
          { name: "Pre Release Track Unit", href: "/form-pre-release-track-unit", iconKey: "inspectionCheck" },
          { name: "Request Asset Disposed", href: "/form-request-asset-disposed", iconKey: "canibal" },
          { name: "Surat Permintaan Part", href: "/form-surat-permintaan-komponen", iconKey: "perhitungan" },
        ],
      },
      {
        label: "JOB SAFETY ANALYSIS (JSA)",
        key: "jsa-forms",
        items: [
          { name: "Portal Form JSA Hub", href: "/form-jsa/portal", iconKey: "jsa" },
          { name: "Overhaul Starting Motor", href: "/form-jsa/overhaul-starting-motor", iconKey: "jsa" },
          { name: "Maintenance AC System DT", href: "/form-jsa/maintenance-ac-dump-truck", iconKey: "jsa" },
          { name: "Radiator Medium Truck", href: "/form-jsa/radiator-medium-truck", iconKey: "jsa" },
          { name: "Welding Chasis Truck", href: "/form-jsa/welding-chasis-medium-truck", iconKey: "jsa" },
        ],
      },
    ],
  },
  {
    id: "admin",
    name: "Admin Hub & System",
    shortName: "Admin",
    badge: "05 • ADMIN",
    themeKey: "purple",
    iconKey: "shield",
    defaultUrl: "/master-data",
    sections: [
      {
        label: "MASTER DATA & CONFIG",
        key: "admin-config",
        items: [
          { name: "Master Data Hub", href: "/master-data", iconKey: "masterData" },
          { name: "Pengaturan Sistem (Mail)", href: "/settings/mail", iconKey: "settings" },
        ],
      },
      {
        label: "USER & ACCESS CONTROL",
        key: "admin-users",
        items: [
          { name: "Data Pengguna", href: "/users", iconKey: "users" },
          { name: "Roles / Peran", href: "/roles", iconKey: "users" },
          { name: "Hak Akses (Permissions)", href: "/permissions", iconKey: "users" },
        ],
      },
      {
        label: "AUDIT & DATABASE",
        key: "admin-audit",
        items: [
          { name: "Activity Logs", href: "/activity-logs", iconKey: "logs" },
          { name: "Database Relasi 3D", href: "/database-schema", iconKey: "dashboard" },
        ],
      },
    ],
  },
  {
    id: "manpower",
    name: "Manpower & Org",
    shortName: "Manpower",
    badge: "06 • MANPOWER",
    themeKey: "teal",
    iconKey: "manpower",
    defaultUrl: "/manpower",
    sections: [
      {
        label: "PERSONEL & STRUKTUR",
        key: "manpower-org",
        items: [
          { name: "Data Manpower Plant", href: "/manpower", iconKey: "manpower" },
          { name: "Struktur Organisasi", href: "/organization", iconKey: "org" },
          { name: "Budget Manpower", href: "/manpower-budget", iconKey: "perhitungan" },
        ],
      },
      {
        label: "ROSTER & CUTI",
        key: "manpower-roster",
        items: [
          { name: "Perhitungan Manpower", href: "/manpower/perhitungan", iconKey: "perhitungan" },
          { name: "Roster Plant", href: "/roster", iconKey: "roster" },
          { name: "Pengajuan Cuti", href: "/cuti/pengajuan", iconKey: "cuti" },
        ],
      },
    ],
  },
];

export const detectPortalFromPath = (path) => {
  if (!path) return null;
  const p = path.toLowerCase();

  if (p.startsWith("/tyres") || p.startsWith("/historical-tyre")) return "tyres";
  if (p.startsWith("/form-") || p.startsWith("/check-sheet")) return "form-plant";
  if (p.startsWith("/toolroom")) return "asset-management";
  if (
    p.startsWith("/manpower") ||
    p.startsWith("/organization") ||
    p.startsWith("/roster") ||
    p.startsWith("/cuti") ||
    p.startsWith("/absensi") ||
    p.startsWith("/slip-gaji")
  ) {
    return "manpower";
  }
  if (
    p.startsWith("/users") ||
    p.startsWith("/roles") ||
    p.startsWith("/permissions") ||
    p.startsWith("/activity-logs") ||
    p.startsWith("/settings") ||
    p.startsWith("/database-schema") ||
    p.startsWith("/master-data")
  ) {
    return "admin";
  }
  if (p.startsWith("/kpi") || p.startsWith("/performance-unit") || p.startsWith("/hour-meters")) return "plant-fleet";
  if (p.startsWith("/units") || p.startsWith("/gatepass-unit") || p.startsWith("/list-populasi")) {
    return "asset-management";
  }
  if (
    p.startsWith("/work-orders") ||
    p.startsWith("/pm-monitoring") ||
    p.startsWith("/inspection-unit") ||
    p.startsWith("/inspection-p2h") ||
    p.startsWith("/plan-inspections") ||
    p.startsWith("/plan-service") ||
    p.startsWith("/pcr") ||
    p.startsWith("/abr") ||
    p.startsWith("/monitoring-orderan") ||
    p.startsWith("/part-order-lifetime") ||
    p.startsWith("/failure-analysis") ||
    p.startsWith("/forecast-budget") ||
    p.startsWith("/part-canibal") ||
    p.startsWith("/repair") ||
    p.startsWith("/oil-consumption") ||
    p.startsWith("/ccr") ||
    p.startsWith("/service-orders")
  ) {
    return "plant-fleet";
  }
  return null;
};
