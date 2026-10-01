# Alrescha

Alrescha의 소개 페이지입니다. 정적 파일 네 개(`index.html`, `styles.css`, `site.js`, `assets/`)로 이루어져 있고, 요청 시점에 빌드하는 단계는 없습니다.

Alrescha는 물고기자리 α별, 두 물고기를 잇는 끈의 매듭(아랍어 *al-rishā’*, "끈")에서 온 이름입니다. 첫 화면은 실제 물고기자리를 성도처럼 그립니다. 다크 테마는 밤하늘, 라이트 테마는 인쇄된 성도입니다.

## 미리 보기

```sh
python -m http.server 4317
```

그다음 http://127.0.0.1:4317/ 을 엽니다. 어떤 정적 서버를 써도 됩니다.

## 별 데이터

- 위치와 등급: [d3-celestial](https://github.com/ofrohn/d3-celestial)의 `data/stars.6.json`(Olaf Frohn, BSD-3-Clause). Hipparcos 기반, J2000 적도 좌표입니다.
- 별자리 선: d3-celestial의 `data/constellations.lines.json` 중 `Psc`(BSD-3-Clause).
- α Psc: RA 02h 02m 02.82s, Dec +02° 45′ 49.5″, V 3.82. IAU WGSN이 2016-08-21에 A성의 이름을 Alrescha로 승인했습니다.
- 표기한 별 이름: IAU WGSN 이름만 씁니다.

d3-celestial BSD-3-Clause 고지: Copyright (c) 2015, Olaf Frohn. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the conditions of the BSD 3-Clause License are met.

## 글꼴

모든 글꼴은 공식 CDN에서 불러옵니다. 이 저장소에는 글꼴 파일이 없습니다.

| 글꼴 | 쓰임 | 라이선스 |
| --- | --- | --- |
| Pretendard | 본문 | SIL Open Font License 1.1 |
| 마루 부리 | 한글 제목 | 네이버 글꼴 라이선스(상업 이용 가능, 글꼴 판매 금지) |
| Newsreader | 라틴 제목·별 이름 | SIL Open Font License 1.1 |
| JetBrains Mono | 좌표·코드 | SIL Open Font License 1.1 |
| Noto Serif KR | 마루 부리 대체 | SIL Open Font License 1.1 |

## 이 페이지가 지키는 것

- 측정하지 않은 효율 수치는 쓰지 않습니다.
- 가격은 아직 정하지 않았으므로 싣지 않습니다.
- `verified`는 실행 증거가 있을 때만 씁니다. 원본 코드는 저장하지 않습니다.

로고와 페이지 디자인의 권리는 Alrescha에 있습니다. 별 데이터와 글꼴은 위 라이선스를 따릅니다.
