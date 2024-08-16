# 성능 개선 보고서

| AS-IS | TO-BE |
| --- | --- |
| <img width="450" alt="image" src="https://github.com/user-attachments/assets/7d732225-8933-40e8-8c28-3b339b88751d"> | <img width="450" alt="image" src="https://github.com/user-attachments/assets/68d46ccf-5782-4f13-b0f5-490c90b8e7a1"> |

| 성능 개선 사항 | 개선된 지표 | 개선 방법 | 성능 지표 변화 |
| --- | --- | --- | --- |
| 차세대 형식을 사용해 이미지 제공하기 | LCP, FCP | jpg, png → webp 변경
서버에서 받아오는 이미지 webp 변경 | 30 → 50 (+20) |
| 반응형 이미지 표시 |  |  | 50 → 55 (+5) |
| 이미지에 width, height 값 주기 | CLS |  | 55 → 67 (+12) |
| country banner 이동 방지 | CLS |  | 67 → 52 (-15) |
| 오픈 스크린 이미지 지연하기 | LCP, FCP |  | 52 → 63 (+11) |
| 자바스크립트 실행 시간 단축 & 기본 스레드 작업 최소화 하기 | TBT |  | 63 → 87 (+14) |
| 무거운 연산 개선하기 | TBT |  | 87 → 87 (-) |
| 작업을 작은 단위로 나누고 비동기적으로 처리 | TBT |  | 87 → 87 (-) |
| 렌더링 차단 리소스 제거하기 | LCP, FCP | 폰트 직접 호스팅 | 87 → 93 (+6) |
| 랜더링 차단 리소스 제거하기 | LCP, FCP | 스크립트 실행 지연 및 DOM 로딩 완료 후 실행 보장 | 93 → 96 (+3) |
| 이미지 크기 적절하게 설정하기 | LCP, FCP |  | 96 → 97 (+1) |

1. LCP (Largest Contentful Paint): 주요 콘텐츠 로딩 속도, 가장 큰 콘텐츠 요소의 렌더링 시점 측정
2. TBT (Total Blocking Time) : 페이지 응답성 평가, 페이지 렌더링 후 상호작용 가능 시점까지의 차단 시간 합산
3. CLS (Cumulative Layout Shift) : 시각적 안정성 평가, 페이지 로드 중 예기치 않은 레이아웃 이동 정도 측정
4. SI (Speed Index) : 전체적인 페이지 로딩 속도, 페이지 콘텐츠의 시각적 로딩 속도 측정
5. FCP (First Contentful Paint) : 사용자의 페이지 로딩 시작 인식 순간, 첫 번째 콘텐츠 렌더링 시점 측정
